const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Profile answers
    whoYouAre: {
        text: { type: String, default: '' }, // Original user input
        expandedText: { type: String, default: '' }, // AI-expanded version for matching
        embedding: [Number], // Vector embedding from expanded text
        lastUpdated: { type: Date, default: Date.now }
    },

    whoYouAreLookingFor: {
        text: { type: String, default: '' },
        expandedText: { type: String, default: '' },
        embedding: [Number],
        lastUpdated: { type: Date, default: Date.now }
    },

    mentoringSubjects: {
        text: { type: String, default: '' },
        expandedText: { type: String, default: '' },
        embedding: [Number],
        lastUpdated: { type: Date, default: Date.now }
    },

    professionalServices: {
        text: { type: String, default: '' },
        expandedText: { type: String, default: '' },
        embedding: [Number],
        lastUpdated: { type: Date, default: Date.now }
    },

    // Status and preferences
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    isAvailableForChat: { type: Boolean, default: true },

    // Matching metadata
    matches: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        similarity: Number,
        matchType: { type: String, enum: ['mutual', 'seeking', 'offering'] },
        lastCalculated: { type: Date, default: Date.now }
    }],

    // Privacy settings
    visibility: {
        type: String,
        enum: ['public', 'matched_only', 'private'],
        default: 'public'
    }
}, {
    timestamps: true
});

// Indexes for vector similarity search
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ isOnline: 1, isAvailableForChat: 1 });
userProfileSchema.index({ 'matches.userId': 1 });

// Method to get profile summary without embeddings
userProfileSchema.methods.getPublicProfile = function () {
    return {
        userId: this.userId,
        whoYouAre: this.whoYouAre.text,
        whoYouAreLookingFor: this.whoYouAreLookingFor.text,
        mentoringSubjects: this.mentoringSubjects.text,
        professionalServices: this.professionalServices.text,
        isOnline: this.isOnline,
        lastSeen: this.lastSeen,
        isAvailableForChat: this.isAvailableForChat
    };
};

// Method to check if profile is complete
userProfileSchema.methods.isComplete = function () {
    return this.whoYouAre.text.trim().length > 0 &&
        this.whoYouAreLookingFor.text.trim().length > 0;
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
