const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.chatSessions = new Map();

        // Clean up old sessions periodically (24 hours)
        setInterval(() => {
            const now = Date.now();
            for (const [sessionId, session] of this.chatSessions.entries()) {
                if (now - session.lastUsed > 24 * 60 * 60 * 1000) {
                    this.chatSessions.delete(sessionId);
                }
            }
        }, 60 * 60 * 1000); // Clean up every hour
    }

    createBreakdownSystemPrompt() {
        return `You are an expert educational assistant that helps break down complex concepts into prerequisite knowledge areas. Your goal is to identify what someone needs to understand BEFORE they can grasp the concept they're asking about.

Rules:
1. Always respond with a valid JSON array of strings
2. Each string should be a prerequisite knowledge area or fundamental concept
3. Focus on foundational knowledge that builds toward understanding the target concept
4. Order items by the recommended learning sequence
5. Each item should be specific enough to be useful but broad enough to be broken down further
6. Consider the learning path context - if this is a deep dive from a broader topic, make the breakdown more specific
7. Avoid trivial or overly obvious items
8. Focus on conceptual understanding rather than practical steps

Format: Return ONLY a JSON array like ["concept 1", "concept 2", "concept 3"]`;
    }

    createImportanceSystemPrompt() {
        return `You are an expert educational assistant that explains why concepts are important and valuable to learn. Your goal is to help learners understand the significance, benefits, and real-world applications of concepts.

Rules:
1. Provide a clear, engaging explanation of why the concept is important
2. Include practical applications and real-world relevance
3. Explain how it connects to broader fields or other concepts
4. Highlight career or academic benefits where applicable
5. Use concrete examples when possible
6. Make it motivating and inspiring for the learner
7. Consider the learning path context to provide relevant importance
8. Keep the response concise and focused - aim for 2-3 short paragraphs maximum
9. Be specific and actionable rather than overly general

Format: Return a concise but compelling explanation (2-3 paragraphs, about 150-200 words) that motivates learning this concept.`;
    }

    createOverviewSystemPrompt() {
        return `You are an expert educational assistant that provides clear, comprehensive overviews of concepts. Your goal is to give learners a solid understanding of what the concept is, its key components, and how it works.

Rules:
1. Provide a clear, well-structured overview of the concept
2. Include the main components, principles, or aspects
3. Explain how different parts relate to each other
4. Use accessible language appropriate for someone learning this topic
5. Include relevant examples or analogies when helpful
6. Consider the learning path context to provide appropriate depth
7. Focus on understanding rather than memorization
8. Keep it comprehensive but digestible - aim for 2-3 short paragraphs maximum
9. Be specific and informative rather than overly broad

Format: Return a well-organized explanation (2-3 paragraphs, about 150-200 words) that gives a thorough but concise overview of the concept.`;
    }

    async generateBreakdown(concept, learningPath = [], userId = null) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            // Create or get existing chat session (include userId for personalization)
            const sessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ') || 'root'}`;
            let chatSession;

            if (this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
            } else {
                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: this.createBreakdownSystemPrompt() }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'I understand. I will help break down concepts into prerequisite knowledge areas, responding only with JSON arrays of foundational concepts that someone needs to understand first. I will consider the learning path context to make breakdowns more specific when diving deeper into topics.' }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId
                });
            }

            // Create contextual prompt
            let prompt;
            if (learningPath.length > 0) {
                const pathString = learningPath.join(' → ');
                prompt = `Learning path so far: ${pathString}

Now I want to understand: "${concept}"

Given this learning journey, what specific prerequisite knowledge do I need to understand "${concept}" in the context of ${learningPath[0]}${learningPath[1] ? ` and ${learningPath[learningPath.length - 1]}` : ''}?

Provide a focused breakdown that considers where I am in my learning journey.`;
            } else {
                prompt = `What do I need to know to understand: "${concept}"?

Provide the fundamental prerequisite knowledge areas.`;
            }

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error('Error generating breakdown:', error);
            throw error;
        }
    }

    async generateContent(concept, action, learningPath = [], userId = null) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            // Create session key for content generation
            const sessionKey = `${userId || 'anonymous'}_${action}_${learningPath.join(' -> ')}_${concept}`;
            let chatSession;

            if (this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
            } else {
                const systemPrompt = action === 'importance'
                    ? this.createImportanceSystemPrompt()
                    : this.createOverviewSystemPrompt();

                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: systemPrompt }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: `I understand. I will provide ${action === 'importance' ? 'concise explanations of why concepts are important and valuable to learn' : 'comprehensive but concise overviews of concepts'}, keeping responses to 2-3 short paragraphs (150-200 words) and considering the learning context.` }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId
                });
            }

            // Create contextual prompt
            let prompt;
            if (action === 'importance') {
                if (learningPath.length > 0) {
                    const pathString = learningPath.join(' → ');
                    prompt = `Learning path so far: ${pathString}

I'm learning about: "${concept}"

Why is "${concept}" important to understand, especially in the context of my learning journey toward ${learningPath[0]}? What are the key practical benefits and real-world applications? Keep it concise but compelling (2-3 short paragraphs, about 150-200 words).`;
                } else {
                    prompt = `Why is "${concept}" important to learn? What are the key practical benefits, real-world applications, and how does it connect to other important areas? Keep it concise but compelling (2-3 short paragraphs, about 150-200 words).`;
                }
            } else { // overview
                if (learningPath.length > 0) {
                    const pathString = learningPath.join(' → ');
                    prompt = `Learning path so far: ${pathString}

I want to understand: "${concept}"

Please provide a concise overview of "${concept}" that's relevant to my learning journey toward ${learningPath[0]}. What are the key components, principles, and how does it work? Keep it comprehensive but digestible (2-3 short paragraphs, about 150-200 words).`;
                } else {
                    prompt = `Please provide a concise overview of "${concept}". What are the key components, principles, and how does it work? Help me understand what this concept is all about. Keep it comprehensive but digestible (2-3 short paragraphs, about 150-200 words).`;
                }
            }

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error(`Error generating ${action}:`, error);
            throw error;
        }
    }

    clearSessions(userId = null, learningPath = []) {
        const sessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ') || 'root'}`;
        let clearedSessions = 0;

        // Clear the main breakdown session
        if (this.chatSessions.has(sessionKey)) {
            this.chatSessions.delete(sessionKey);
            clearedSessions++;
        }

        // Clear any related content sessions for this user
        const keysToDelete = [];
        for (const key of this.chatSessions.keys()) {
            if (key.includes(sessionKey) || (userId && key.startsWith(`${userId}_`))) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.chatSessions.delete(key);
            clearedSessions++;
        });

        return { sessionKey, clearedSessions };
    }

    getSessionCount() {
        return this.chatSessions.size;
    }

    parseBreakdownResponse(text) {
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

        return breakdown;
    }

    cleanContent(content) {
        // Clean up the content (remove excessive whitespace, ensure proper formatting)
        return content
            .trim()
            .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\. /g, '. ') // Ensure proper sentence spacing
            .trim();
    }
}

module.exports = AIService;
