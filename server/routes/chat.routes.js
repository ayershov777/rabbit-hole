const express = require('express');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Get chat history between two users (placeholder)
router.get('/history/:otherUserId', auth, async (req, res) => {
    try {
        const { otherUserId } = req.params;

        // Placeholder chat history
        const chatHistory = [
            {
                id: 1,
                senderId: req.user._id.toString(),
                receiverId: otherUserId,
                message: "Hi! I saw your profile and thought we might be able to help each other.",
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                isRead: true
            },
            {
                id: 2,
                senderId: otherUserId,
                receiverId: req.user._id.toString(),
                message: "Hello! Yes, I'd be happy to help. What specific areas are you working on?",
                timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
                isRead: true
            },
            {
                id: 3,
                senderId: req.user._id.toString(),
                receiverId: otherUserId,
                message: "I'm particularly struggling with understanding machine learning algorithms. Do you have experience with that?",
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                isRead: true
            },
            {
                id: 4,
                senderId: otherUserId,
                receiverId: req.user._id.toString(),
                message: "Absolutely! I've been working with ML for about 3 years now. What specific algorithms are you looking at?",
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                isRead: false
            }
        ];

        res.json({ chatHistory });

    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({ error: 'Failed to get chat history' });
    }
});

// Get list of active conversations for user
router.get('/conversations', auth, async (req, res) => {
    try {
        // Placeholder conversations
        const conversations = [
            {
                id: 1,
                otherUser: {
                    _id: '60f7b3b3b3b3b3b3b3b3b3b1',
                    username: 'sarah_dev',
                },
                lastMessage: {
                    message: "Absolutely! I've been working with ML for about 3 years now. What specific algorithms are you looking at?",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    senderId: '60f7b3b3b3b3b3b3b3b3b3b1'
                },
                unreadCount: 1,
                isOnline: true
            },
            {
                id: 2,
                otherUser: {
                    _id: '60f7b3b3b3b3b3b3b3b3b3b2',
                    username: 'alex_mentor',
                },
                lastMessage: {
                    message: "Thanks for the help with React hooks!",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    senderId: req.user._id.toString()
                },
                unreadCount: 0,
                isOnline: false
            }
        ];

        res.json({ conversations });

    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ error: 'Failed to get conversations' });
    }
});

// Send message (placeholder - real implementation will use socket.io)
router.post('/send', auth, async (req, res) => {
    try {
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ error: 'Receiver ID and message are required' });
        }

        // Placeholder response
        const sentMessage = {
            id: Date.now(),
            senderId: req.user._id.toString(),
            receiverId,
            message: message.trim(),
            timestamp: new Date(),
            isRead: false
        };

        // TODO: Implement real message sending via socket.io
        console.log('Message sent (placeholder):', sentMessage);

        res.json({ success: true, message: sentMessage });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
