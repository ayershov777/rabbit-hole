import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    CircularProgress,
    Divider,
    Avatar
} from '@mui/material';
import { Send, MessageCircle, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatInterface = ({ concept, learningPath, onContentAction }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatInitialized, setChatInitialized] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat with welcome message when component mounts or concept changes
    useEffect(() => {
        if (!chatInitialized) {
            initializeChat();
        }
    }, [concept, learningPath, chatInitialized]);

    // Reset chat when concept/path changes
    useEffect(() => {
        setMessages([]);
        setChatInitialized(false);
        setInputMessage('');
    }, [concept, JSON.stringify(learningPath)]);

    const initializeChat = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/chat/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    concept,
                    learningPath
                })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([{
                    id: 1,
                    role: 'assistant',
                    content: data.welcomeMessage,
                    timestamp: new Date()
                }]);
                setChatInitialized(true);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            // Fallback welcome message
            setMessages([{
                id: 1,
                role: 'assistant',
                content: `Hello! I'm here to help you learn about **${concept}**. What would you like to know? Feel free to ask me anything about this topic!`,
                timestamp: new Date()
            }]);
            setChatInitialized(true);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage = {
            id: messages.length + 1,
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    concept,
                    learningPath,
                    message: inputMessage.trim(),
                    conversationHistory: messages.filter(msg => msg.role !== 'system')
                })
            });

            if (response.ok) {
                const data = await response.json();
                const assistantMessage = {
                    id: messages.length + 2,
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: messages.length + 2,
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try asking your question again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                border: '2px solid #e9ecef'
            }}>
                <MessageCircle size={24} color="#0066ff" />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        Chat about {concept}
                    </Typography>
                    {learningPath.length > 1 && (
                        <Typography variant="body2" sx={{ color: '#4a4a6a' }}>
                            Learning path: {learningPath.join(' → ')}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Messages Area */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    p: 2,
                    mb: 2,
                    border: '2px solid #e9ecef',
                    borderRadius: 2,
                    overflow: 'auto',
                    bgcolor: '#fafafa'
                }}
            >
                {messages.map((message) => (
                    <Box key={message.id} sx={{ mb: 3 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2,
                            flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                        }}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: message.role === 'user' ? '#0066ff' : '#00b894',
                                    fontSize: '0.75rem'
                                }}
                            >
                                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </Avatar>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    bgcolor: message.role === 'user' ? '#0066ff' : '#ffffff',
                                    color: message.role === 'user' ? '#fafafa' : '#1a1a2e',
                                    border: '2px solid',
                                    borderColor: message.role === 'user' ? '#0066ff' : '#e9ecef',
                                    borderRadius: 2,
                                    maxWidth: '80%',
                                    '& p': { margin: 0 },
                                    '& p:not(:last-child)': { marginBottom: 1 }
                                }}
                            >
                                {message.role === 'assistant' ? (
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                ) : (
                                    <Typography variant="body1">{message.content}</Typography>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#00b894' }}>
                            <Bot size={16} />
                        </Avatar>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                bgcolor: '#ffffff',
                                border: '2px solid #e9ecef',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <CircularProgress size={16} sx={{ color: '#00b894' }} />
                            <Typography variant="body2" sx={{ color: '#4a4a6a' }}>
                                Thinking...
                            </Typography>
                        </Paper>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Paper>

            {/* Input Area */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about this topic..."
                    disabled={loading}
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
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || loading}
                    sx={{
                        background: '#0066ff',
                        border: '2px solid #0066ff',
                        borderRadius: 2,
                        minWidth: 'auto',
                        px: 2,
                        py: 1.5,
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
