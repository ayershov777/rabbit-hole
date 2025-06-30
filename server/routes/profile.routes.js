const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const UserProfile = require('../models/userProfile.model');
const EmbeddingService = require('../services/embedding.service');
const MatchingService = require('../services/matching.service');

const router = express.Router();
const embeddingService = new EmbeddingService();
const matchingService = new MatchingService();

// Get current user's profile
router.get('/profile', auth, async (req, res) => {
    try {
        let profile = await UserProfile.findOne({ userId: req.user._id });

        if (!profile) {
            // Create default profile
            profile = new UserProfile({
                userId: req.user._id,
                whoYouAre: { text: '', embedding: [], lastUpdated: new Date() },
                whoYouAreLookingFor: { text: '', embedding: [], lastUpdated: new Date() },
                mentoringSubjects: { text: '', embedding: [], lastUpdated: new Date() },
                professionalServices: { text: '', embedding: [], lastUpdated: new Date() }
            });
            await profile.save();
        }

        res.json({
            profile: profile.getPublicProfile(),
            isComplete: profile.isComplete()
        });

    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { whoYouAre, whoYouAreLookingFor, mentoringSubjects, professionalServices } = req.body;

        let profile = await UserProfile.findOne({ userId: req.user._id });
        if (!profile) {
            profile = new UserProfile({ userId: req.user._id });
        }

        const updates = {};
        const fieldsToExpand = [];

        // Prepare texts for expansion and embedding
        if (whoYouAre !== undefined) {
            const cleanText = embeddingService.preprocessText(whoYouAre);
            updates['whoYouAre.text'] = cleanText;
            updates['whoYouAre.lastUpdated'] = new Date();
            if (cleanText) {
                fieldsToExpand.push({
                    field: 'whoYouAre',
                    text: cleanText,
                    type: 'whoYouAre'
                });
            }
        }

        if (whoYouAreLookingFor !== undefined) {
            const cleanText = embeddingService.preprocessText(whoYouAreLookingFor);
            updates['whoYouAreLookingFor.text'] = cleanText;
            updates['whoYouAreLookingFor.lastUpdated'] = new Date();
            if (cleanText) {
                fieldsToExpand.push({
                    field: 'whoYouAreLookingFor',
                    text: cleanText,
                    type: 'whoYouAreLookingFor'
                });
            }
        }

        if (mentoringSubjects !== undefined) {
            const cleanText = embeddingService.preprocessText(mentoringSubjects);
            updates['mentoringSubjects.text'] = cleanText;
            updates['mentoringSubjects.lastUpdated'] = new Date();
            if (cleanText) {
                fieldsToExpand.push({
                    field: 'mentoringSubjects',
                    text: cleanText,
                    type: 'mentoringSubjects'
                });
            }
        }

        if (professionalServices !== undefined) {
            const cleanText = embeddingService.preprocessText(professionalServices);
            updates['professionalServices.text'] = cleanText;
            updates['professionalServices.lastUpdated'] = new Date();
            if (cleanText) {
                fieldsToExpand.push({
                    field: 'professionalServices',
                    text: cleanText,
                    type: 'professionalServices'
                });
            }
        }

        // Expand texts using AI for better matching
        console.log(`Expanding ${fieldsToExpand.length} profile fields for user ${req.user._id}`);
        for (const fieldData of fieldsToExpand) {
            try {
                console.log(`Expanding ${fieldData.type}: "${fieldData.text}"`);
                const expandedText = await embeddingService.expandProfileText(fieldData.text, fieldData.type);
                console.log(`Expanded to: "${expandedText}"`);

                updates[`${fieldData.field}.expandedText`] = expandedText;

                // Generate embedding from expanded text
                const embedding = await embeddingService.generateEmbedding(expandedText);
                if (embedding) {
                    updates[`${fieldData.field}.embedding`] = embedding;
                }
            } catch (error) {
                console.error(`Error processing ${fieldData.type}:`, error);
                // Fall back to original text for embedding
                const embedding = await embeddingService.generateEmbedding(fieldData.text);
                if (embedding) {
                    updates[`${fieldData.field}.embedding`] = embedding;
                    updates[`${fieldData.field}.expandedText`] = fieldData.text;
                }
            }
        }

        // Update profile
        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updates },
            { new: true, upsert: true }
        );

        // Update matches in background
        process.nextTick(() => {
            matchingService.updateUserMatches(req.user._id);
        });

        res.json({
            profile: updatedProfile.getPublicProfile(),
            isComplete: updatedProfile.isComplete()
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get matches for current user
router.get('/matches', auth, async (req, res) => {
    try {
        const matches = await matchingService.findMatches(req.user._id);
        res.json({ matches });

    } catch (error) {
        console.error('Error getting matches:', error);
        res.status(500).json({ error: 'Failed to get matches' });
    }
});

// Get active users
router.get('/active-users', auth, async (req, res) => {
    try {
        const activeUsers = await matchingService.getActiveUsers(req.user._id);
        res.json({ activeUsers });

    } catch (error) {
        console.error('Error getting active users:', error);
        res.status(500).json({ error: 'Failed to get active users' });
    }
});

// Update online status
router.put('/status', auth, async (req, res) => {
    try {
        const { isOnline, isAvailableForChat } = req.body;

        const updates = {
            lastSeen: new Date()
        };

        if (isOnline !== undefined) {
            updates.isOnline = isOnline;
        }

        if (isAvailableForChat !== undefined) {
            updates.isAvailableForChat = isAvailableForChat;
        }

        const profile = await UserProfile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updates },
            { new: true, upsert: true }
        );

        res.json({
            success: true, status: {
                isOnline: profile.isOnline,
                isAvailableForChat: profile.isAvailableForChat,
                lastSeen: profile.lastSeen
            }
        });

    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Get specific user profile (public info only)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const profile = await UserProfile.findOne({
            userId: req.params.userId
        }).populate('userId', 'username');

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({
            user: profile.userId,
            profile: profile.getPublicProfile()
        });

    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Re-process profile for better matching (re-expand and re-embed existing text)
router.post('/reprocess-profile', auth, async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const updates = {};
        const fieldsToProcess = [
            { field: 'whoYouAre', type: 'whoYouAre' },
            { field: 'whoYouAreLookingFor', type: 'whoYouAreLookingFor' },
            { field: 'mentoringSubjects', type: 'mentoringSubjects' },
            { field: 'professionalServices', type: 'professionalServices' }
        ];

        console.log(`Re-processing profile for user ${req.user._id}`);

        for (const fieldData of fieldsToProcess) {
            const originalText = profile[fieldData.field]?.text;
            if (originalText && originalText.trim()) {
                try {
                    console.log(`Re-expanding ${fieldData.type}: "${originalText}"`);
                    const expandedText = await embeddingService.expandProfileText(originalText, fieldData.type);
                    console.log(`Re-expanded to: "${expandedText}"`);

                    updates[`${fieldData.field}.expandedText`] = expandedText;
                    updates[`${fieldData.field}.lastUpdated`] = new Date();

                    // Generate new embedding from expanded text
                    const embedding = await embeddingService.generateEmbedding(expandedText);
                    if (embedding) {
                        updates[`${fieldData.field}.embedding`] = embedding;
                    }
                } catch (error) {
                    console.error(`Error re-processing ${fieldData.type}:`, error);
                }
            }
        }

        // Update profile with new expanded texts and embeddings
        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId: req.user._id },
            { $set: updates },
            { new: true }
        );

        // Update matches in background
        process.nextTick(() => {
            matchingService.updateUserMatches(req.user._id);
        });

        res.json({
            success: true,
            message: 'Profile re-processed successfully',
            profile: updatedProfile.getPublicProfile(),
            isComplete: updatedProfile.isComplete()
        });

    } catch (error) {
        console.error('Error re-processing profile:', error);
        res.status(500).json({ error: 'Failed to re-process profile' });
    }
});

module.exports = router;
