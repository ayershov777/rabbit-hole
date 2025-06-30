const { GoogleGenerativeAI } = require('@google/generative-ai');

class EmbeddingService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    }

    /**
     * Expand and normalize profile text using AI for better matching
     * @param {string} originalText - Original user input
     * @param {string} fieldType - Type of field (whoYouAre, whoYouAreLookingFor, etc.)
     * @returns {Promise<string>} - Expanded text for embedding
     */
    async expandProfileText(originalText, fieldType) {
        try {
            if (!originalText || originalText.trim().length === 0) {
                return '';
            }

            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

            let prompt;
            switch (fieldType) {
                case 'whoYouAre':
                    prompt = `Expand and normalize this self-description for better peer matching. Add related terms, expand abbreviations, and include synonymous professional titles/roles. Keep it comprehensive but concise (100-150 words).

Original: "${originalText}"

Expanded description:`;
                    break;

                case 'whoYouAreLookingFor':
                    prompt = `Expand this description of who someone is looking for. Add related terms, synonymous titles, and expand on the type of help/mentorship they want. Include various ways the same concept might be expressed (100-150 words).

Original: "${originalText}"

Expanded description:`;
                    break;

                case 'mentoringSubjects':
                    prompt = `Expand this list of mentoring subjects. Add related topics, alternative names for technologies/concepts, and broader categories. Include synonymous terms and related skills (80-120 words).

Original: "${originalText}"

Expanded subjects:`;
                    break;

                case 'professionalServices':
                    prompt = `Expand this description of professional services. Add related service types, alternative names, and broader categories of professional help. Include synonymous terms (80-120 words).

Original: "${originalText}"

Expanded services:`;
                    break;

                default:
                    prompt = `Expand and normalize this text for better semantic matching. Add related terms and synonymous expressions while keeping the core meaning (100-150 words).

Original: "${originalText}"

Expanded text:`;
            }

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let expandedText = response.text().trim();

            // Clean up the response
            expandedText = expandedText
                .replace(/^(Expanded description:|Expanded subjects:|Expanded services:|Expanded text:)\s*/i, '')
                .replace(/^["']|["']$/g, '') // Remove surrounding quotes
                .trim();

            return expandedText || originalText; // Fallback to original if expansion fails

        } catch (error) {
            console.error('Error expanding profile text:', error);
            return originalText; // Fallback to original text
        }
    }

    /**
     * Generate embedding for a text
     * @param {string} text - Text to generate embedding for
     * @returns {Promise<number[]>} - Embedding vector
     */
    async generateEmbedding(text) {
        try {
            if (!text || text.trim().length === 0) {
                return null;
            }

            const result = await this.model.embedContent(text.trim());
            return result.embedding.values;

        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    /**
     * Generate embeddings for multiple texts
     * @param {string[]} texts - Array of texts
     * @returns {Promise<(number[]|null)[]>} - Array of embedding vectors
     */
    async generateMultipleEmbeddings(texts) {
        try {
            const embeddings = await Promise.all(
                texts.map(text => this.generateEmbedding(text))
            );
            return embeddings;
        } catch (error) {
            console.error('Error generating multiple embeddings:', error);
            throw error;
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     * @param {number[]} vectorA 
     * @param {number[]} vectorB 
     * @returns {number} - Similarity score between 0 and 1
     */
    calculateCosineSimilarity(vectorA, vectorB) {
        if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Calculate multiple similarities between one vector and array of vectors
     * @param {number[]} targetVector 
     * @param {number[][]} compareVectors 
     * @returns {number[]} - Array of similarity scores
     */
    calculateMultipleSimilarities(targetVector, compareVectors) {
        return compareVectors.map(vector =>
            this.calculateCosineSimilarity(targetVector, vector)
        );
    }

    /**
     * Preprocess text for better embedding quality
     * @param {string} text 
     * @returns {string} - Cleaned text
     */
    preprocessText(text) {
        if (!text) return '';

        return text
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
            .slice(0, 2048); // Limit length for embedding model
    }
}

module.exports = EmbeddingService;
