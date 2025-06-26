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
        return `You are an expert educational assistant that helps break down complex concepts into their detailed sub-concepts and components. Your goal is to identify the key areas, topics, and aspects that make up the concept someone is asking about.

IMPORTANT: Each request is completely independent. Do not reference any previous concepts or discussions.

Rules:
1. Always respond with a valid JSON array of strings
2. Each string should be a specific sub-concept, component, or detailed aspect of the main concept
3. Focus on breaking the concept into its constituent parts and related areas
4. Order items logically (from fundamental to advanced, or by category)
5. Each item should be specific and meaningful - avoid overly broad or trivial items
6. Consider the learning path context - if diving deeper, provide more specialized sub-concepts
7. Include both theoretical and practical aspects where relevant
8. Aim for comprehensive coverage of the concept's scope
9. Make each sub-concept substantial enough to be explored further
10. TREAT EACH CONCEPT INDEPENDENTLY - do not assume connection to previous requests
11. Strings should be as short as possible while still being meaningful
12. Avoiding parentheses with examples, lists with examples, or explanations in the array

Format: Return ONLY a JSON array like ["sub-concept 1", "sub-concept 2", "sub-concept 3"]`;
    }

    createPrioritySystemPrompt() {
        return `You are an expert educational assistant that evaluates how essential sub-concepts are for achieving a practical, working knowledge of a main topic. Your goal is to assess each sub-concept's priority level based on how necessary it is for someone to understand and effectively use the main concept.

Priority Levels:
1. **Essential** - Core foundation required for any practical use
2. **Important** - Significantly enhances understanding and capability
3. **Useful** - Good to know, provides deeper insight
4. **Advanced** - Specialized knowledge for expert-level mastery

Consider:
- Can someone have a working knowledge of the main topic without understanding this sub-concept?
- Is this sub-concept frequently encountered in practical applications?
- Would lacking this knowledge significantly impair someone's ability to use the main topic effectively?
- Is this more theoretical depth or practical necessity?

Format: Return a JSON object mapping each sub-concept to its priority level (1-4) and a brief reason (10-15 words).
Example: {"concept1": {"level": 1, "reason": "Foundation for all practical applications"}}`;
    }

    createImportanceSystemPrompt() {
        return `You are an expert educational assistant that explains why sub-concepts are important components of the main topic. Your goal is to provide quick, compelling reasons why each sub-concept matters within the broader field.

Rules:
1. Keep responses extremely short - 1-2 sentences maximum (30-50 words)
2. Focus on why this sub-concept is a key component or aspect
3. Explain its role within the broader topic
4. Be specific about its contribution or application
5. Make it clear and motivating
6. Consider the learning path context to provide relevant importance
7. Avoid fluff or unnecessary words
8. Highlight what makes this sub-concept essential

Format: Return ONLY a JSON object mapping each concept to its importance explanation.
Example: {"concept1": "importance text", "concept2": "importance text"}`;
    }

    createOverviewSystemPrompt() {
        return `You are an expert educational assistant that provides clear, comprehensive overviews of concepts and sub-concepts. Your goal is to give learners a solid understanding of what the concept encompasses, its key aspects, and how it works.

Rules:
1. Provide a clear, well-structured overview of the concept
2. Include the main components, principles, or aspects that define it
3. Explain what this concept covers and its scope
4. Use accessible language appropriate for someone learning this topic
5. Include relevant examples or applications when helpful
6. Consider the learning path context to provide appropriate depth
7. Focus on comprehensive understanding of the concept's breadth
8. Keep it thorough but digestible - aim for 2-3 short paragraphs maximum
9. Be specific about what this concept includes and covers

Format: Return a well-organized explanation (2-3 paragraphs, about 150-200 words) that gives a thorough but concise overview of what the concept encompasses.`;
    }

    createSummarySystemPrompt() {
        return `You are an expert educational assistant that provides concise, layman-friendly summaries of concepts. Your goal is to explain what a concept is in simple terms that anyone can understand.

Rules:
1. Keep summaries extremely brief - 1-2 sentences maximum (40-60 words)
2. Use simple, everyday language - avoid jargon
3. Focus on the essence of what the concept is and why it matters
4. Make it engaging and accessible to someone with no background knowledge
5. If the concept is part of a learning path, briefly mention that context
6. Avoid technical details - save those for the overview

Format: Return a single paragraph summary that captures the essence of the concept in layman's terms.`;
    }

    createResearchGuideSystemPrompt() {
        return `You are an expert educational assistant that creates friendly research guides for learners.

Rules:
1. Keep it brief so the user can read it at a glance
2. Focus on practical, actionable steps
3. Suggest specific types of resources to look for (books, courses, articles, videos)
4. Give a optimistic time estimate using: minutes, hours, days, or weeks (don't specify a number)
5. Consider the learning path context to provide targeted guidance

Format: Return a comprehensive research guide organized with clear headings and actionable steps that learners can follow to master the concept systematically.`;
    }

    async generateBreakdownWithPriorities(concept, learningPath = [], userId = null) {
        try {
            // First, get the breakdown
            const breakdownText = await this.generateBreakdown(concept, learningPath, userId);
            const breakdown = this.parseBreakdownResponse(breakdownText);

            // Then, evaluate priorities for all sub-concepts
            const priorities = await this.evaluatePriorities(concept, breakdown, learningPath, userId);

            return { breakdown, priorities };

        } catch (error) {
            console.error('Error generating breakdown with priorities:', error);
            throw error;
        }
    }

    async evaluatePriorities(mainConcept, subConcepts, learningPath = [], userId = null) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            // Create unique session key for priority evaluation
            let baseSessionKey;
            if (learningPath.length === 0) {
                baseSessionKey = `${userId || 'anonymous'}_root_${mainConcept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            } else {
                baseSessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ')}`;
            }

            const sessionKey = `${baseSessionKey}_priority_eval`;
            let chatSession;

            if (this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
                console.log(`Reusing priority evaluation session: ${sessionKey}`);
            } else {
                console.log(`Creating new priority evaluation session: ${sessionKey}`);
                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: this.createPrioritySystemPrompt() }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'I understand. I will evaluate how essential each sub-concept is for achieving practical, working knowledge of the main topic, assigning priority levels 1-4 (Essential, Important, Useful, Advanced) with brief reasons.' }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId,
                    concept: mainConcept,
                    learningPath: [...learningPath]
                });
            }

            let prompt;
            if (learningPath.length > 0) {
                const rootConcept = learningPath[0];
                prompt = `Main goal: Working knowledge of "${rootConcept}"
Current focus: "${mainConcept}" (as part of ${learningPath.join(' → ')})

Evaluate how essential each of these sub-concepts is for someone to have practical, working knowledge of "${mainConcept}" in the context of learning "${rootConcept}":

${subConcepts.map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

For each, consider: Can someone effectively work with "${mainConcept}" without understanding this sub-concept?

Return a JSON object with priority levels (1-4) and brief reasons.`;
            } else {
                prompt = `Main concept: "${mainConcept}"

Evaluate how essential each of these sub-concepts is for someone to have practical, working knowledge of "${mainConcept}":

${subConcepts.map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

For each, consider: Can someone effectively work with "${mainConcept}" without understanding this sub-concept?

Return a JSON object with priority levels (1-4) and brief reasons.`;
            }

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            return this.parsePriorityResponse(response.text(), subConcepts);

        } catch (error) {
            console.error('Error evaluating priorities:', error);
            // Return default priorities if evaluation fails
            const defaultPriorities = {};
            subConcepts.forEach(concept => {
                defaultPriorities[concept] = { level: 2, reason: "Priority evaluation unavailable" };
            });
            return defaultPriorities;
        }
    }

    async generateBreakdown(concept, learningPath = [], userId = null) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            // Create session key - for root level searches, include the concept to make it unique
            let sessionKey;
            if (learningPath.length === 0) {
                // Root level search - make session unique per concept
                sessionKey = `${userId || 'anonymous'}_root_${concept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            } else {
                // Drilling down - use the learning path
                sessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ')}`;
            }

            let chatSession;

            // Only reuse session if we have a learning path AND the session exists
            if (learningPath.length > 0 && this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
                console.log(`Reusing existing session: ${sessionKey}`);
            } else {
                // For root level searches, always create completely fresh session
                if (learningPath.length === 0) {
                    console.log(`Creating fresh session for root concept: ${concept}`);
                    console.log(`Session key: ${sessionKey}`);
                    console.log(`Current active sessions: ${Array.from(this.chatSessions.keys()).join(', ')}`);
                } else {
                    console.log(`Creating new session: ${sessionKey}`);
                }

                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: this.createBreakdownSystemPrompt() }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'I understand. I will help break down concepts into their detailed sub-concepts and components, responding only with JSON arrays of specific areas and aspects that make up the main concept. Each request is completely independent and I will not reference any previous concepts or discussions.' }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId,
                    concept: concept,
                    learningPath: [...learningPath]
                });
            }

            // Create contextual prompt
            let prompt;
            if (learningPath.length > 0) {
                const pathString = learningPath.join(' → ');
                prompt = `Learning path so far: ${pathString}

Now I want to explore: "${concept}"

Given this learning journey, what are the key sub-concepts, components, and detailed aspects that make up "${concept}" in the context of ${learningPath[0]}${learningPath[1] ? ` and ${learningPath[learningPath.length - 1]}` : ''}?

Provide a comprehensive breakdown of the detailed areas within "${concept}".`;
            } else {
                prompt = `Break down the concept: "${concept}"

This is a fresh, independent request. What are the key sub-concepts, components, areas, and detailed aspects that make up this field or topic? Provide a comprehensive overview of what "${concept}" encompasses.

Remember: This is completely independent of any previous requests.`;
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

            // Create unique session key for content generation
            let baseSessionKey;
            if (learningPath.length === 0) {
                baseSessionKey = `${userId || 'anonymous'}_root_${concept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            } else {
                baseSessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ')}`;
            }

            const sessionKey = `${baseSessionKey}_${action}_${concept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            let chatSession;

            if (this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
                console.log(`Reusing content session: ${sessionKey}`);
            } else {
                console.log(`Creating new content session: ${sessionKey}`);
                let systemPrompt;

                switch (action) {
                    case 'summary':
                        systemPrompt = this.createSummarySystemPrompt();
                        break;
                    case 'importance':
                        systemPrompt = this.createImportanceSystemPrompt();
                        break;
                    case 'research_guide':
                        systemPrompt = this.createResearchGuideSystemPrompt();
                        break;
                    default:
                        systemPrompt = this.createOverviewSystemPrompt();
                }

                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: systemPrompt }]
                        },
                        {
                            role: 'model',
                            parts: [{
                                text: `I understand. I will provide ${action === 'summary' ? 'extremely concise summaries (1-2 sentences, 40-60 words) in simple layman terms' :
                                    action === 'importance' ? 'extremely concise explanations (1-2 sentences, 30-50 words) of why sub-concepts are important components' :
                                        action === 'research_guide' ? 'comprehensive research guides (400-500 words) with structured learning paths, resources, and actionable steps' :
                                            'comprehensive but concise overviews of concepts (2-3 short paragraphs, 150-200 words)'
                                    }, considering the learning context.`
                            }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId,
                    concept: concept,
                    action: action,
                    learningPath: [...learningPath]
                });
            }

            // Create contextual prompt
            let prompt;
            if (action === 'summary') {
                if (learningPath.length > 0) {
                    const pathString = learningPath.join(' → ');
                    prompt = `Learning path: ${pathString}

Explain "${concept}" in simple terms for someone with no background knowledge. What is it and why does it matter?

Respond with 1-2 sentences maximum (40-60 words) using everyday language.`;
                } else {
                    prompt = `Explain "${concept}" in simple terms for someone with no background knowledge. What is it and why does it matter?

Respond with 1-2 sentences maximum (40-60 words) using everyday language.`;
                }
            } else if (action === 'importance') {
                if (learningPath.length > 0) {
                    const pathString = learningPath.join(' → ');
                    prompt = `Learning path: ${pathString}

Why is "${concept}" an important component/aspect of ${learningPath[0]}? 

Respond with 1-2 sentences maximum (30-50 words). Focus on its role and contribution within the broader field.`;
                } else {
                    prompt = `Why is "${concept}" an important area to understand? 

Respond with 1-2 sentences maximum (30-50 words). Focus on its significance and applications.`;
                }
            } else if (action === 'research_guide') {
                if (learningPath.length > 0) {
                    const pathString = learningPath.join(' → ');
                    prompt = `Learning path so far: ${pathString}

Create a comprehensive research guide for mastering "${concept}" in the context of learning ${learningPath[0]}. 

Structure the guide with:
1. **Learning Sequence** - Step-by-step progression from basics to advanced
2. **Essential Resources** - Types of materials to seek out (books, courses, articles, videos)
3. **Practical Application** - Hands-on exercises, projects, or real-world applications
4. **Common Challenges** - Pitfalls to avoid and difficult concepts to watch for
5. **Progress Assessment** - Ways to test understanding and measure progress
6. **Time Estimates** - Realistic timeframes for different learning phases

Make it actionable and specific to "${concept}" within the broader context of ${learningPath[0]}. Use markdown formatting.`;
                } else {
                    prompt = `Create a comprehensive research guide for mastering "${concept}". 

Structure the guide with:
1. **Learning Sequence** - Step-by-step progression from basics to advanced
2. **Essential Resources** - Types of materials to seek out (books, courses, articles, videos)
3. **Practical Application** - Hands-on exercises, projects, or real-world applications
4. **Common Challenges** - Pitfalls to avoid and difficult concepts to watch for
5. **Progress Assessment** - Ways to test understanding and measure progress
6. **Time Estimates** - Realistic timeframes for different learning phases

Make it actionable and specific to "${concept}". Use markdown formatting.`;
                }
            } else { // overview
                if (learningPath.length > 0) {
                    const pathString = learningPath.join(' → ');
                    prompt = `Learning path so far: ${pathString}

I want to understand: "${concept}"

Please provide a comprehensive overview of "${concept}" and what it encompasses. What are the key aspects, principles, and scope of this area? How does it fit within ${learningPath[0]}? Keep it thorough but digestible (2-3 short paragraphs, about 150-200 words).`;
                } else {
                    prompt = `Please provide a comprehensive overview of "${concept}". What does this field/area encompass? What are the key aspects, principles, and scope? What should someone expect to learn about in this area? Keep it thorough but digestible (2-3 short paragraphs, about 150-200 words).`;
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

    async generateBulkImportance(concepts, learningPath = [], userId = null) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            // Create unique session key for bulk importance
            let baseSessionKey;
            if (learningPath.length === 0) {
                // Use first concept to make it unique for root level
                const firstConcept = concepts[0] || 'unknown';
                baseSessionKey = `${userId || 'anonymous'}_root_${firstConcept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            } else {
                baseSessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ')}`;
            }

            const sessionKey = `${baseSessionKey}_bulk_importance`;
            let chatSession;

            if (this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
                console.log(`Reusing bulk importance session: ${sessionKey}`);
            } else {
                console.log(`Creating new bulk importance session: ${sessionKey}`);
                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: this.createImportanceSystemPrompt() }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'I understand. I will provide extremely concise explanations (1-2 sentences, 30-50 words) of why sub-concepts are important components within the broader topic, focusing on their role and contribution.' }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId,
                    concepts: [...concepts],
                    learningPath: [...learningPath]
                });
            }

            let prompt;
            if (learningPath.length > 0) {
                const pathString = learningPath.join(' → ');
                prompt = `Learning path: ${pathString}

For each of these sub-concepts/components, explain why it's important within ${learningPath[learningPath.length - 1]} (1-2 sentences, 30-50 words each):
${concepts.map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

Return a JSON object mapping each concept name exactly as provided to its importance explanation.`;
            } else {
                prompt = `For each of these concepts/areas, explain why it's important (1-2 sentences, 30-50 words each):
${concepts.map((concept, i) => `${i + 1}. ${concept}`).join('\n')}

Return a JSON object mapping each concept name exactly as provided to its importance explanation.`;
            }

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            return this.parseBulkImportanceResponse(response.text(), concepts);

        } catch (error) {
            console.error('Error generating bulk importance:', error);
            throw error;
        }
    }

    async generateMoreConcepts(concept, existingConcepts, learningPath = [], userId = null) {
        try {
            // First, get more concepts
            const moreBreakdownText = await this.generateMoreBreakdown(concept, existingConcepts, learningPath, userId);
            const moreBreakdown = this.parseBreakdownResponse(moreBreakdownText);

            // Then, evaluate priorities for the new concepts
            const priorities = await this.evaluatePriorities(concept, moreBreakdown, learningPath, userId);

            return { breakdown: moreBreakdown, priorities };

        } catch (error) {
            console.error('Error generating more concepts:', error);
            throw error;
        }
    }

    async generateMoreBreakdown(concept, existingConcepts, learningPath = [], userId = null) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            // Use the same session key as the original breakdown to maintain context
            let sessionKey;
            if (learningPath.length === 0) {
                sessionKey = `${userId || 'anonymous'}_root_${concept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            } else {
                sessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ')}`;
            }

            let chatSession;

            // Try to use existing session to maintain context
            if (this.chatSessions.has(sessionKey)) {
                chatSession = this.chatSessions.get(sessionKey).chat;
                this.chatSessions.get(sessionKey).lastUsed = Date.now();
                console.log(`Using existing session for more concepts: ${sessionKey}`);
            } else {
                // If no session exists, create a new one with context
                console.log(`Creating new session for more concepts: ${sessionKey}`);
                chatSession = model.startChat({
                    history: [
                        {
                            role: 'user',
                            parts: [{ text: this.createBreakdownSystemPrompt() }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'I understand. I will help break down concepts into their detailed sub-concepts and components, responding only with JSON arrays of specific areas and aspects that make up the main concept. Each request is completely independent and I will not reference any previous concepts or discussions.' }]
                        }
                    ]
                });

                this.chatSessions.set(sessionKey, {
                    chat: chatSession,
                    lastUsed: Date.now(),
                    userId: userId,
                    concept: concept,
                    learningPath: [...learningPath]
                });
            }

            // Create prompt to expand breadth, not depth
            let prompt;
            const existingList = existingConcepts.map((item, i) => `${i + 1}. ${item}`).join('\n');

            if (learningPath.length > 0) {
                const pathString = learningPath.join(' → ');
                prompt = `Learning path: ${pathString}

You previously provided these sub-concepts for "${concept}":
${existingList}

Now expand the BREADTH of understanding for "${concept}" in the context of ${learningPath[0]}. Provide additional sub-concepts, components, and detailed aspects that broaden the scope rather than going deeper into existing concepts.

Focus on:
- Different areas or aspects not yet covered
- Related components that expand the overall scope
- Additional dimensions or facets of "${concept}"
- Complementary areas that complete the picture

Avoid duplicating or elaborating on the existing concepts. Expand horizontally, not vertically.

Return ONLY a JSON array of new concepts that expand the breadth.`;
            } else {
                prompt = `You previously provided these sub-concepts for "${concept}":
${existingList}

Now expand the BREADTH of understanding for "${concept}". Provide additional sub-concepts, components, and detailed aspects that broaden the scope rather than going deeper into existing concepts.

Focus on:
- Different areas or aspects not yet covered
- Related components that expand the overall scope
- Additional dimensions or facets of "${concept}"
- Complementary areas that complete the picture

Avoid duplicating or elaborating on the existing concepts. Expand horizontally, not vertically.

Return ONLY a JSON array of new concepts that expand the breadth.`;
            }

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error('Error generating more breakdown:', error);
            throw error;
        }
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

    parseBulkImportanceResponse(text, concepts) {
        try {
            // Only clean code block indicators
            let cleanedText = text.trim();
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            // Extract JSON object
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanedText = jsonMatch[0];
            }

            const importanceData = JSON.parse(cleanedText);

            // Return the data as-is - no manipulation or fallbacks
            return importanceData;

        } catch (error) {
            console.error('Error parsing bulk importance response:', error);
            console.error('Raw response:', text);

            // Return empty object on parse error - let the UI handle missing data gracefully
            return {};
        }
    }

    parsePriorityResponse(text, concepts) {
        try {
            // Clean the response to ensure it's valid JSON
            let cleanedText = text.trim();
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            // Extract JSON object
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanedText = jsonMatch[0];
            }

            const priorityData = JSON.parse(cleanedText);

            // Normalize the response to match our concepts
            const normalizedPriorities = {};
            concepts.forEach(concept => {
                // Try to find a matching key in the response
                const matchingKey = Object.keys(priorityData).find(key =>
                    key.toLowerCase().includes(concept.toLowerCase()) ||
                    concept.toLowerCase().includes(key.toLowerCase())
                );

                if (matchingKey && priorityData[matchingKey]) {
                    normalizedPriorities[concept] = {
                        level: priorityData[matchingKey].level || 2,
                        reason: priorityData[matchingKey].reason || "Important for understanding"
                    };
                } else {
                    // Default if not found
                    normalizedPriorities[concept] = {
                        level: 2,
                        reason: "Important for understanding"
                    };
                }
            });

            return normalizedPriorities;

        } catch (error) {
            console.error('Error parsing priority response:', error);
            // Return default priorities
            const defaultPriorities = {};
            concepts.forEach(concept => {
                defaultPriorities[concept] = { level: 2, reason: "Priority evaluation unavailable" };
            });
            return defaultPriorities;
        }
    }

    clearSessions(userId = null, learningPath = []) {
        // If this is a root level clear (empty learning path), clear ALL sessions for this user
        if (learningPath.length === 0) {
            const keysToDelete = [];
            const userPrefix = `${userId || 'anonymous'}_`;

            for (const key of this.chatSessions.keys()) {
                if (key.startsWith(userPrefix)) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach(key => {
                this.chatSessions.delete(key);
            });

            return { sessionKey: 'all_user_sessions', clearedSessions: keysToDelete.length };
        }

        // Otherwise, clear specific session and related ones
        const sessionKey = `${userId || 'anonymous'}_${learningPath.join(' -> ')}`;
        let clearedSessions = 0;

        // Clear the main breakdown session
        if (this.chatSessions.has(sessionKey)) {
            this.chatSessions.delete(sessionKey);
            clearedSessions++;
        }

        // Clear any related content sessions for this specific path
        const keysToDelete = [];
        for (const key of this.chatSessions.keys()) {
            if (key.includes(sessionKey)) {
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

    cleanContent(content) {
        // Clean up the content (remove excessive whitespace, ensure proper formatting)
        return content
            // .trim()
            // .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
            // .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space (but preserve newlines)
            // .replace(/\. /g, '. ') // Ensure proper sentence spacing
            .trim();
    }
}

module.exports = AIService;
