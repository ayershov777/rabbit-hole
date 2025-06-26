import { useRef } from 'react';
import {
    Typography,
    List,
    ListItem,
    Avatar,
    Box,
    Collapse,
    Grid,
    Button,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import {
    ChevronDown,
    ChevronUp,
    FileText,
    TrendingUp,
    Zap,
    Target,
    Compass,
    Telescope,
    Plus
} from 'lucide-react';

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
    }
];

// Priority level configurations
const priorityLevels = {
    1: {
        label: 'Essential',
        color: '#dc3545',
        bgColor: '#fee',
        icon: <Zap size={14} />,
        description: 'Core foundation - must understand'
    },
    2: {
        label: 'Important',
        color: '#ff6b35',
        bgColor: '#fff5f0',
        icon: <Target size={14} />,
        description: 'Significantly improves understanding'
    },
    3: {
        label: 'Useful',
        color: '#00b894',
        bgColor: '#f0fdf8',
        icon: <Compass size={14} />,
        description: 'Provides deeper insight'
    },
    4: {
        label: 'Advanced',
        color: '#6c757d',
        bgColor: '#f8f9fa',
        icon: <Telescope size={14} />,
        description: 'For expert mastery'
    }
};

export const BreakdownList = ({
    breakdown,
    selectedIndex,
    expandedIndex,
    onOptionClick,
    onActionSelect,
    onKeyDown,
    onMoreClick,
    importanceData = {},
    priorityData = {},
    loadingMore = false
}) => {
    const listboxRef = useRef(null);

    const getPriorityInfo = (concept) => {
        const priority = priorityData[concept];
        if (!priority || !priority.level) {
            return priorityLevels[2]; // Default to "Important" if no data
        }
        return priorityLevels[priority.level] || priorityLevels[2];
    };

    const getPriorityReason = (concept) => {
        const priority = priorityData[concept];
        return priority?.reason || 'Important for understanding';
    };

    return (
        <>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a2e' }}>
                Click on a concept or use arrow keys to explore options:
            </Typography>

            <List
                ref={listboxRef}
                role="listbox"
                tabIndex={0}
                aria-label="Knowledge areas to explore"
                onKeyDown={onKeyDown}
                sx={{
                    p: 0,
                    '&:focus': {
                        outline: '2px solid #0066ff',
                        outlineOffset: 4,
                        borderRadius: 2
                    },
                    '&:focus-visible': {
                        outline: '2px solid #0066ff',
                        outlineOffset: 4,
                        borderRadius: 2
                    }
                }}
            >
                {breakdown.map((option, index) => {
                    const priorityInfo = getPriorityInfo(option);
                    const priorityReason = getPriorityReason(option);

                    return (
                        <ListItem
                            key={index}
                            role="option"
                            data-option-index={index}
                            aria-selected={selectedIndex === index}
                            aria-expanded={expandedIndex === index}
                            onClick={() => onOptionClick(option, index)}
                            sx={{
                                display: 'block',
                                p: 0,
                                mb: 2,
                                border: '3px solid #1a1a2e',
                                borderRadius: 2,
                                background: '#fafafa',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: selectedIndex === index ? '4px 4px 0px #1a1a2e' : 'none',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: 4,
                                    height: '100%',
                                    background: priorityInfo.color,
                                    transform: selectedIndex === index || expandedIndex === index ? 'scaleY(1)' : 'scaleY(0)',
                                    transition: 'transform 0.3s ease',
                                    transformOrigin: 'bottom',
                                    zIndex: 1
                                },
                                '&:hover': {
                                    background: '#f5f5f5',
                                    boxShadow: '4px 4px 0px #1a1a2e'
                                },
                                '&:hover::before': {
                                    transform: 'scaleY(1)'
                                }
                            }}
                        >
                            {/* Main List Item Content */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    background: selectedIndex === index || expandedIndex === index ? '#f5f5f5' : 'transparent',
                                    transition: 'background 0.3s ease'
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        background: 'linear-gradient(135deg, #0066ff, #00b894)',
                                        color: '#fafafa',
                                        fontWeight: 800,
                                        border: '3px solid #1a1a2e',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        ...(selectedIndex === index && {
                                            background: 'linear-gradient(135deg, #ff6b35, #0066ff)',
                                            transform: 'scale(1.05)'
                                        })
                                    }}
                                >
                                    {index + 1}
                                </Avatar>

                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1a1a2e',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            {option}
                                        </Typography>
                                    </Box>

                                    {/* Priority Indicator */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Tooltip title={priorityReason} arrow placement="top">
                                            <Chip
                                                size="small"
                                                icon={priorityInfo.icon}
                                                label={priorityInfo.label}
                                                sx={{
                                                    height: 24,
                                                    backgroundColor: priorityInfo.bgColor,
                                                    color: priorityInfo.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    border: `1px solid ${priorityInfo.color}`,
                                                    '& .MuiChip-icon': {
                                                        color: priorityInfo.color,
                                                        marginLeft: '6px'
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: priorityInfo.color,
                                                        color: '#fff',
                                                        '& .MuiChip-icon': {
                                                            color: '#fff'
                                                        }
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#6c757d',
                                                fontStyle: 'italic',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {priorityReason}
                                        </Typography>
                                    </Box>
                                </Box>

                                {expandedIndex === index ? (
                                    <ChevronUp
                                        size={20}
                                        color="#4a4a6a"
                                        style={{
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                ) : (
                                    <ChevronDown
                                        size={20}
                                        color="#4a4a6a"
                                        style={{
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Expandable Action Panel */}
                            <Collapse in={expandedIndex === index}>
                                <Box
                                    sx={{
                                        p: 3,
                                        borderTop: '2px solid #e9ecef',
                                        background: '#f8f9fa'
                                    }}
                                >
                                    {/* Why It's Important Section */}
                                    {importanceData[option] && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#0066ff',
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                💡 Why It's Important
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#1a1a2e',
                                                    lineHeight: 1.6,
                                                    fontSize: '0.95rem',
                                                    fontStyle: 'italic',
                                                    background: '#fff',
                                                    p: 2,
                                                    borderRadius: 1,
                                                    border: '1px solid #e9ecef',
                                                    '& strong, & b': {
                                                        fontWeight: 700,
                                                        color: '#0066ff'
                                                    },
                                                    '& em, & i': {
                                                        fontStyle: 'italic'
                                                    },
                                                    '& code': {
                                                        background: '#f5f5f5',
                                                        padding: '2px 4px',
                                                        borderRadius: '3px',
                                                        fontSize: '0.9em',
                                                        fontFamily: 'monospace'
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: importanceData[option]
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#1a1a2e',
                                            mb: 2,
                                            textAlign: 'center'
                                        }}
                                    >
                                        What would you like to do?
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {actionButtons.map((action) => (
                                            <Grid item xs={12} sm={6} key={action.id}>
                                                <Button
                                                    fullWidth
                                                    variant={action.variant}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onActionSelect(option, action.id);
                                                    }}
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
                            </Collapse>
                        </ListItem>
                    );
                })}
            </List>

            {/* More Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Divider sx={{ mb: 3 }} />
                <Button
                    variant="outlined"
                    size="large"
                    onClick={onMoreClick}
                    disabled={loadingMore}
                    startIcon={<Plus size={20} />}
                    sx={{
                        border: '3px solid #6c757d',
                        borderRadius: 2,
                        color: '#6c757d',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        background: '#fafafa',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: '#6c757d',
                            color: '#fafafa',
                            borderColor: '#6c757d',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
                        },
                        '&:disabled': {
                            background: '#f5f5f5',
                            borderColor: '#e9ecef',
                            color: '#adb5bd'
                        }
                    }}
                >
                    {loadingMore ? 'Loading more concepts...' : 'Show More Concepts'}
                </Button>
                <Typography variant="body2" sx={{ mt: 1, color: '#6c757d', fontStyle: 'italic' }}>
                    Expand the breadth of concepts at this level
                </Typography>
            </Box>
        </>
    );
};
