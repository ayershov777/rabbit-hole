import React from 'react';
import { Box, Typography, Divider, Grid, Button } from '@mui/material';
import { FileText, TrendingUp, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const actionButtons = [
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
    },
    {
        id: 'research_guide',
        label: 'Research Guide',
        icon: <BookOpen size={18} />,
        color: '#6f42c1',
        variant: 'outlined'
    }
];

export const ContentDisplay = ({ content, onActionSelect }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Box
                sx={{
                    // Typography
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    color: '#1a1a2e',
                    lineHeight: 1.7,
                    fontSize: '1rem',

                    // Headings
                    '& h1': {
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#0066ff',
                        marginTop: '2rem',
                        marginBottom: '1rem',
                        lineHeight: 1.3
                    },
                    '& h2': {
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#0066ff',
                        marginTop: '2rem',
                        marginBottom: '1rem',
                        lineHeight: 1.3
                    },
                    '& h3': {
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#0066ff',
                        marginTop: '1.5rem',
                        marginBottom: '0.75rem',
                        lineHeight: 1.3
                    },

                    // Paragraphs
                    '& p': {
                        marginBottom: '1rem',
                        lineHeight: 1.7
                    },

                    // Emphasis
                    '& strong': {
                        fontWeight: 700,
                        color: '#0066ff'
                    },
                    '& em': {
                        fontStyle: 'italic',
                        color: '#4a4a6a'
                    },

                    // Code
                    '& code': {
                        backgroundColor: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        border: '1px solid #e9ecef',
                        color: '#d63384'
                    },
                    '& pre': {
                        backgroundColor: '#f8f9fa',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        overflow: 'auto',
                        marginBottom: '1rem'
                    },
                    '& pre code': {
                        backgroundColor: 'transparent',
                        padding: 0,
                        border: 'none',
                        color: '#1a1a2e'
                    },

                    // Lists
                    '& ul, & ol': {
                        paddingLeft: '1.5rem',
                        marginBottom: '1rem'
                    },
                    '& li': {
                        marginBottom: '0.5rem',
                        lineHeight: 1.6
                    },
                    '& ul': {
                        listStyleType: 'disc'
                    },
                    '& ol': {
                        listStyleType: 'decimal'
                    },

                    // Nested lists
                    '& ul ul, & ol ol, & ul ol, & ol ul': {
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem'
                    },

                    // Blockquotes
                    '& blockquote': {
                        borderLeft: '4px solid #0066ff',
                        paddingLeft: '1rem',
                        margin: '1.5rem 0',
                        backgroundColor: '#f8f9fa',
                        padding: '1rem 1rem 1rem 2rem',
                        borderRadius: '0 6px 6px 0',
                        fontStyle: 'italic',
                        color: '#4a4a6a'
                    }
                }}
            >
                <ReactMarkdown>
                    {content.content}
                </ReactMarkdown>
            </Box>

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