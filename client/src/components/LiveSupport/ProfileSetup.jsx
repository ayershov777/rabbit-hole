import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    LinearProgress,
    Card,
    CardContent
} from '@mui/material';
import { Save, CheckCircle, User, RefreshCw } from 'lucide-react';
import { useLiveSupport } from '../../contexts/LiveSupportContext';

const profileQuestions = [
    {
        key: 'whoYouAre',
        label: 'Who are you?',
        placeholder: 'e.g., Computer Science student, Junior developer, Career changer learning data science...',
        helpText: 'Describe your background, current role, or learning journey'
    },
    {
        key: 'whoYouAreLookingFor',
        label: 'Who are you looking for?',
        placeholder: 'e.g., Experienced developers, Study partners, Industry mentors, Practice interview partners...',
        helpText: 'What type of people would you like to connect with?'
    },
    {
        key: 'mentoringSubjects',
        label: 'What subjects do you feel comfortable mentoring?',
        placeholder: 'e.g., JavaScript, Basic Python, Resume writing, Career advice...',
        helpText: 'Areas where you can help others (even if you\'re still learning!)'
    },
    {
        key: 'professionalServices',
        label: 'Do you offer any professional services?',
        placeholder: 'e.g., Code reviews, Mock interviews, Portfolio feedback, Tutoring sessions...',
        helpText: 'Optional: Any paid or professional services you might offer'
    }
];

