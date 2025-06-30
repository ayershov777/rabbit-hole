import { useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    Chip,
    Grid,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    MessageCircle,
    Users,
    Star,
    Zap,
    Target,
    User,
    Clock,
    RefreshCw
} from 'lucide-react';
import { useLiveSupport } from '../../contexts/LiveSupportContext';

const matchTypeIcons = {
    mutual: <Star size={16} />,
    seeking: <Target size={16} />,
    offering: <Zap size={16} />
};

const matchTypeLabels = {
    mutual: 'Mutual Match',
    seeking: 'They might help you',
    offering: 'You might help them'
};

const matchTypeColors = {
    mutual: '#00b894',
    seeking: '#0066ff',
    offering: '#ff6b35'
};

export const UserMatching = () => {
    const {
        matches,
        activeUsers,
        matchesLoading,
        loadMatches,
        startChat
    } = useLiveSupport();

    useEffect(() => {
        loadMatches();
    }, []);

    const getSimilarityLabel = (similarity) => {
        if (similarity >= 0.9) return 'Excellent Match';
        if (similarity >= 0.8) return 'Great Match';
        if (similarity >= 0.7) return 'Good Match';
        return 'Potential Match';
    };

    const getSimilarityColor = (similarity) => {
        if (similarity >= 0.9) return '#00b894';
        if (similarity >= 0.8) return '#0066ff';
        if (similarity >= 0.7) return '#ff6b35';
        return '#6c757d';
    };

    const renderUserCard = (userData, isMatch = false) => {
        const { user, profile, similarity, matchType, matchReasons } = userData;

        return (
            <Card
                key={user._id}
                sx={{
                    border: '2px solid #e9ecef',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: isMatch ? matchTypeColors[matchType] : '#0066ff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* User Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
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

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                {profile.isOnline ? (
                                    <Chip
                                        size="small"
                                        label="Online"
                                        sx={{
                                            bgcolor: '#00b894',
                                            color: '#fafafa',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ) : (
                                    <Chip
                                        size="small"
                                        icon={<Clock size={12} />}
                                        label={`Last seen ${new Date(profile.lastSeen).toLocaleDateString()}`}
                                        sx={{
                                            bgcolor: '#f8f9fa',
                                            color: '#6c757d',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                )}

                                {isMatch && (
                                    <Chip
                                        size="small"
                                        icon={matchTypeIcons[matchType]}
                                        label={matchTypeLabels[matchType]}
                                        sx={{
                                            bgcolor: `${matchTypeColors[matchType]}20`,
                                            color: matchTypeColors[matchType],
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                            '& .MuiChip-icon': {
                                                color: matchTypeColors[matchType]
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>

                        {isMatch && (
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: getSimilarityColor(similarity),
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {getSimilarityLabel(similarity)}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: getSimilarityColor(similarity),
                                        fontWeight: 700
                                    }}
                                >
                                    {Math.round(similarity * 100)}%
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Match Reasons */}
                    {isMatch && matchReasons && matchReasons.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {matchReasons.map((reason, index) => (
                                <Chip
                                    key={index}
                                    size="small"
                                    label={reason}
                                    sx={{
                                        mr: 1,
                                        mb: 1,
                                        bgcolor: '#f0f8ff',
                                        color: '#0066ff',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Profile Info */}
                    <Box sx={{ space: 2 }}>
                        {profile.whoYouAre && (
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}
                                >
                                    About them:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#4a4a6a', lineHeight: 1.6 }}
                                >
                                    {profile.whoYouAre}
                                </Typography>
                            </Box>
                        )}

                        {profile.mentoringSubjects && (
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}
                                >
                                    Can help with:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#4a4a6a', lineHeight: 1.6 }}
                                >
                                    {profile.mentoringSubjects}
                                </Typography>
                            </Box>
                        )}

                        {profile.professionalServices && (
                            <Box sx={{ mb: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 600, color: '#1a1a2e', mb: 0.5 }}
                                >
                                    Professional services:
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#4a4a6a', lineHeight: 1.6 }}
                                >
                                    {profile.professionalServices}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Chat Button */}
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => startChat(user)}
                        startIcon={<MessageCircle size={16} />}
                        sx={{
                            mt: 2,
                            border: '2px solid #0066ff',
                            color: '#0066ff',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': {
                                background: '#0066ff',
                                color: '#fafafa',
                                borderColor: '#0066ff'
                            }
                        }}
                    >
                        Start Chat
                    </Button>
                </CardContent>
            </Card>
        );
    };

    if (matchesLoading) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#1a1a2e', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#4a4a6a' }}>
                    Finding your perfect learning matches...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 1 }}>
                        Your Learning Matches
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4a4a6a' }}>
                        Connect with peers who can help accelerate your learning journey
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    onClick={loadMatches}
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

            {/* Matched Users */}
            {matches.length > 0 && (
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Star size={20} color="#00b894" />
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#1a1a2e', ml: 1 }}
                        >
                            Best Matches ({matches.length})
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {matches.map((match) => (
                            <Grid item xs={12} md={6} key={match.user._id}>
                                {renderUserCard(match, true)}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Divider */}
            {matches.length > 0 && activeUsers.length > 0 && (
                <Divider sx={{ my: 4 }} />
            )}

            {/* Active Users */}
            {activeUsers.length > 0 && (
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Users size={20} color="#0066ff" />
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#1a1a2e', ml: 1 }}
                        >
                            Active Users ({activeUsers.length})
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {activeUsers.map((userData) => (
                            <Grid item xs={12} md={6} key={userData.user._id}>
                                {renderUserCard(userData, false)}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Empty State */}
            {matches.length === 0 && activeUsers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <User size={48} color="#e9ecef" style={{ marginBottom: 16 }} />
                    <Typography variant="h6" sx={{ color: '#4a4a6a', mb: 2 }}>
                        No matches found yet
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6c757d', maxWidth: 400, mx: 'auto' }}>
                        We're still learning about you! As more people join and update their profiles,
                        we'll find better matches for your learning journey.
                    </Typography>

                    <Button
                        variant="outlined"
                        onClick={loadMatches}
                        startIcon={<RefreshCw size={16} />}
                        sx={{
                            mt: 3,
                            border: '2px solid #0066ff',
                            color: '#0066ff',
                            fontWeight: 600,
                            textTransform: 'none'
                        }}
                    >
                        Check Again
                    </Button>
                </Box>
            )}
        </Box>
    );
};
