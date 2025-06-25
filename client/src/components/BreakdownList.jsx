import React, { useRef } from 'react';
import {
    Typography,
    List,
    ListItem,
    Avatar,
    Box,
    Collapse,
    Grid,
    Button
} from '@mui/material';
import { ChevronDown, ChevronUp, HelpCircle, FileText, TrendingUp } from 'lucide-react';

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

export const BreakdownList = ({
    breakdown,
    selectedIndex,
    expandedIndex,
    onOptionClick,
    onActionSelect,
    onKeyDown
}) => {
    const listboxRef = useRef(null);

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
                {breakdown.map((option, index) => (
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
                                background: '#0066ff',
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
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    color: '#1a1a2e',
                                    flexGrow: 1,
                                    fontSize: '1.1rem'
                                }}
                            >
                                {option}
                            </Typography>
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
                                        <Grid item xs={12} sm={4} key={action.id}>
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
                ))}
            </List>
        </>
    );
};
