require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Services
const DatabaseService = require('./services/database.service');

// Routes
const authRoutes = require('./routes/auth.routes');
const breakdownRoutes = require('./routes/breakdown.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
DatabaseService.connect();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', breakdownRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));

    // Serve React app in production
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Environment checks
    const checks = [
        { name: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY, message: 'Gemini AI key configured' },
        { name: 'MONGODB_URI', value: process.env.MONGODB_URI, message: 'MongoDB URI configured' },
        { name: 'JWT_SECRET', value: process.env.JWT_SECRET, message: 'JWT secret configured' }
    ];

    checks.forEach(check => {
        if (!check.value) {
            console.warn(`⚠️  WARNING: ${check.name} environment variable is not set`);
            console.log(`   Please set it in a .env file`);
        } else {
            console.log(`✅ ${check.message}`);
        }
    });

    console.log(`📊 Database connected: ${DatabaseService.getConnectionStatus()}`);
});
