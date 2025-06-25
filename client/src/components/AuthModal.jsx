import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    IconButton,
    CircularProgress,
    Divider
} from '@mui/material';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ open, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return false;
        }

        if (!isLogin) {
            if (!formData.username.trim()) {
                setError('Username is required');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            let result;
            if (isLogin) {
                result = await login(formData.email, formData.password);
            } else {
                result = await register(formData.email, formData.password, formData.username.trim());
            }

            if (result.success) {
                handleClose();
            } else {
                setError(result.error || 'An error occurred');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            email: '',
            password: '',
            username: '',
            confirmPassword: ''
        });
        setError('');
        setLoading(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData(prev => ({
            ...prev,
            username: '',
            confirmPassword: ''
        }));
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    border: '3px solid #1a1a2e',
                    borderRadius: 2,
                    boxShadow: '6px 6px 0px #1a1a2e'
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* Header */}
                <Box sx={{
                    background: '#1a1a2e',
                    color: '#fafafa',
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: '#fafafa',
                            '&:hover': { background: 'rgba(250, 250, 250, 0.1)' }
                        }}
                    >
                        <X size={20} />
                    </IconButton>
                </Box>

                {/* Form */}
                <Box sx={{ p: 4 }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                border: '2px solid #d32f2f',
                                borderRadius: 2,
                                fontWeight: 600
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={loading}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        fontWeight: 600,
                                        '& fieldset': {
                                            borderWidth: 2,
                                            borderColor: '#1a1a2e'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#1a1a2e'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#0066ff'
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontWeight: 600
                                    }
                                }}
                            />
                        )}

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={loading}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    fontWeight: 600,
                                    '& fieldset': {
                                        borderWidth: 2,
                                        borderColor: '#1a1a2e'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1a1a2e'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0066ff'
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    fontWeight: 600
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        sx={{ color: '#1a1a2e' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    fontWeight: 600,
                                    '& fieldset': {
                                        borderWidth: 2,
                                        borderColor: '#1a1a2e'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#1a1a2e'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0066ff'
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    fontWeight: 600
                                }
                            }}
                        />

                        {!isLogin && (
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                            sx={{ color: '#1a1a2e' }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </IconButton>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        fontWeight: 600,
                                        '& fieldset': {
                                            borderWidth: 2,
                                            borderColor: '#1a1a2e'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#1a1a2e'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#0066ff'
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontWeight: 600
                                    }
                                }}
                            />
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            sx={{
                                background: '#1a1a2e',
                                border: '3px solid #1a1a2e',
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: 1.5,
                                py: 1.5,
                                mb: 3,
                                position: 'relative',
                                overflow: 'hidden',
                                color: '#fafafa !important',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #0066ff, #00b894)',
                                    transition: 'left 0.5s ease',
                                    zIndex: 0
                                },
                                '&:hover::before': {
                                    left: 0
                                },
                                '&:hover': {
                                    background: '#1a1a2e',
                                    borderColor: '#1a1a2e',
                                    boxShadow: '0 6px 20px rgba(26, 26, 46, 0.3)'
                                },
                                '&:disabled': {
                                    background: '#6c757d',
                                    borderColor: '#6c757d',
                                    color: '#d3d3d3 !important'
                                },
                                '& > span': {
                                    position: 'relative',
                                    zIndex: 2
                                }
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: '#fafafa' }} />
                            ) : (
                                <Box component="span" sx={{ position: 'relative', zIndex: 2 }}>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </Box>
                            )}
                        </Button>
                    </form>

                    <Divider sx={{ my: 3, borderColor: '#e9ecef' }} />

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4a4a6a', mb: 1 }}>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </Typography>
                        <Button
                            onClick={toggleMode}
                            disabled={loading}
                            sx={{
                                color: '#0066ff',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                    background: 'rgba(0, 102, 255, 0.04)'
                                }
                            }}
                        >
                            {isLogin ? 'Create one here' : 'Sign in instead'}
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