export const ProfileSetup = () => {
    const {
        profile,
        profileComplete,
        profileLoading,
        updateProfile,
        reprocessProfile,
        setActiveView
    } = useLiveSupport();

    const [formData, setFormData] = useState(profile);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [reprocessing, setReprocessing] = useState(false);

    // Update form data when profile loads
    useEffect(() => {
        setFormData(profile);
    }, [profile]);

    // Check for changes
    useEffect(() => {
        const changed = Object.keys(formData).some(key =>
            formData[key] !== profile[key]
        );
        setHasChanges(changed);
    }, [formData, profile]);

    const handleInputChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleReprocess = async () => {
        setReprocessing(true);
        setSaveStatus('reprocessing');

        const result = await reprocessProfile();

        if (result.success) {
            setSaveStatus('reprocess-success');
            setTimeout(() => setSaveStatus(''), 3000);
        } else {
            setSaveStatus('reprocess-error');
            setTimeout(() => setSaveStatus(''), 3000);
        }

        setReprocessing(false);
    };

    const handleSave = async () => {
        setSaveStatus('saving');

        const result = await updateProfile(formData);

        if (result.success) {
            setSaveStatus('success');
            setHasChanges(false);

            // Auto-navigate to matches if profile is now complete
            setTimeout(() => {
                setSaveStatus('');
                if (profileComplete) {
                    setActiveView('matches');
                }
            }, 2000);
        } else {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const getCompletionProgress = () => {
        const requiredFields = ['whoYouAre', 'whoYouAreLookingFor'];
        const completed = requiredFields.filter(key =>
            formData[key] && formData[key].trim().length > 0
        ).length;
        return (completed / requiredFields.length) * 100;
    };

    const isFormValid = () => {
        return formData.whoYouAre?.trim().length > 0 &&
            formData.whoYouAreLookingFor?.trim().length > 0;
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <User size={48} color="#1a1a2e" style={{ marginBottom: 16 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 2 }}>
                    Set Up Your Learning Profile
                </Typography>
                <Typography variant="body1" sx={{ color: '#4a4a6a', maxWidth: 500, mx: 'auto' }}>
                    Help us connect you with the right peers by sharing a bit about yourself and what you're looking for.
                </Typography>
            </Box>

            {/* Progress Bar */}
            <Card sx={{ mb: 4, border: '2px solid #e9ecef' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                            Profile Completion
                        </Typography>
                        {profileComplete && (
                            <CheckCircle size={24} color="#00b894" />
                        )}
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={getCompletionProgress()}
                        sx={{
                            height: 8,
                            borderRadius: 2,
                            border: '1px solid #e9ecef',
                            '& .MuiLinearProgress-bar': {
                                background: profileComplete
                                    ? 'linear-gradient(90deg, #00b894, #0066ff)'
                                    : 'linear-gradient(90deg, #ff6b35, #0066ff)'
                            }
                        }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, color: '#4a4a6a' }}>
                        {Math.round(getCompletionProgress())}% complete
                        {profileComplete && ' - Ready to connect with peers!'}
                    </Typography>
                </CardContent>
            </Card>

            {/* Status Messages */}
            {saveStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Profile saved successfully!
                    {profileComplete && ' You can now connect with peers.'}
                </Alert>
            )}

            {saveStatus === 'reprocess-success' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Profile enhanced successfully! Your matches should now be more accurate.
                </Alert>
            )}

            {saveStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to save profile. Please try again.
                </Alert>
            )}

            {saveStatus === 'reprocess-error' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to enhance profile. Please try again.
                </Alert>
            )}

            {/* Form Fields */}
            <Box sx={{ space: 3 }}>
                {profileQuestions.map((question, index) => (
                    <Box key={question.key} sx={{ mb: 4 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: '#1a1a2e',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: index < 2
                                        ? 'linear-gradient(135deg, #ff6b35, #0066ff)'
                                        : 'linear-gradient(135deg, #00b894, #0066ff)',
                                    color: '#fafafa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}
                            >
                                {index + 1}
                            </Box>
                            {question.label}
                            {index < 2 && !formData[question.key]?.trim() && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#ff6b35',
                                        fontWeight: 600,
                                        ml: 1
                                    }}
                                >
                                    *Required
                                </Typography>
                            )}
                            {index < 2 && formData[question.key]?.trim() && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#00b894',
                                        fontWeight: 600,
                                        ml: 1
                                    }}
                                >
                                    ✓ Complete
                                </Typography>
                            )}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ color: '#4a4a6a', mb: 2 }}
                        >
                            {question.helpText}
                        </Typography>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={formData[question.key] || ''}
                            onChange={(e) => handleInputChange(question.key, e.target.value)}
                            placeholder={question.placeholder}
                            disabled={profileLoading || saveStatus === 'saving'}
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
                    </Box>
                ))}
            </Box>

            {/* Save and Enhance Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={!hasChanges || !isFormValid() || profileLoading || saveStatus === 'saving'}
                    startIcon={<Save size={20} />}
                    sx={{
                        background: 'linear-gradient(135deg, #0066ff, #00b894)',
                        border: '2px solid #1a1a2e',
                        color: '#fafafa',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0052cc, #00a085)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)'
                        },
                        '&:disabled': {
                            background: '#e9ecef',
                            borderColor: '#e9ecef',
                            color: '#adb5bd'
                        }
                    }}
                >
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
                </Button>

                {profileComplete && (
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleReprocess}
                        disabled={reprocessing || saveStatus === 'reprocessing'}
                        startIcon={<RefreshCw size={20} />}
                        sx={{
                            border: '2px solid #ff6b35',
                            color: '#ff6b35',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 4,
                            py: 1.5,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: '#ff6b35',
                                color: '#fafafa',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                            },
                            '&:disabled': {
                                background: '#f8f9fa',
                                borderColor: '#e9ecef',
                                color: '#adb5bd'
                            }
                        }}
                    >
                        {saveStatus === 'reprocessing' ? 'Enhancing...' : 'Enhance Matches'}
                    </Button>
                )}
            </Box>

            {/* Additional Info */}
            <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                <Typography variant="body2" sx={{ color: '#4a4a6a', textAlign: 'center', mb: 2 }}>
                    💡 <strong>Tip:</strong> The more specific you are, the better we can match you with relevant peers.
                    You can always update your profile later.
                </Typography>

                {profileComplete && (
                    <Typography variant="body2" sx={{ color: '#4a4a6a', textAlign: 'center', fontStyle: 'italic' }}>
                        ✨ <strong>New:</strong> Use "Enhance Matches" to improve your profile with AI analysis for even better peer matching quality.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
