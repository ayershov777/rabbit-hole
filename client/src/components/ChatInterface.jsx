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

export const ChatInterface = ({
    concept,
    learningPath,
    onContentAction,
    initialMessages = [],
    initialInitialized = false,
    onStateChange
}) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatInitialized, setChatInitialized] = useState(initialInitialized);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chat only if we don't have existing messages and haven't initialized
    useEffect(() => {
        if (!chatInitialized && messages.length === 0) {
            // First check if there's an existing session on the server
            checkForExistingSession();
        }
    }, [concept, learningPath, chatInitialized, messages.length]);

    const checkForExistingSession = async () => {
        try {
            const response = await fetch('/api/chat/recover', {
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
                if (data.exists) {
                    console.log(`Found existing server session for ${concept}`);
                    // Session exists on server, just mark as initialized to avoid creating a new welcome message
                    setChatInitialized(true);
                } else {
                    console.log(`No existing server session for ${concept}, initializing new chat`);
                    // No session exists, initialize normally
                    initializeChat();
                }
            } else {
                // If recovery fails, proceed with normal initialization
                initializeChat();
            }
        } catch (error) {
            console.error('Error checking for existing session:', error);
            // If recovery fails, proceed with normal initialization
            initializeChat();
        }
    };

    // Update parent when state changes
    useEffect(() => {
        onStateChange?.(messages, chatInitialized);
    }, [messages, chatInitialized, onStateChange]);

    // When initialMessages or initialInitialized change, update local state
    useEffect(() => {
        setMessages(initialMessages);
        setChatInitialized(initialInitialized);
    }, [initialMessages, initialInitialized]);

    const initializeChat = async () => {
        // Don't initialize if we already have messages
        if (messages.length > 0) {
            return;
        }

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
                const welcomeMessage = {
                    id: 1,
                    role: 'assistant',
                    content: data.welcomeMessage,
                    timestamp: new Date()
                };
                setMessages([welcomeMessage]);
                setChatInitialized(true);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
            // Fallback welcome message
            const fallbackMessage = {
                id: 1,
                role: 'assistant',
                content: `Hello! I'm here to help you learn about **${concept}**. What would you like to know? Feel free to ask me anything about this topic!`,
                timestamp: new Date()
            };
            setMessages([fallbackMessage]);
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

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
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
                    id: newMessages.length + 1,
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                };
                setMessages([...newMessages, assistantMessage]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: newMessages.length + 1,
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try asking your question again.',
                timestamp: new Date()
            };
            setMessages([...newMessages, errorMessage]);
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
        <Box sx={{
            height: { xs: '600px', md: '700px' },
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%'
        }}>
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
                                    fontSize: '0.75rem',
                                    flexShrink: 0
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
                                    maxWidth: { xs: '85%', md: '75%' },
                                    // Enhanced markdown styles for chat bubbles
                                    '& p': {
                                        margin: 0,
                                        marginBottom: '0.75rem',
                                        '&:last-child': { marginBottom: 0 }
                                    },
                                    '& ul, & ol': {
                                        margin: '0.5rem 0',
                                        paddingLeft: '1.5rem',
                                        '&:first-of-type': { marginTop: 0 },
                                        '&:last-child': { marginBottom: 0 }
                                    },
                                    '& li': {
                                        marginBottom: '0.5rem',
                                        lineHeight: 1.6,
                                        '&:last-child': { marginBottom: 0 }
                                    },
                                    '& li ul, & li ol': {
                                        marginTop: '0.5rem',
                                        marginBottom: '0.5rem'
                                    },
                                    '& pre': {
                                        margin: '0.75rem 0',
                                        padding: '0.75rem',
                                        background: message.role === 'user' ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                                        borderRadius: '4px',
                                        overflow: 'auto',
                                        '&:first-of-type': { marginTop: 0 },
                                        '&:last-child': { marginBottom: 0 }
                                    },
                                    '& code': {
                                        padding: '0.125rem 0.375rem',
                                        background: message.role === 'user' ? 'rgba(255, 255, 255, 0.2)' : '#f8f9fa',
                                        borderRadius: '3px',
                                        fontSize: '0.875em',
                                        fontFamily: 'Monaco, Consolas, monospace'
                                    },
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                        marginTop: '1rem',
                                        marginBottom: '0.5rem',
                                        '&:first-of-type': { marginTop: 0 }
                                    },
                                    '& blockquote': {
                                        borderLeft: '3px solid',
                                        borderLeftColor: message.role === 'user' ? 'rgba(255, 255, 255, 0.5)' : '#e9ecef',
                                        paddingLeft: '1rem',
                                        marginLeft: 0,
                                        marginRight: 0,
                                        fontStyle: 'italic',
                                        opacity: 0.9
                                    }
                                }}
                            >
                                {message.role === 'assistant' ? (
                                    <div className="chat-message-content">
                                        <ReactMarkdown>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
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
