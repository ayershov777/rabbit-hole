import { useState, useEffect } from 'react';
import { Paper, Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import { Info, TrendingUp, BookOpen, MessageCircle } from 'lucide-react';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { BreakdownList } from './BreakdownList';
import { ContentDisplay } from './ContentDisplay';
import { TabPanel } from './TabPanel';
import { ChatInterface } from './ChatInterface';

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
    loadingMore,
    resultsHeaderRef,
    summary,
    overview,
    researchGuide,
    loadingSummary,
    loadingOverview,
    loadingResearchGuide,
    activeTab: controlledActiveTab,
    onNavigateHistory,
    onOptionClick,
    onActionSelect,
    onKeyDown,
    onBackToBreakdown,
    onContentAction,
    onMoreClick,
    onTabChange,
    onStartChat  // New prop
}) => {
    const [activeTab, setActiveTab] = useState(controlledActiveTab || 0);

    // Sync with controlled active tab
    useEffect(() => {
        if (controlledActiveTab !== undefined) {
            setActiveTab(controlledActiveTab);
        }
    }, [controlledActiveTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        // Notify parent about tab change
        const actions = ['overview', 'breakdown', 'research_guide', 'chat'];
        onTabChange(actions[newValue], newValue);
    };

    const handleStartChat = () => {
        setActiveTab(3); // Switch to chat tab
        onStartChat();
    };

    const getCurrentConcept = () => {
        if (currentBreakdown) {
            return currentBreakdown.concept;
        }
        if (currentContent) {
            return currentContent.concept;
        }
        return '';
    };

    const normalizeTitle = (concept) => {
        // Simple title normalization - capitalize each word
        return concept
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <Box>
            {/* Breadcrumb History */}
            <BreadcrumbNavigation
                history={breakdownHistory}
                currentIndex={currentHistoryIndex}
                onNavigate={onNavigateHistory}
            />

            {/* Main Content Card */}
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
                {/* Header with Title and Summary */}
                <Box sx={{
                    background: '#1a1a2e',
                    color: '#fafafa',
                    p: 4,
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
                        <Typography
                            ref={resultsHeaderRef}
                            variant="h4"
                            sx={{ fontWeight: 800, mb: 2 }}
                        >
                            {normalizeTitle(getCurrentConcept())}
                        </Typography>

                        {/* Summary Section */}
                        {loadingSummary ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} sx={{ color: '#fafafa' }} />
                                <Typography variant="body1" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                                    Generating summary...
                                </Typography>
                            </Box>
                        ) : summary ? (
                            <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8, maxWidth: '800px' }}>
                                {summary}
                            </Typography>
                        ) : null}
                    </Box>
                </Box>

                {/* Tabs Navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTabs-indicator': {
                                height: 4,
                                background: 'linear-gradient(90deg, #0066ff, #00b894)'
                            },
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                                minHeight: 64,
                                px: 3,
                                color: '#4a4a6a',
                                '&.Mui-selected': {
                                    color: '#1a1a2e'
                                },
                                '&:hover': {
                                    color: '#1a1a2e',
                                    bgcolor: 'rgba(26, 26, 46, 0.04)'
                                }
                            }
                        }}
                    >
                        <Tab
                            icon={<Info size={20} />}
                            iconPosition="start"
                            label="Summary"
                            id="concept-tab-0"
                            aria-controls="concept-tabpanel-0"
                        />
                        <Tab
                            icon={<TrendingUp size={20} />}
                            iconPosition="start"
                            label="Breakdown"
                            id="concept-tab-1"
                            aria-controls="concept-tabpanel-1"
                        />
                        <Tab
                            icon={<BookOpen size={20} />}
                            iconPosition="start"
                            label="Research Guide"
                            id="concept-tab-2"
                            aria-controls="concept-tabpanel-2"
                        />
                        <Tab
                            icon={<MessageCircle size={20} />}
                            iconPosition="start"
                            label="Chat"
                            id="concept-tab-3"
                            aria-controls="concept-tabpanel-3"
                        />
                    </Tabs>
                </Box>

                {/* Tab Panels */}
                <Box sx={{ p: 4 }}>
                    {/* Summary Tab */}
                    <TabPanel value={activeTab} index={0}>
                        {loadingOverview ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#1a1a2e', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#4a4a6a' }}>
                                    Loading overview...
                                </Typography>
                            </Box>
                        ) : overview ? (
                            <ContentDisplay
                                content={{ content: overview, action: 'overview', concept: getCurrentConcept() }}
                                onActionSelect={onContentAction}
                                onStartChat={handleStartChat}
                                hideActions={true}
                            />
                        ) : (
                            <Typography variant="body1" sx={{ color: '#4a4a6a', fontStyle: 'italic', textAlign: 'center', py: 8 }}>
                                Click to load the overview for this concept.
                            </Typography>
                        )}
                    </TabPanel>

                    {/* Breakdown Tab */}
                    <TabPanel value={activeTab} index={1}>
                        {currentBreakdown ? (
                            <BreakdownList
                                breakdown={currentBreakdown.breakdown}
                                selectedIndex={selectedIndex}
                                expandedIndex={expandedIndex}
                                onOptionClick={onOptionClick}
                                onActionSelect={onActionSelect}
                                onKeyDown={onKeyDown}
                                onMoreClick={onMoreClick}
                                importanceData={importanceData}
                                priorityData={priorityData}
                                loadingMore={loadingMore}
                            />
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#1a1a2e', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#4a4a6a' }}>
                                    Loading breakdown...
                                </Typography>
                            </Box>
                        )}
                    </TabPanel>

                    {/* Research Guide Tab */}
                    <TabPanel value={activeTab} index={2}>
                        {loadingResearchGuide ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#1a1a2e', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#4a4a6a' }}>
                                    Loading research guide...
                                </Typography>
                            </Box>
                        ) : researchGuide ? (
                            <ContentDisplay
                                content={{ content: researchGuide, action: 'research_guide', concept: getCurrentConcept() }}
                                onActionSelect={onContentAction}
                                onStartChat={handleStartChat}
                                hideActions={true}
                            />
                        ) : (
                            <Typography variant="body1" sx={{ color: '#4a4a6a', fontStyle: 'italic', textAlign: 'center', py: 8 }}>
                                Click to load the research guide for this concept.
                            </Typography>
                        )}
                    </TabPanel>

                    {/* Chat Tab */}
                    <TabPanel value={activeTab} index={3}>
                        <ChatInterface
                            concept={getCurrentConcept()}
                            learningPath={breakdownHistory.slice(0, currentHistoryIndex + 1).map(item => item.concept)}
                            onContentAction={onContentAction}
                        />
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
};
