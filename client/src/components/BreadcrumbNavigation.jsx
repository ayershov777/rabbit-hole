import React from 'react';
import { Paper, Box, Typography, Breadcrumbs, Chip } from '@mui/material';
import { History } from 'lucide-react';

export const BreadcrumbNavigation = ({ history, currentIndex, onNavigate }) => {
    const getVisibleHistory = () => {
        return history.slice(0, currentIndex + 1);
    };

    if (getVisibleHistory().length === 0) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                my: 4,
                border: '2px solid #e9ecef',
                borderRadius: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History size={16} color="#4a4a6a" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4a4a6a' }}>
                    Learning Path:
                </Typography>
            </Box>
            <Breadcrumbs separator="›" sx={{ flexWrap: 'wrap' }}>
                {getVisibleHistory().map((item, index) => (
                    <Chip
                        key={index}
                        label={item.concept.length > 30 ? item.concept.substring(0, 30) + '...' : item.concept}
                        onClick={() => onNavigate(index)}
                        variant={index === currentIndex ? 'filled' : 'outlined'}
                        sx={{
                            margin: '2px 0',
                            fontWeight: 600,
                            border: '3px solid #1a1a2e',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            ...(index === currentIndex ? {
                                background: '#1a1a2e',
                                color: '#fafafa',
                                '&:hover': {
                                    background: '#1a1a2e'
                                }
                            } : {
                                background: '#fafafa',
                                color: '#1a1a2e',
                                '&:hover': {
                                    background: '#f5f5f5',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(26, 26, 46, 0.15)'
                                }
                            })
                        }}
                    />
                ))}
            </Breadcrumbs>
        </Paper>
    );
};
