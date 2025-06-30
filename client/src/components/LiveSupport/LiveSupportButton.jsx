import { Fab, Badge, Tooltip } from '@mui/material';
import { MessageCircle, Users } from 'lucide-react';
import { useLiveSupport } from '../../contexts/LiveSupportContext';
import { useAuth } from '../../contexts/AuthContext';

export const LiveSupportButton = () => {
    const { isAuthenticated } = useAuth();
    const { 
        openModal, 
        unreadCount, 
        profileComplete 
    } = useLiveSupport();

    // Don't show if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const handleClick = () => {
        // Open to profile setup if profile not complete, otherwise show matches
        const defaultView = profileComplete ? 'matches' : 'profile';
        openModal(defaultView);
    };

    const getTooltipText = () => {
        if (!profileComplete) {
            return 'Set up your profile to connect with peers';
        }
        if (unreadCount > 0) {
            return `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`;
        }
        return 'Connect with peers for learning support';
    };

    return (
        <Tooltip title={getTooltipText()} placement="left" arrow>
            <Fab
                onClick={handleClick}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    background: profileComplete 
                        ? 'linear-gradient(135deg, #0066ff, #00b894)' 
                        : 'linear-gradient(135deg, #ff6b35, #0066ff)',
                    color: '#fafafa',
                    border: '3px solid #1a1a2e',
                    width: 64,
                    height: 64,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 8px 25px rgba(26, 26, 46, 0.3)',
                        background: profileComplete 
                            ? 'linear-gradient(135deg, #0052cc, #00a085)' 
                            : 'linear-gradient(135deg, #e55a2b, #0052cc)',
                    },
                    '&:active': {
                        transform: 'scale(1.05)'
                    }
                }}
            >
                <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            border: '2px solid #fafafa',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                        }
                    }}
                >
                    {profileComplete ? (
                        <MessageCircle size={28} />
                    ) : (
                        <Users size={28} />
                    )}
                </Badge>
            </Fab>
        </Tooltip>
    );
};
