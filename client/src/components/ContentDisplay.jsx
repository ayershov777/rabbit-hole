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

export const ContentDisplay = ({ content, onActionSelect, hideActions = false }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Box
                sx={{
                    // Typography
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    color: '#1a1a2e',
                    lineHeight: 1.8,
                    fontSize: '1.125rem', // Increased from 1.05rem

                    // Headings
                    '& h1': {
                        fontSize: '2.125rem',
                        fontWeight: 800,
                        color: '#1a1a2e',
                        marginTop: '2.5rem',
                        marginBottom: '1.25rem',
                        lineHeight: 1.4,
                        borderBottom: '3px solid #e9ecef',
                        paddingBottom: '0.75rem',
                        '&:first-child': {
                            marginTop: 0
                        }
                    },
                    '& h2': {
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#1a1a2e',
                        marginTop: '2.25rem',
                        marginBottom: '1rem',
                        lineHeight: 1.4,
                        borderBottom: '2px solid #f5f5f5',
                        paddingBottom: '0.5rem',
                        '&:first-child': {
                            marginTop: 0
                        }
                    },
                    '& h3': {
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#1a1a2e', // Changed from blue
                        marginTop: '2rem',
                        marginBottom: '0.875rem',
                        lineHeight: 1.4,
                        // Removed gradient accent
                        '&:first-child': {
                            marginTop: 0
                        }
                    },
                    '& h4': {
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#4a4a6a',
                        marginTop: '1.5rem',
                        marginBottom: '0.75rem',
                        lineHeight: 1.4,
                        '&:first-child': {
                            marginTop: 0
                        }
                    },

                    // Paragraphs
                    '& p': {
                        marginBottom: '1.25rem',
                        lineHeight: 1.8,
                        color: '#2d2d3a',
                        '&:last-child': {
                            marginBottom: 0
                        }
                    },

                    // Emphasis
                    '& strong, & b': {
                        fontWeight: 700,
                        color: '#1a1a2e',
                        background: 'linear-gradient(to bottom, transparent 60%, rgba(0, 102, 255, 0.15) 60%)',
                        padding: '0 2px'
                    },
                    '& em, & i': {
                        fontStyle: 'italic',
                        color: '#4a4a6a',
                        fontWeight: 500
                    },

                    // Code
                    '& code': {
                        backgroundColor: '#f8f9fa',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.9em',
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        border: '1px solid #e9ecef',
                        color: '#d63384',
                        fontWeight: 500
                    },
                    '& pre': {
                        backgroundColor: '#f8f9fa',
                        padding: '1.25rem',
                        borderRadius: '8px',
                        border: '2px solid #e9ecef',
                        overflow: 'auto',
                        marginBottom: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #0066ff, #00b894, #ff6b35)',
                            borderRadius: '8px 8px 0 0'
                        }
                    },
                    '& pre code': {
                        backgroundColor: 'transparent',
                        padding: 0,
                        border: 'none',
                        color: '#1a1a2e',
                        fontSize: '0.95em'
                    },

                    // Lists - Reduced indentation
                    '& ul, & ol': {
                        paddingLeft: '1.25rem', // Reduced from 2rem
                        marginBottom: '1.25rem',
                        marginTop: '0.5rem',
                        '&:last-child': {
                            marginBottom: 0
                        }
                    },
                    '& li': {
                        marginBottom: '0.625rem',
                        lineHeight: 1.8,
                        color: '#2d2d3a',
                        position: 'relative',
                        '&:last-child': {
                            marginBottom: 0
                        },
                        '& > p': {
                            marginBottom: '0.5rem'
                        },
                        '& > p:last-child': {
                            marginBottom: 0
                        }
                    },

                    // List styles with neutral bullet color
                    '& ul': {
                        listStyleType: 'none',
                        '& > li': {
                            paddingLeft: '1.25rem', // Reduced from 1.5rem
                            '&::before': {
                                content: '"•"',
                                position: 'absolute',
                                left: 0,
                                color: '#4a4a6a', // Changed from blue to neutral gray
                                fontWeight: 700,
                                fontSize: '1.2em',
                                lineHeight: '1.4'
                            }
                        }
                    },
                    '& ol': {
                        listStyleType: 'none',
                        counterReset: 'ol-counter',
                        '& > li': {
                            paddingLeft: '1.5rem', // Reduced from 1.75rem
                            counterIncrement: 'ol-counter',
                            '&::before': {
                                content: 'counter(ol-counter) "."',
                                position: 'absolute',
                                left: 0,
                                color: '#4a4a6a', // Changed from blue to neutral gray
                                fontWeight: 700,
                                fontSize: '1em'
                            }
                        }
                    },

                    // Nested lists - Reduced indentation
                    '& li ul, & li ol': {
                        marginTop: '0.625rem',
                        marginBottom: '0.625rem',
                        marginLeft: '0.25rem' // Reduced from 0.5rem
                    },

                    // Second level lists
                    '& ul ul > li::before': {
                        content: '"◦"',
                        fontSize: '1em',
                        color: '#6c757d' // Slightly lighter gray
                    },

                    // Third level lists
                    '& ul ul ul > li::before': {
                        content: '"▪"',
                        fontSize: '0.8em',
                        color: '#6c757d' // Slightly lighter gray
                    },

                    // Blockquotes
                    '& blockquote': {
                        borderLeft: '4px solid #e9ecef', // Changed to neutral color
                        paddingLeft: '1.5rem',
                        margin: '2rem 0',
                        backgroundColor: '#f8f9fa',
                        padding: '1.25rem 1.5rem 1.25rem 2rem',
                        borderRadius: '0 8px 8px 0',
                        fontStyle: 'italic',
                        color: '#4a4a6a',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        '& p': {
                            marginBottom: '0.5rem',
                            '&:last-child': {
                                marginBottom: 0
                            }
                        },
                        '&::before': {
                            content: '"""',
                            position: 'absolute',
                            top: '0.5rem',
                            left: '0.75rem',
                            fontSize: '2rem',
                            color: '#e9ecef', // Neutral quote color
                            opacity: 0.5,
                            fontWeight: 700
                        }
                    },

                    // Horizontal rules
                    '& hr': {
                        border: 'none',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #e9ecef, transparent)',
                        margin: '2.5rem 0',
                        borderRadius: '2px'
                    },

                    // Links
                    '& a': {
                        color: '#0066ff',
                        textDecoration: 'none',
                        fontWeight: 500,
                        borderBottom: '2px solid transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderBottomColor: '#0066ff',
                            background: 'rgba(0, 102, 255, 0.05)',
                            padding: '0 2px',
                            margin: '0 -2px',
                            borderRadius: '4px'
                        }
                    },

                    // Tables (if any)
                    '& table': {
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginBottom: '1.5rem',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    },
                    '& th': {
                        backgroundColor: '#f8f9fa',
                        padding: '0.75rem 1rem',
                        fontWeight: 700,
                        textAlign: 'left',
                        borderBottom: '2px solid #e9ecef',
                        color: '#1a1a2e'
                    },
                    '& td': {
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f5f5f5'
                    },
                    '& tr:last-child td': {
                        borderBottom: 'none'
                    },
                    '& tr:hover': {
                        backgroundColor: '#fafafa'
                    }
                }}
            >
                <ReactMarkdown>
                    {content.content}
                </ReactMarkdown>
            </Box>

            {/* Action Buttons for Content Views */}
            {!hideActions && <>
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
            </>}
        </Box>
    );
};
