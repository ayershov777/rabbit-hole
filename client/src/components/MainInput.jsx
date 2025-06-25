import React from 'react';
import {
    Paper,
    Stack,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress
} from '@mui/material';
import { Search, ChevronRight } from 'lucide-react';

export const MainInput = ({
    concept,
    setConcept,
    onSubmit,
    loading
}) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !loading) {
            event.preventDefault();
            onSubmit();
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                mb: 4,
                border: '3px solid #1a1a2e',
                borderRadius: 2,
                boxShadow: '4px 4px 0px #1a1a2e',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: 'linear-gradient(90deg, #0066ff 0%, #00b894 50%, #ff6b35 100%)'
                }
            }}
        >
            <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Search size={20} color="#1a1a2e" />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                        What do you want to understand?
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                    <TextField
                        fullWidth
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., Machine Learning, Quantum Physics, Blockchain..."
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                height: '56px',
                                '& fieldset': {
                                    borderWidth: 3,
                                    borderColor: '#1a1a2e'
                                },
                                '&:hover fieldset': {
                                    borderColor: '#1a1a2e'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0066ff',
                                    boxShadow: '0 0 0 4px rgba(0, 102, 255, 0.2)'
                                }
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        disabled={loading}
                        sx={{
                            background: '#1a1a2e',
                            border: '3px solid #1a1a2e',
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 1.5,
                            px: 4,
                            height: '56px',
                            minWidth: '180px',
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
                            '& .MuiButton-startIcon': {
                                position: 'relative',
                                zIndex: 2,
                                color: '#fafafa !important'
                            },
                            '&:hover::before, &:focus::before': {
                                left: 0
                            },
                            '&:hover': {
                                background: '#1a1a2e',
                                borderColor: '#1a1a2e',
                                boxShadow: '0 6px 20px rgba(26, 26, 46, 0.3)',
                                color: '#fafafa !important'
                            },
                            '&:focus': {
                                outline: '4px solid #0066ff',
                                outlineOffset: 2,
                                color: '#fafafa !important'
                            },
                            '& > span': {
                                position: 'relative',
                                zIndex: 2,
                                color: '#fafafa !important'
                            }
                        }}
                        startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fafafa !important' }} /> : <ChevronRight size={16} />}
                    >
                        <Box component="span" sx={{ position: 'relative', zIndex: 2, color: '#fafafa !important' }}>
                            {loading ? 'Analyzing...' : 'Break It Down'}
                        </Box>
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
};
