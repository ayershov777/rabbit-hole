import { useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Badge,
    Chip,
    CircularProgress,
    Button
} from '@mui/material';
import { MessageCircle, Clock, RefreshCw } from 'lucide-react';
import { useLiveSupport } from '../../contexts/LiveSupportContext';

export const ChatList = () => {
    const {
        conversations,
        loadConversations,
        startChat
    } = useLiveSupport();

    useEffect(() => {
        loadConversations();
    }, []);

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now - messageTime) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
            return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return messageTime.toLocaleDateString();
        }
    };

    const truncateMessage = (message, maxLength = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                        Your Conversations
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4a4a6a' }}>
                        Continue learning with your peer connections
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    onClick={loadConversations}
                    startIcon={<RefreshCw size={16} />}
                    sx={{
                        border: '2px solid #e9ecef',
                        color: '#4a4a6a',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                            borderColor: '#0066ff',
                            color: '#0066ff'
                        }
                    }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Conversations List */}
            {conversations.length > 0 ? (
                <List sx={{ p: 0 }}>
                    {conversations.map((conversation) => (
                        <ListItem
                            key={conversation.id}
                            onClick={() => startChat(conversation.otherUser)}
                            sx={{
                                border: '2px solid #e9ecef',
                                borderRadius: 2,
                                mb: 2,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backgroundColor: '#fafafa',
                                '&:hover': {
                                    borderColor: '#0066ff',
                                    backgroundColor: '#f0f8ff',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 8px rgba(0, 102, 255, 0.1)'
                                }
                            }}
                        >
                            <ListItemAvatar>
                                <Badge
                                    variant="dot"
                                    color={conversation.isOnline ? 'success' : 'default'}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: conversation.isOnline ? '#00b894' : '#e9ecef'
                                        }
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            background: 'linear-gradient(135deg, #0066ff, #00b894)',
                                            color: '#fafafa',
                                            fontWeight: 700,
                                            fontSize: '1.25rem'
                                        }}
                                    >
                                        {conversation.otherUser.username?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                </Badge>
                            </ListItemAvatar>

                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1a1a2e',
                                                flexGrow: 1
                                            }}
                                        >
                                            {conversation.otherUser.username}
                                        </Typography>

                                        {conversation.unreadCount > 0 && (
                                            <Chip
                                                size="small"
                                                label={conversation.unreadCount}
                                                sx={{
                                                    backgroundColor: '#ff6b35',
                                                    color: '#fafafa',
                                                    fontWeight: 700,
                                                    minWidth: 24,
                                                    height: 24
                                                }}
                                            />
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Clock size={14} color="#6c757d" />
                                            <Typography
                                                variant="caption"
                                                sx={{ color: '#6c757d', fontWeight: 500 }}
                                            >
                                                {formatTimestamp(conversation.lastMessage.timestamp)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: conversation.unreadCount > 0 ? '#1a1a2e' : '#6c757d',
                                                fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                                                lineHeight: 1.4
                                            }}
                                        >
                                            {conversation.lastMessage.senderId === conversation.otherUser._id
                                                ? ''
                                                : 'You: '
                                            }
                                            {truncateMessage(conversation.lastMessage.message)}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <Chip
                                                size="small"
                                                label={conversation.isOnline ? 'Online' : 'Offline'}
                                                sx={{
                                                    backgroundColor: conversation.isOnline ? '#e8f5e8' : '#f8f9fa',
                                                    color: conversation.isOnline ? '#00b894' : '#6c757d',
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                    height: 20
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <MessageCircle size={48} color="#e9ecef" style={{ marginBottom: 16 }} />
                    <Typography variant="h6" sx={{ color: '#4a4a6a', mb: 2 }}>
                        No conversations yet
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6c757d', maxWidth: 400, mx: 'auto', mb: 4 }}>
                        Start chatting with your matches to begin collaborative learning.
                        Head over to the "Find Peers" tab to discover people who can help you learn!
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => setActiveView('matches')}
                        startIcon={<MessageCircle size={16} />}
                        sx={{
                            background: 'linear-gradient(135deg, #0066ff, #00b894)',
                            border: '2px solid #1a1a2e',
                            color: '#fafafa',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0052cc, #00a085)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)'
                            }
                        }}
                    >
                        Find People to Chat With
                    </Button>
                </Box>
            )}
        </Box>
    );
};
