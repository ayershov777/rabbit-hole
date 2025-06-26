import React, { useState } from 'react';
import {
    Button,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScrollVisibility } from '../hooks/useScrollVisibility';
import AuthModal from './AuthModal';

export const AuthButton = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const isVisible = useScrollVisibility(10);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        if (isAuthenticated) {
            setAnchorEl(event.currentTarget);
        } else {
            setAuthModalOpen(true);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <CircularProgress
                size={24}
                sx={{
                    color: '#1a1a2e',
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 1000,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    pointerEvents: isVisible ? 'auto' : 'none'
                }}
            />
        );
    }

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 1000,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    pointerEvents: isVisible ? 'auto' : 'none'
                }}
            >
                {isAuthenticated ? (
                    <Button
                        onClick={handleClick}
                        sx={{
                            minWidth: 'auto',
                            p: 0,
                            borderRadius: '50%',
                            '&:hover': {
                                backgroundColor: 'rgba(26, 26, 46, 0.04)'
                            }
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, #0066ff, #00b894)',
                                color: '#fafafa',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                border: '2px solid #1a1a2e',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(26, 26, 46, 0.15)'
                                }
                            }}
                        >
                            {getInitials(user?.username)}
                        </Avatar>
                    </Button>
                ) : (
                    <Button
                        onClick={handleClick}
                        variant="outlined"
                        startIcon={<User size={16} />}
                        sx={{
                            background: '#fafafa',
                            border: '2px solid #1a1a2e',
                            borderRadius: 2,
                            color: '#1a1a2e',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2,
                            py: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: '#f5f5f5',
                                borderColor: '#1a1a2e',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(26, 26, 46, 0.15)'
                            }
                        }}
                    >
                        Sign In
                    </Button>
                )}
            </Box>

            {/* User Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        border: '2px solid #1a1a2e',
                        borderRadius: 2,
                        mt: 1,
                        minWidth: 200,
                        boxShadow: '4px 4px 0px #1a1a2e'
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a2e' }}>
                        {user?.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4a4a6a', fontSize: '0.8rem' }}>
                        {user?.email}
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: '#e9ecef' }} />
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: '#1a1a2e',
                        fontWeight: 500,
                        '&:hover': {
                            background: '#f5f5f5'
                        }
                    }}
                >
                    <LogOut size={16} style={{ marginRight: 8 }} />
                    Sign Out
                </MenuItem>
            </Menu>

            {/* Auth Modal */}
            <AuthModal
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />
        </>
    );
};
