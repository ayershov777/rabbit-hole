const mongoose = require('mongoose');

class DatabaseService {
    static async connect() {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }

    static getConnectionStatus() {
        return mongoose.connection.readyState === 1;
    }

    static async disconnect() {
        try {
            await mongoose.disconnect();
            console.log('📤 Disconnected from MongoDB');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
}

module.exports = DatabaseService;
