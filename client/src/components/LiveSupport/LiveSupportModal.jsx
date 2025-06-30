import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import { X, User, Users, MessageCircle } from 'lucide-react';
import { useLiveSupport } from '../../contexts/LiveSupportContext';
import { ProfileSetup } from './ProfileSetup';
import { UserMatching } from './UserMatching';
import { ChatList } from './ChatList';
import { ChatInterface } from '../ChatInterface';

export const LiveSupportModal = () => {
    const {
        isModalOpen,
        activeView,
        activeChatUser,
        profileComplete,
        closeModal,
        setActiveView
    } = useLiveSupport();

    const handleTabChange = (event, newValue) => {
        const views = ['profile', 'matches', 'chat'];
        setActiveView(views[newValue]);
    };

    const getCurrentTabIndex = () => {
        const views = ['profile', 'matches', 'chat'];
        return views.indexOf(activeView);
    };

    const getDialogTitle = () => {
        if (activeChatUser) {
            return `Chat with ${activeChatUser.username}`;
        }

        switch (activeView) {
            case 'profile':
                return 'Your Learning Profile';
            case 'matches':
                return 'Connect with Peers';
            case 'chat':
                return 'Your Conversations';
            default:
                return 'Live Support';
        }
    };

    return (
        <Dialog
            open={isModalOpen}
            onClose={closeModal}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    border: '3px solid #1a1a2e',
                    borderRadius: 2,
                    boxShadow: '6px 6px 0px #1a1a2e',
                    minHeight: '600px',
                    maxHeight: '80vh'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    background: '#1a1a2e',
                    color: '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {getDialogTitle()}
                </Typography>
                <IconButton
                    onClick={closeModal}
                    sx={{
                        color: '#fafafa',
                        '&:hover': { background: 'rgba(250, 250, 250, 0.1)' }
                    }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Navigation Tabs - Only show if not in active chat */}
                {!activeChatUser && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
                        <Tabs
                            value={getCurrentTabIndex()}
                            onChange={handleTabChange}
                            sx={{
                                '& .MuiTabs-indicator': {
                                    height: 4,
                                    background: 'linear-gradient(90deg, #0066ff, #00b894)'
                                },
                                '& .MuiTab-root': {
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    minHeight: 56,
                                    px: 3,
                                    color: '#4a4a6a',
                                    '&.Mui-selected': {
                                        color: '#1a1a2e'
                                    },
                                    '&:hover': {
                                        color: '#1a1a2e',
                                        bgcolor: 'rgba(26, 26, 46, 0.04)'
                                    }
                                }
                            }}
                        >
                            <Tab
                                icon={<User size={20} />}
                                iconPosition="start"
                                label="Profile"
                                disabled={false}
                            />
                            <Tab
                                icon={<Users size={20} />}
                                iconPosition="start"
                                label="Find Peers"
                                disabled={!profileComplete}
                            />
                            <Tab
                                icon={<MessageCircle size={20} />}
                                iconPosition="start"
                                label="Chats"
                                disabled={!profileComplete}
                            />
                        </Tabs>
                    </Box>
                )}

                {/* Content Area */}
                <Box sx={{ p: 4, minHeight: '500px' }}>
                    {activeChatUser ? (
                        <ChatInterface user={activeChatUser} />
                    ) : (
                        <>
                            {activeView === 'profile' && <ProfileSetup />}
                            {activeView === 'matches' && profileComplete && <UserMatching />}
                            {activeView === 'chat' && profileComplete && <ChatList />}

                            {/* Show incomplete profile message */}
                            {(activeView === 'matches' || activeView === 'chat') && !profileComplete && (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    color: '#4a4a6a'
                                }}>
                                    <User size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                                    <Typography variant="h6" sx={{ mb: 2 }}>
                                        Complete Your Profile First
                                    </Typography>
                                    <Typography variant="body1">
                                        Set up your learning profile to connect with peers who can help you learn.
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};
