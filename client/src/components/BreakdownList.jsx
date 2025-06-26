import { useRef } from 'react';
import {
    Typography,
    List,
    ListItem,
    Avatar,
    Box,
    Grid,
    Button,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import {
    Zap,
    Target,
    Compass,
    Telescope,
    Plus
} from 'lucide-react';

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
    onOptionClick,
    onKeyDown,
    onMoreClick,
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
                Click on a concept to explore it further:
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
                                    transform: selectedIndex === index ? 'scaleY(1)' : 'scaleY(0)',
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    background: selectedIndex === index ? '#f5f5f5' : 'transparent',
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
                            </Box>
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