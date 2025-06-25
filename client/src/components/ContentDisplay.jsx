import React from 'react';
import { Box, Typography, Divider, Grid, Button } from '@mui/material';
import { HelpCircle, FileText, TrendingUp } from 'lucide-react';

const actionButtons = [
    {
        id: 'importance',
        label: 'Why It\'s Important',
        icon: <HelpCircle size={18} />,
        color: '#0066ff',
        variant: 'contained'
    },
    {
        id: 'overview',
        label: 'Get an Overview',
        icon: <FileText size={18} />,
        color: '#00b894',
        variant: 'outlined'
    },
    {
        id: 'breakdown',
        label: 'Break It Down',
        icon: <TrendingUp size={18} />,
        color: '#ff6b35',
        variant: 'outlined'
    }
];

export const ContentDisplay = ({ content, onActionSelect }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography
                variant="body1"
                sx={{
                    color: '#1a1a2e',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    whiteSpace: 'pre-wrap'
                }}
            >
                {content.content}
            </Typography>

            {/* Action Buttons for Content Views */}
            <Divider sx={{ my: 4 }} />

            <Box sx={{ mt: 4 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: '#1a1a2e',
                        mb: 3,
                        textAlign: 'center'
                    }}
                >
                    What would you like to do next?
                </Typography>

                <Grid container spacing={2}>
                    {actionButtons
                        .filter(action => action.id !== content.action)
                        .map((action) => (
                            <Grid item xs={12} sm={6} key={action.id}>
                                <Button
                                    fullWidth
                                    variant={action.variant}
                                    onClick={() => onActionSelect(content.concept, action.id)}
                                    startIcon={action.icon}
                                    sx={{
                                        height: '60px',
                                        border: action.variant === 'outlined' ? `2px solid ${action.color}` : 'none',
                                        background: action.variant === 'contained' ? action.color : 'transparent',
                                        color: action.variant === 'contained' ? '#fafafa' : action.color,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: action.color,
                                            color: '#fafafa',
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 4px 12px ${action.color}33`
                                        },
                                        '& .MuiButton-startIcon': {
                                            marginRight: 1,
                                            color: 'inherit'
                                        }
                                    }}
                                >
                                    {action.label}
                                </Button>
                            </Grid>
                        ))}
                </Grid>
            </Box>
        </Box>
    );
};
