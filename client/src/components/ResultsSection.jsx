import React from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { BreakdownList } from './BreakdownList';
import { ContentDisplay } from './ContentDisplay';

export const ResultsSection = ({
    currentBreakdown,
    currentContent,
    contentType,
    breakdownHistory,
    currentHistoryIndex,
    selectedIndex,
    expandedIndex,
    importanceData,
    priorityData,
    resultsHeaderRef,
    onNavigateHistory,
    onOptionClick,
    onActionSelect,
    onKeyDown,
    onBackToBreakdown,
    onContentAction
}) => {
    const getContentTitle = () => {
        if (!currentContent) return '';

        switch (currentContent.action) {
            case 'overview':
                return `Overview of "${currentContent.concept}"`;
            default:
                return currentContent.concept;
        }
    };

    const getContentDescription = () => {
        if (!currentContent) return '';

        switch (currentContent.action) {
            case 'overview':
                return 'Key concepts and principles:';
            default:
                return '';
        }
    };

    return (
        <Box>
            {/* Breadcrumb History */}
            <BreadcrumbNavigation
                history={breakdownHistory}
                currentIndex={currentHistoryIndex}
                onNavigate={onNavigateHistory}
            />

            {/* Results Header and Content */}
            <Paper
                elevation={0}
                sx={{
                    border: '3px solid #1a1a2e',
                    borderRadius: 2,
                    boxShadow: '4px 4px 0px #1a1a2e',
                    overflow: 'hidden',
                    position: 'relative',
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
                {/* Header with Back Button for Content Views */}
                <Box sx={{
                    background: '#1a1a2e',
                    color: '#fafafa',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(250, 250, 250, 0.1), transparent)',
                        animation: 'shimmer 3s infinite'
                    }
                }}>
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                        {/* Back Button for Content Views */}
                        {contentType === 'overview' && (
                            <Button
                                onClick={onBackToBreakdown}
                                startIcon={<ArrowLeft size={16} />}
                                sx={{
                                    color: '#fafafa',
                                    mb: 2,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: 'rgba(250, 250, 250, 0.1)'
                                    }
                                }}
                            >
                                Back to Breakdown
                            </Button>
                        )}

                        <Typography
                            ref={resultsHeaderRef}
                            variant="h5"
                            sx={{ fontWeight: 700, mb: 1 }}
                        >
                            {contentType === 'breakdown' && currentBreakdown
                                ? `Exploring "${currentBreakdown.concept}"`
                                : getContentTitle()
                            }
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {contentType === 'breakdown'
                                ? 'Here are the key areas and components:'
                                : getContentDescription()
                            }
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: 4 }}>
                    {/* Breakdown Content */}
                    {contentType === 'breakdown' && currentBreakdown && (
                        <BreakdownList
                            breakdown={currentBreakdown.breakdown}
                            selectedIndex={selectedIndex}
                            expandedIndex={expandedIndex}
                            onOptionClick={onOptionClick}
                            onActionSelect={onActionSelect}
                            onKeyDown={onKeyDown}
                            importanceData={importanceData}
                            priorityData={priorityData}
                        />
                    )}

                    {/* Content Display (Overview) */}
                    {currentContent && (
                        <ContentDisplay
                            content={currentContent}
                            onActionSelect={onContentAction}
                        />
                    )}
                </Box>
            </Paper>
        </Box>
    );
};
