require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Store chat sessions in memory (in production, use Redis or database)
const chatSessions = new Map();

// Clean up old sessions periodically (24 hours)
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of chatSessions.entries()) {
        if (now - session.lastUsed > 24 * 60 * 60 * 1000) {
            chatSessions.delete(sessionId);
        }
    }
}, 60 * 60 * 1000); // Clean up every hour

const createSystemPrompt = () => {
    return `You are an expert educational assistant that helps break down complex concepts into prerequisite knowledge areas. Your goal is to identify what someone needs to understand BEFORE they can grasp the concept they're asking about.

Rules:
1. Always respond with a valid JSON array of strings
2. Each string should be a prerequisite knowledge area or fundamental concept
3. Focus on foundational knowledge that builds toward understanding the target concept
4. Order items by the recommended learning sequence
5. Each item should be specific enough to be useful but broad enough to be broken down further
6. Consider the learning path context - if this is a deep dive from a broader topic, make the breakdown more specific
7. Avoid trivial or overly obvious items
// 8. Focus on conceptual understanding rather than practical steps

Format: Return ONLY a JSON array like ["concept 1", "concept 2", "concept 3"]`;
};

const generateBreakdown = async (concept, learningPath = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        // Create or get existing chat session
        const sessionKey = learningPath.join(' -> ') || 'root';
        let chatSession;

        if (chatSessions.has(sessionKey)) {
            chatSession = chatSessions.get(sessionKey).chat;
            chatSessions.get(sessionKey).lastUsed = Date.now();
        } else {
            chatSession = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: createSystemPrompt() }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'I understand. I will help break down concepts into prerequisite knowledge areas, responding only with JSON arrays of foundational concepts that someone needs to understand first. I will consider the learning path context to make breakdowns more specific when diving deeper into topics.' }]
                    }
                ]
            });

            chatSessions.set(sessionKey, {
                chat: chatSession,
                lastUsed: Date.now()
            });
        }

        // Create contextual prompt
        let prompt;
        if (learningPath.length > 0) {
            const pathString = learningPath.join(' → ');
            prompt = `Learning path so far: ${pathString}

Now I want to understand: "${concept}"

Given this learning journey, what specific prerequisite knowledge do I need to understand "${concept}" in the context of ${learningPath[0]}${learningPath [1] ? ` and ${learningPath[learningPath.length - 1]}` : ''}?

Provide a focused breakdown that considers where I am in my learning journey.`;
        } else {
            prompt = `What do I need to know to understand: "${concept}"?

Provide the fundamental prerequisite knowledge areas.`;
        }

        const result = await chatSession.sendMessage(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
};

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
}

// API endpoint for concept breakdown
app.post('/api/breakdown', async (req, res) => {
    try {
        const { concept, learningPath = [] } = req.body;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        console.log(`Breaking down: "${concept}" with learning path: [${learningPath.join(' → ')}]`);

        const text = await generateBreakdown(concept, learningPath);

        // Clean the response to ensure it's valid JSON
        let cleanedText = text.trim();

        // Remove any markdown formatting
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Remove any extra text before or after the JSON array
        const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            cleanedText = arrayMatch[0];
        }

        let breakdown;
        try {
            breakdown = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Raw response:', text);
            console.error('Cleaned text:', cleanedText);

            // Fallback: try to extract individual items
            const fallbackItems = cleanedText
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^["\s\-\*\d\.]+|["\s,]+$/g, '').trim())
                .filter(item => item.length > 0)
                .slice(0, 8);

            if (fallbackItems.length > 0) {
                breakdown = fallbackItems;
            } else {
                throw new Error('Could not parse response as array');
            }
        }

        if (!Array.isArray(breakdown)) {
            throw new Error('Response is not an array');
        }

        // Ensure we have valid strings
        breakdown = breakdown
            .filter(item => typeof item === 'string' && item.trim().length > 0)
            .map(item => item.trim())
            .slice(0, 8); // Limit to 8 items

        if (breakdown.length === 0) {
            throw new Error('No valid knowledge areas found in response');
        }

        res.json({ breakdown });

    } catch (error) {
        console.error('Error in /api/breakdown:', error);
        res.status(500).json({
            error: 'Failed to generate knowledge breakdown',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!GEMINI_API_KEY,
        activeSessions: chatSessions.size
    });
});

// Clear chat history endpoint
app.post('/api/clear-history', (req, res) => {
    const { learningPath = [] } = req.body;
    const sessionKey = learningPath.join(' -> ') || 'root';

    if (chatSessions.has(sessionKey)) {
        chatSessions.delete(sessionKey);
        console.log(`Cleared chat history for session: ${sessionKey}`);
    }

    res.json({ success: true, cleared: sessionKey });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

    if (!GEMINI_API_KEY) {
        console.warn('⚠️  WARNING: GEMINI_API_KEY environment variable is not set');
        console.log('   Please set your API key in a .env file');
    } else {
        console.log('✅ Gemini API key configured');
    }
});
