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
        setSelectedIndex,
        setExpandedIndex,
        setMenuButtonsReady,
        getContentWithFreshState,
        getContent,
        goBackToHistory,
        goBackToBreakdown,
        handleOptionClick,
        handleMenuCollapse,
        handleActionSelect
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

    const startBreakdown = async () => {
        if (!concept.trim()) {
            setError('Please enter a concept to explore');
            return;
        }

        setError('');

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
            {loading && (
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
                    resultsHeaderRef={resultsHeaderRef}
                    onNavigateHistory={goBackToHistory}
                    onOptionClick={handleOptionClick}
                    onActionSelect={handleActionSelect}
                    onKeyDown={handleListboxKeyDown}
                    onBackToBreakdown={goBackToBreakdown}
                    onContentAction={(concept, action) => getContent(concept, action, false)}
                />
            )}
        </Container>
    );
};
