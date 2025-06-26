const express = require('express');
const { optionalAuth } = require('../middleware/auth.middleware');
const AIService = require('../services/ai.service');

const router = express.Router();
const aiService = new AIService();

// API endpoint for concept breakdown with priorities
router.post('/breakdown', optionalAuth, async (req, res) => {
    try {
        const { concept, learningPath = [] } = req.body;
        const userId = req.user?._id;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        console.log(`Breaking down: "${concept}" with learning path: [${learningPath.join(' → ')}] for user: ${userId || 'anonymous'}`);

        const { breakdown, priorities } = await aiService.generateBreakdownWithPriorities(concept, learningPath, userId);

        res.json({ breakdown, priorities });

    } catch (error) {
        console.error('Error in /api/breakdown:', error);
        res.status(500).json({
            error: 'Failed to generate knowledge breakdown',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API endpoint for bulk importance generation
router.post('/bulk-importance', optionalAuth, async (req, res) => {
    try {
        const { concepts, learningPath = [] } = req.body;
        const userId = req.user?._id;

        if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
            return res.status(400).json({ error: 'Concepts array is required' });
        }

        console.log(`Generating bulk importance for: [${concepts.join(', ')}] with learning path: [${learningPath.join(' → ')}] for user: ${userId || 'anonymous'}`);

        const importance = await aiService.generateBulkImportance(concepts, learningPath, userId);

        res.json({ importance });

    } catch (error) {
        console.error('Error in /api/bulk-importance:', error);
        res.status(500).json({
            error: 'Failed to generate importance explanations',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API endpoint for content generation (overview, research_guide)
router.post('/content', optionalAuth, async (req, res) => {
    try {
        const { concept, action, learningPath = [], summary } = req.body;
        const userId = req.user?._id;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        // Updated to accept summary, overview, and research_guide
        if (!action || !['summary', 'overview', 'research_guide'].includes(action)) {
            return res.status(400).json({ error: 'Valid action is required (summary, overview, research_guide)' });
        }

        console.log(`Generating ${action} for: "${concept}" with learning path: [${learningPath.join(' → ')}] for user: ${userId || 'anonymous'}`);

        const content = await aiService.generateContent(concept, action, learningPath, userId, summary);
        const cleanedContent = aiService.cleanContent(content);

        if (!cleanedContent || cleanedContent.length < 50) {
            throw new Error(`Generated ${action} content is too short or empty`);
        }

        res.json({ content: cleanedContent });

    } catch (error) {
        console.error(`Error in /api/content (${req.body.action}):`, error);
        res.status(500).json({
            error: `Failed to generate ${req.body.action || 'content'}`,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Clear chat history endpoint
router.post('/clear-history', optionalAuth, (req, res) => {
    const { learningPath = [] } = req.body;
    const userId = req.user?._id;

    const result = aiService.clearSessions(userId, learningPath);

    console.log(`Cleared ${result.clearedSessions} chat sessions for user: ${userId || 'anonymous'}, path: ${result.sessionKey}`);
    res.json({
        success: true,
        cleared: result.sessionKey,
        sessionsCleared: result.clearedSessions
    });
});

// API endpoint for getting more concepts (expanding breadth)
router.post('/more-concepts', optionalAuth, async (req, res) => {
    try {
        const { concept, existingConcepts, learningPath = [] } = req.body;
        const userId = req.user?._id;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        if (!existingConcepts || !Array.isArray(existingConcepts)) {
            return res.status(400).json({ error: 'Existing concepts array is required' });
        }

        console.log(`Getting more concepts for: "${concept}" with existing: [${existingConcepts.join(', ')}], learning path: [${learningPath.join(' → ')}] for user: ${userId || 'anonymous'}`);

        const { breakdown, priorities } = await aiService.generateMoreConcepts(concept, existingConcepts, learningPath, userId);

        res.json({ breakdown, priorities });

    } catch (error) {
        console.error('Error in /api/more-concepts:', error);
        res.status(500).json({
            error: 'Failed to generate more concepts',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API endpoint for chat initialization
router.post('/chat/initialize', optionalAuth, async (req, res) => {
    try {
        const { concept, learningPath = [] } = req.body;
        const userId = req.user?._id;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        console.log(`Initializing chat for: "${concept}" with learning path: [${learningPath.join(' → ')}] for user: ${userId || 'anonymous'}`);

        const welcomeMessage = await aiService.initializeChat(concept, learningPath, userId);

        res.json({ welcomeMessage });

    } catch (error) {
        console.error('Error in /api/chat/initialize:', error);
        res.status(500).json({
            error: 'Failed to initialize chat',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API endpoint for chat messages
router.post('/chat/message', optionalAuth, async (req, res) => {
    try {
        const { concept, learningPath = [], message, conversationHistory = [] } = req.body;
        const userId = req.user?._id;

        if (!concept || !message) {
            return res.status(400).json({ error: 'Concept and message are required' });
        }

        console.log(`Chat message for: "${concept}" with learning path: [${learningPath.join(' → ')}] from user: ${userId || 'anonymous'}`);

        const response = await aiService.processChatMessage(concept, learningPath, message, conversationHistory, userId);

        res.json({ response });

    } catch (error) {
        console.error('Error in /api/chat/message:', error);
        res.status(500).json({
            error: 'Failed to process chat message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// API endpoint for chat session recovery
router.post('/chat/recover', optionalAuth, async (req, res) => {
    try {
        const { concept, learningPath = [] } = req.body;
        const userId = req.user?._id;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        console.log(`Recovering chat session for: "${concept}" with learning path: [${learningPath.join(' → ')}] for user: ${userId || 'anonymous'}`);

        const result = await aiService.recoverChatSession(concept, learningPath, userId);

        res.json(result);

    } catch (error) {
        console.error('Error in /api/chat/recover:', error);
        res.status(500).json({
            error: 'Failed to recover chat session',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.GEMINI_API_KEY,
        activeSessions: aiService.getSessionCount()
    });
});

module.exports = router;
