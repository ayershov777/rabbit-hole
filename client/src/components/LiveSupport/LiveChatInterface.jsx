import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Avatar,
    IconButton,
    Chip
} from '@mui/material';
import { Send, ArrowLeft, Circle } from 'lucide-react';
import { useLiveSupport } from '../../contexts/LiveSupportContext';

export const ChatInterface = ({ user }) => {
    const {
        chatHistory,
        loadChatHistory,
        setActiveView
    } = useLiveSupport();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // Load chat history when component mounts
    useEffect(() => {
        const loadMessages = async () => {
            if (user && (!chatHistory[user._id] || chatHistory[user._id].length === 0)) {
                await loadChatHistory(user._id);
            }
            if (chatHistory[user._id]) {
                setMessages(chatHistory[user._id]);
            }
        };
        loadMessages();
    }, [user, chatHistory, loadChatHistory]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            senderId: 'currentUser', // This would be replaced with actual user ID
            receiverId: user._id,
            message: message.trim(),
            timestamp: new Date(),
            isRead: false
        };

        // Add message to local state
        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // TODO: Send via socket.io
        console.log('Sending message:', newMessage);

        // Simulate response after 1-2 seconds (remove this in real implementation)
        setTimeout(() => {
            const responseMessage = {
                id: Date.now() + 1,
                senderId: user._id,
                receiverId: 'currentUser',
                message: "Thanks for your message! I'll get back to you soon.",
                timestamp: new Date(),
                isRead: true
            };
            setMessages(prev => [...prev, responseMessage]);
        }, 1500);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const formatMessageTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isCurrentUser = (senderId) => {
        // This would check against actual current user ID
        return senderId === 'currentUser' || senderId !== user._id;
    };

    return (
        <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderBottom: '2px solid #e9ecef',
                bgcolor: '#f8f9fa'
            }}>
                <IconButton
                    onClick={() => setActiveView('chat')}
                    sx={{ mr: 1, color: '#4a4a6a' }}
                >
                    <ArrowLeft size={20} />
                </IconButton>

                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #0066ff, #00b894)',
                        color: '#fafafa',
                        fontWeight: 700,
                        mr: 2
                    }}
                >
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {user.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Circle size={8} color="#00b894" fill="#00b894" />
                        <Typography variant="caption" sx={{ color: '#4a4a6a' }}>
                            Online
                        </Typography>
                    </Box>
                </Box>

                <Chip
                    size="small"
                    label="Learning Partner"
                    sx={{
                        bgcolor: '#e8f5e8',
                        color: '#00b894',
                        fontWeight: 500
                    }}
                />
            </Box>

            {/* Messages Area */}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: '#fafafa'
            }}>
                {messages.map((msg) => (
                    <Box
                        key={msg.id}
                        sx={{
                            display: 'flex',
                            justifyContent: isCurrentUser(msg.senderId) ? 'flex-end' : 'flex-start',
                            mb: 2
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: '70%',
                                p: 2,
                                bgcolor: isCurrentUser(msg.senderId) ? '#0066ff' : '#ffffff',
                                color: isCurrentUser(msg.senderId) ? '#fafafa' : '#1a1a2e',
                                border: '2px solid',
                                borderColor: isCurrentUser(msg.senderId) ? '#0066ff' : '#e9ecef',
                                borderRadius: 2,
                                position: 'relative'
                            }}
                        >
                            <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                                {msg.message}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    textAlign: 'right',
                                    mt: 1,
                                    opacity: 0.7,
                                    fontSize: '0.7rem'
                                }}
                            >
                                {formatMessageTime(msg.timestamp)}
                            </Typography>
                        </Paper>
                    </Box>
                ))}

                {/* Empty state */}
                {messages.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
                            Start a conversation with {user.username}
                        </Typography>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderTop: '2px solid #e9ecef',
                bgcolor: '#ffffff'
            }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${user.username}...`}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontWeight: 500,
                            '& fieldset': {
                                borderWidth: 2,
                                borderColor: '#e9ecef'
                            },
                            '&:hover fieldset': {
                                borderColor: '#0066ff'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#0066ff'
                            }
                        }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    sx={{
                        background: '#0066ff',
                        border: '2px solid #0066ff',
                        borderRadius: 2,
                        minWidth: 'auto',
                        px: 2,
                        '&:hover': {
                            background: '#0052cc',
                            borderColor: '#0052cc'
                        },
                        '&:disabled': {
                            background: '#e9ecef',
                            borderColor: '#e9ecef'
                        }
                    }}
                >
                    <Send size={20} />
                </Button>
            </Box>
        </Box>
    );
};