const UserProfile = require('../models/userProfile.model');
const User = require('../models/user.model');
const EmbeddingService = require('./embedding.service');

class MatchingService {
    constructor() {
        this.embeddingService = new EmbeddingService();
        this.SIMILARITY_THRESHOLD = 0.6; // Lowered threshold for expanded text matching
        this.MAX_MATCHES = 10; // Maximum matches to return
    }

    /**
     * Find matches for a user based on their profile
     * @param {string} userId - User ID to find matches for
     * @returns {Promise<Object[]>} - Array of matched users with similarity scores
     */
    async findMatches(userId) {
        try {
            const userProfile = await UserProfile.findOne({ userId }).populate('userId', 'username email');
            if (!userProfile || !userProfile.isComplete()) {
                return [];
            }

            // Get all other active users with complete profiles
            const otherProfiles = await UserProfile.find({
                userId: { $ne: userId },
                isAvailableForChat: true,
                $and: [
                    { 'whoYouAre.text': { $ne: '' } },
                    { 'whoYouAreLookingFor.text': { $ne: '' } }
                ]
            }).populate('userId', 'username email');

            const matches = [];

            for (const otherProfile of otherProfiles) {
                const matchData = this.calculateUserMatch(userProfile, otherProfile);
                if (matchData.similarity > this.SIMILARITY_THRESHOLD) {
                    matches.push({
                        user: otherProfile.userId,
                        profile: otherProfile.getPublicProfile(),
                        similarity: matchData.similarity,
                        matchType: matchData.matchType,
                        matchReasons: matchData.reasons
                    });
                }
            }

            // Sort by similarity and limit results
            matches.sort((a, b) => b.similarity - a.similarity);
            return matches.slice(0, this.MAX_MATCHES);

        } catch (error) {
            console.error('Error finding matches:', error);
            throw error;
        }
    }

    /**
     * Calculate match score between two user profiles
     * @param {Object} profile1 
     * @param {Object} profile2 
     * @returns {Object} - Match data with similarity score and type
     */
    calculateUserMatch(profile1, profile2) {
        const similarities = [];
        const reasons = [];

        // Use expanded embeddings for better matching quality
        // Compare "who you're looking for" with "who you are"
        const seekingSimilarity = this.embeddingService.calculateCosineSimilarity(
            profile1.whoYouAreLookingFor.embedding,
            profile2.whoYouAre.embedding
        );

        // Compare "who you are" with "who they're looking for"
        const offeringSimilarity = this.embeddingService.calculateCosineSimilarity(
            profile1.whoYouAre.embedding,
            profile2.whoYouAreLookingFor.embedding
        );

        // Compare mentoring subjects for mutual interests
        const subjectSimilarity = this.embeddingService.calculateCosineSimilarity(
            profile1.mentoringSubjects.embedding,
            profile2.mentoringSubjects.embedding
        );

        // Compare professional services
        const servicesSimilarity = this.embeddingService.calculateCosineSimilarity(
            profile1.professionalServices.embedding,
            profile2.professionalServices.embedding
        );

        let matchType = 'general';
        let maxSimilarity = 0;

        console.log(`Matching scores - Seeking: ${seekingSimilarity.toFixed(3)}, Offering: ${offeringSimilarity.toFixed(3)}, Subjects: ${subjectSimilarity.toFixed(3)}, Services: ${servicesSimilarity.toFixed(3)}`);

        // Determine match type and calculate weighted similarity
        if (seekingSimilarity > 0.75 && offeringSimilarity > 0.75) {
            matchType = 'mutual';
            maxSimilarity = (seekingSimilarity + offeringSimilarity) / 2;
            reasons.push('Strong mutual compatibility');
        } else if (seekingSimilarity > maxSimilarity) {
            matchType = 'seeking';
            maxSimilarity = seekingSimilarity;
            reasons.push('They match what you\'re looking for');
        } else if (offeringSimilarity > maxSimilarity) {
            matchType = 'offering';
            maxSimilarity = offeringSimilarity;
            reasons.push('You match what they\'re looking for');
        }

        // Factor in subject similarity
        if (subjectSimilarity > 0.6) {
            maxSimilarity = Math.max(maxSimilarity, subjectSimilarity);
            reasons.push('Overlapping expertise areas');
        }

        // Factor in services similarity
        if (servicesSimilarity > 0.6) {
            maxSimilarity = Math.max(maxSimilarity, servicesSimilarity);
            reasons.push('Similar service offerings');
        }

        // Add detailed similarity reasons based on scores
        if (seekingSimilarity > 0.8) {
            reasons.push('Excellent fit for your learning goals');
        } else if (seekingSimilarity > 0.7) {
            reasons.push('Good match for your needs');
        }

        if (offeringSimilarity > 0.8) {
            reasons.push('You\'re exactly what they need');
        } else if (offeringSimilarity > 0.7) {
            reasons.push('You could be very helpful to them');
        }

        return {
            similarity: maxSimilarity,
            matchType,
            reasons: reasons.slice(0, 3) // Limit to top 3 reasons
        };
    }

    /**
     * Update matches for a user after profile change
     * @param {string} userId - User ID whose profile was updated
     */
    async updateUserMatches(userId) {
        try {
            const matches = await this.findMatches(userId);

            // Update the user's profile with new matches
            await UserProfile.findOneAndUpdate(
                { userId },
                {
                    matches: matches.map(match => ({
                        userId: match.user._id,
                        similarity: match.similarity,
                        matchType: match.matchType,
                        lastCalculated: new Date()
                    }))
                }
            );

            // Also trigger recalculation for users who might match with this user
            this.triggerMatchRecalculation(userId);

            return matches;

        } catch (error) {
            console.error('Error updating user matches:', error);
            throw error;
        }
    }

    /**
     * Trigger match recalculation for other users (background process)
     * @param {string} updatedUserId - User who updated their profile
     */
    async triggerMatchRecalculation(updatedUserId) {
        try {
            // Find users who might be affected by this profile update
            const recentlyActiveUsers = await UserProfile.find({
                userId: { $ne: updatedUserId },
                isAvailableForChat: true,
                lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            }).select('userId');

            // Update matches for recently active users (in background)
            process.nextTick(async () => {
                for (const profile of recentlyActiveUsers) {
                    try {
                        await this.updateUserMatches(profile.userId);
                    } catch (error) {
                        console.error(`Error updating matches for user ${profile.userId}:`, error);
                    }
                }
            });

        } catch (error) {
            console.error('Error triggering match recalculation:', error);
        }
    }

    /**
     * Get active users who are available for chat
     * @param {string} excludeUserId - User ID to exclude from results
     * @returns {Promise<Object[]>} - Array of active users
     */
    async getActiveUsers(excludeUserId) {
        try {
            const activeProfiles = await UserProfile.find({
                userId: { $ne: excludeUserId },
                isOnline: true,
                isAvailableForChat: true
            }).populate('userId', 'username email')
                .sort({ lastSeen: -1 })
                .limit(20);

            return activeProfiles.map(profile => ({
                user: profile.userId,
                profile: profile.getPublicProfile()
            }));

        } catch (error) {
            console.error('Error getting active users:', error);
            throw error;
        }
    }
}

module.exports = MatchingService;
