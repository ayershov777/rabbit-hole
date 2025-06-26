import { useState, useRef, useEffect } from 'react';
import { Container, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { MainInput } from './MainInput';
import { LoadingState } from './LoadingState';
import { ResultsSection } from './ResultsSection';
import { useConceptExplorer } from '../hooks/useConceptExplorer';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

export const ConceptExplorer = () => {
    const { getAuthHeaders } = useAuth();
    const [concept, setConcept] = useState('');
    const [error, setError] = useState('');
    const [summary, setSummary] = useState('');
    const [overview, setOverview] = useState('');
    const [researchGuide, setResearchGuide] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [loadingResearchGuide, setLoadingResearchGuide] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Content cache for summary, overview, and research guide
    const [contentStateCache] = useState(new Map());
    const resultsHeaderRef = useRef(null);

    const {
        currentBreakdown,
        currentContent,
        contentType,
        breakdownHistory,
        currentHistoryIndex,
        loading,
        loadingProgress,
        loadingMessage,
        selectedIndex,
        expandedIndex,
        menuButtonsReady,
        contentCache,
        importanceData,
        priorityData,
        loadingMore,
        setSelectedIndex,
        setExpandedIndex,
        setMenuButtonsReady,
        getContentWithFreshState,
        getContent,
        goBackToHistory,
        goBackToBreakdown,
        handleOptionClick,
        handleMenuCollapse,
        handleActionSelect,
        handleMoreConcepts
    } = useConceptExplorer(getAuthHeaders, resultsHeaderRef);

    const { handleListboxKeyDown } = useKeyboardNavigation({
        currentBreakdown,
        selectedIndex,
        expandedIndex,
        setSelectedIndex,
        setExpandedIndex,
        setMenuButtonsReady,
        handleMenuCollapse,
        handleActionSelect
    });

    // Generate cache key for content
    const generateContentCacheKey = (conceptText, action, learningPath) => {
        return `${action}_${conceptText}_${learningPath.join('->')}`;
    };

    // Save content state to cache
    const saveContentStateToCache = (conceptText, learningPath) => {
        const cacheKey = generateContentCacheKey(conceptText, 'state', learningPath);
        contentStateCache.set(cacheKey, {
            summary,
            overview,
            researchGuide,
            timestamp: Date.now()
        });
    };

    // Load content state from cache
    const loadContentStateFromCache = (conceptText, learningPath) => {
        const cacheKey = generateContentCacheKey(conceptText, 'state', learningPath);
        return contentStateCache.get(cacheKey);
    };

    // Clear content state
    const clearContentState = () => {
        setSummary('');
        setOverview('');
        setResearchGuide('');
    };

    // Load content for a specific concept
    const loadContentForConcept = async (conceptText, learningPath) => {
        // Check cache first
        const cachedState = loadContentStateFromCache(conceptText, learningPath);
        if (cachedState) {
            setSummary(cachedState.summary || '');
            setOverview(cachedState.overview || '');
            setResearchGuide(cachedState.researchGuide || '');
            return;
        }

        // If not in cache, clear state and load summary
        clearContentState();

        // Load summary by default
        const summaryCacheKey = generateContentCacheKey(conceptText, 'summary', learningPath);
        if (!contentStateCache.has(summaryCacheKey)) {
            setLoadingSummary(true);
            try {
                const response = await fetch('/api/content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify({
                        concept: conceptText,
                        learningPath: learningPath,
                        action: 'summary'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setSummary(data.content);
                    contentStateCache.set(summaryCacheKey, data.content);
                }
            } catch (error) {
                console.error('Error loading summary:', error);
            } finally {
                setLoadingSummary(false);
            }
        } else {
            setSummary(contentStateCache.get(summaryCacheKey));
        }

        // Load content for active tab if needed
        if (activeTab === 0) {
            await loadTabContent('overview', conceptText, learningPath);
        } else if (activeTab === 2) {
            await loadTabContent('research_guide', conceptText, learningPath);
        }
    };

    // Load content for a specific tab
    const loadTabContent = async (action, conceptText, learningPath) => {
        const cacheKey = generateContentCacheKey(conceptText, action, learningPath);

        // Check cache first
        if (contentStateCache.has(cacheKey)) {
            const cachedContent = contentStateCache.get(cacheKey);
            if (action === 'overview') {
                setOverview(cachedContent);
            } else if (action === 'research_guide') {
                setResearchGuide(cachedContent);
            }
            return;
        }

        // Load from API
        if (action === 'overview') {
            setLoadingOverview(true);
        } else if (action === 'research_guide') {
            setLoadingResearchGuide(true);
        }

        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    concept: conceptText,
                    learningPath: learningPath,
                    action: action
                })
            });

            if (response.ok) {
                const data = await response.json();
                contentStateCache.set(cacheKey, data.content);

                if (action === 'overview') {
                    setOverview(data.content);
                } else if (action === 'research_guide') {
                    setResearchGuide(data.content);
                }
            }
        } catch (error) {
            console.error(`Error loading ${action}:`, error);
        } finally {
            if (action === 'overview') {
                setLoadingOverview(false);
            } else if (action === 'research_guide') {
                setLoadingResearchGuide(false);
            }
        }
    };

    // Load content when current concept changes
    useEffect(() => {
        const currentConcept = currentBreakdown?.concept || currentContent?.concept;
        if (!currentConcept) return;

        const learningPath = breakdownHistory.slice(0, currentHistoryIndex).map(item => item.concept);

        // Save current state before loading new content
        const previousConcept = breakdownHistory[currentHistoryIndex - 1]?.concept;
        if (previousConcept && (summary || overview || researchGuide)) {
            const previousPath = breakdownHistory.slice(0, currentHistoryIndex - 1).map(item => item.concept);
            saveContentStateToCache(previousConcept, previousPath);
        }

        loadContentForConcept(currentConcept, learningPath);
    }, [currentBreakdown?.concept, currentContent?.concept, currentHistoryIndex]);

    const handleTabChange = async (action, tabIndex) => {
        setActiveTab(tabIndex);

        const currentConcept = currentBreakdown?.concept || currentContent?.concept;
        if (!currentConcept) return;

        const learningPath = breakdownHistory.slice(0, currentHistoryIndex).map(item => item.concept);

        switch (action) {
            case 'overview':
                if (!overview) {
                    await loadTabContent('overview', currentConcept, learningPath);
                }
                break;

            case 'breakdown':
                // Breakdown is already loaded
                break;

            case 'research_guide':
                if (!researchGuide) {
                    await loadTabContent('research_guide', currentConcept, learningPath);
                }
                break;
        }
    };

    const handleBreakdownItemClick = (option) => {
        // Save current content state before navigating
        const currentConcept = currentBreakdown?.concept;
        if (currentConcept) {
            const learningPath = breakdownHistory.slice(0, currentHistoryIndex).map(item => item.concept);
            saveContentStateToCache(currentConcept, learningPath);
        }

        // Get the breakdown for the selected concept
        getContent(option, 'breakdown', false);
    };

    const handleBreadcrumbNavigate = (index) => {
        // Save current content state before navigating
        const currentConcept = currentBreakdown?.concept;
        if (currentConcept) {
            const learningPath = breakdownHistory.slice(0, currentHistoryIndex).map(item => item.concept);
            saveContentStateToCache(currentConcept, learningPath);
        }

        // Navigate to the selected history item
        goBackToHistory(index);
    };

    const handleStartChat = () => {
        setActiveTab(3); // Switch to chat tab
    };

    const startBreakdown = async () => {
        if (!concept.trim()) {
            setError('Please enter a concept to explore');
            return;
        }

        setError('');
        clearContentState();

        // Clear content cache for fresh start
        contentStateCache.clear();

        // Clear ALL chat history on server for completely fresh start
        try {
            const clearResponse = await fetch('/api/clear-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ learningPath: [] })
            });

            const clearResult = await clearResponse.json();
            console.log('Cleared all chat sessions:', clearResult);
        } catch (error) {
            console.warn('Could not clear chat history:', error);
        }

        // Get content with fresh start
        const freshState = {
            breakdownHistory: [],
            currentHistoryIndex: -1,
            currentBreakdown: null,
            currentContent: null,
            contentType: 'breakdown',
            error: '',
            expandedIndex: -1,
            contentCache: new Map(),
            importanceData: {},
            priorityData: {}
        };

        getContentWithFreshState(concept.trim(), 'breakdown', freshState);
    };

    // Reset selected index when breakdown changes
    useEffect(() => {
        setSelectedIndex(-1);
        setExpandedIndex(-1);
        setMenuButtonsReady(false);
    }, [currentBreakdown, currentContent, setSelectedIndex, setExpandedIndex, setMenuButtonsReady]);

    return (
        <Container maxWidth="md">
            {/* Main Input */}
            <MainInput
                concept={concept}
                setConcept={setConcept}
                onSubmit={startBreakdown}
                loading={loading}
            />

            {/* Error Display */}
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 4,
                        border: '3px solid #d32f2f',
                        borderRadius: 2,
                        fontWeight: 600
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {(loading || loadingMore) && (
                <LoadingState
                    loadingMessage={loadingMessage}
                    loadingProgress={loadingProgress}
                />
            )}

            {/* Results Section */}
            {(currentBreakdown || currentContent) && !loading && (
                <ResultsSection
                    currentBreakdown={currentBreakdown}
                    currentContent={currentContent}
                    contentType={contentType}
                    breakdownHistory={breakdownHistory}
                    currentHistoryIndex={currentHistoryIndex}
                    selectedIndex={selectedIndex}
                    expandedIndex={expandedIndex}
                    importanceData={importanceData}
                    priorityData={priorityData}
                    loadingMore={loadingMore}
                    resultsHeaderRef={resultsHeaderRef}
                    summary={summary}
                    overview={overview}
                    researchGuide={researchGuide}
                    loadingSummary={loadingSummary}
                    loadingOverview={loadingOverview}
                    loadingResearchGuide={loadingResearchGuide}
                    activeTab={activeTab}
                    onNavigateHistory={handleBreadcrumbNavigate}
                    onOptionClick={handleBreakdownItemClick}
                    onActionSelect={handleActionSelect}
                    onKeyDown={handleListboxKeyDown}
                    onBackToBreakdown={goBackToBreakdown}
                    onContentAction={(concept, action) => getContent(concept, action, false)}
                    onMoreClick={handleMoreConcepts}
                    onTabChange={handleTabChange}
                    onStartChat={handleStartChat}
                />
            )}
        </Container>
    );
};
