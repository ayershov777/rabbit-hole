// client/src/hooks/useConceptExplorer.js
import { useState, useCallback } from 'react';

// Utility function to convert markdown to HTML
const markdownToHtml = (text) => {
    if (!text) return '';

    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
};

const loadingMessages = [
    "Analyzing concept structure...",
    "Identifying key components...",
    "Mapping detailed areas...",
    "Organizing sub-concepts...",
    "Finalizing breakdown structure..."
];

const actionLoadingMessages = {
    breakdown: [
        "Analyzing concept structure...",
        "Identifying key components...",
        "Evaluating learning priorities...",
        "Organizing sub-concepts...",
        "Finalizing breakdown structure..."
    ],
    overview: [
        "Gathering key information...",
        "Organizing main concepts...",
        "Creating comprehensive overview...",
        "Structuring explanation...",
        "Finalizing overview content..."
    ],
    more: [
        "Expanding concept breadth...",
        "Finding additional areas...",
        "Identifying related concepts...",
        "Organizing new components...",
        "Finalizing expanded breakdown..."
    ]
};

export const useConceptExplorer = (getAuthHeaders, resultsHeaderRef) => {
    // State
    const [currentBreakdown, setCurrentBreakdown] = useState(null);
    const [currentContent, setCurrentContent] = useState(null);
    const [contentType, setContentType] = useState('breakdown');
    const [breakdownHistory, setBreakdownHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [menuButtonsReady, setMenuButtonsReady] = useState(false);
    const [contentCache, setContentCache] = useState(new Map());
    const [importanceData, setImportanceData] = useState({});
    const [priorityData, setPriorityData] = useState({});
    const [loadingMore, setLoadingMore] = useState(false);

    const getContentWithFreshState = useCallback(async (conceptText, action, freshState) => {
        console.log(`Getting fresh content for: "${conceptText}", action: ${action}`);

        const cacheKey = `${action}_${conceptText}_[]`;

        // Check cache
        if (freshState.contentCache.has(cacheKey)) {
            const cachedContent = freshState.contentCache.get(cacheKey);
            console.log(`Using cached content for: ${action} - ${conceptText}`);

            setCurrentBreakdown(cachedContent);
            setCurrentContent(null);
            setContentType('breakdown');

            setBreakdownHistory([cachedContent]);
            setCurrentHistoryIndex(0);

            setTimeout(() => {
                if (resultsHeaderRef.current) {
                    resultsHeaderRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
            return;
        }

        // Proceed with fresh API call
        console.log(`Fetching new content for: ${action} - ${conceptText}`);
        setLoading(true);
        setLoadingProgress(0);

        const messages = actionLoadingMessages[action] || loadingMessages;
        setLoadingMessage(messages[0]);

        setCurrentBreakdown(null);
        setCurrentContent(null);
        setImportanceData({});
        setPriorityData({});
        setSelectedIndex(-1);
        setExpandedIndex(-1);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const newProgress = Math.min(prev + Math.random() * 20, 90);
                const messageIndex = Math.floor((newProgress / 90) * (messages.length - 1));
                setLoadingMessage(messages[messageIndex]);
                return newProgress;
            });
        }, 800);

        try {
            const response = await fetch('/api/breakdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    concept: conceptText,
                    learningPath: [],
                    action: action
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to get ${action}`);
            }

            const data = await response.json();
            setLoadingProgress(100);
            setLoadingMessage("Complete!");

            setTimeout(async () => {
                const newBreakdown = {
                    concept: conceptText,
                    breakdown: data.breakdown,
                    priorities: data.priorities || {},
                    timestamp: Date.now()
                };

                setCurrentBreakdown(newBreakdown);
                setCurrentContent(null);
                setContentType('breakdown');
                setPriorityData(data.priorities || {});

                console.log('Setting fresh breakdown history:', [newBreakdown]);
                setBreakdownHistory([newBreakdown]);
                setCurrentHistoryIndex(0);

                // Generate importance explanations
                try {
                    const importanceResponse = await fetch('/api/bulk-importance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeaders(),
                        },
                        body: JSON.stringify({
                            concepts: data.breakdown,
                            learningPath: []
                        })
                    });

                    if (importanceResponse.ok) {
                        const importanceResult = await importanceResponse.json();
                        const processedImportance = {};
                        Object.entries(importanceResult.importance).forEach(([key, value]) => {
                            processedImportance[key] = markdownToHtml(value);
                        });
                        setImportanceData(processedImportance);
                    }
                } catch (importanceError) {
                    console.warn('Could not load importance explanations:', importanceError);
                }

                // Cache the content
                setContentCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(cacheKey, newBreakdown);
                    return newCache;
                });

                setLoading(false);
                clearInterval(progressInterval);

                setTimeout(() => {
                    if (resultsHeaderRef.current) {
                        resultsHeaderRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 100);

            }, 500);

        } catch (error) {
            console.error(`Error getting ${action}:`, error);
            setLoading(false);
            clearInterval(progressInterval);
            throw error;
        }
    }, [getAuthHeaders, resultsHeaderRef]);

    const getContent = useCallback(async (conceptText, action = 'breakdown', forceFreshStart = false) => {
        let learningPath = [];

        if (!forceFreshStart) {
            const activePath = breakdownHistory.slice(0, currentHistoryIndex + 1);
            learningPath = activePath.filter(item => item && item.concept).map(item => item.concept);
        }

        console.log(`Getting content for: "${conceptText}", action: ${action}, learningPath: [${learningPath.join(', ')}], forceFreshStart: ${forceFreshStart}`);

        const cacheKey = `${action}_${conceptText}_${learningPath.join('->')}`;

        // Check cache
        if (contentCache.has(cacheKey)) {
            const cachedContent = contentCache.get(cacheKey);
            console.log(`Using cached content for: ${action} - ${conceptText}`);

            setSelectedIndex(-1);
            setExpandedIndex(-1);

            if (action === 'breakdown') {
                setCurrentBreakdown(cachedContent);
                setCurrentContent(null);
                setContentType('breakdown');
                setPriorityData(cachedContent.priorities || {});

                if (cachedContent.concept !== (breakdownHistory[currentHistoryIndex]?.concept)) {
                    console.log('Cached breakdown differs from current, updating history');
                    setBreakdownHistory(prev => {
                        const newHistory = [...prev];
                        const newIndex = currentHistoryIndex + 1;
                        newHistory[newIndex] = cachedContent;
                        return newHistory.slice(0, newIndex + 1);
                    });
                    setCurrentHistoryIndex(prev => prev + 1);
                }
            } else {
                setCurrentContent(cachedContent);
                setContentType(action);
            }

            setTimeout(() => {
                if (resultsHeaderRef.current) {
                    resultsHeaderRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);

            return;
        }

        // Fetch new content
        console.log(`Fetching new content for: ${action} - ${conceptText}`);
        setLoading(true);
        setLoadingProgress(0);

        const messages = actionLoadingMessages[action] || loadingMessages;
        setLoadingMessage(messages[0]);

        if (action === 'breakdown') {
            setCurrentBreakdown(null);
            setCurrentContent(null);
            setImportanceData({});
            setPriorityData({});
        } else {
            setCurrentContent(null);
        }

        setSelectedIndex(-1);
        setExpandedIndex(-1);

        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const newProgress = Math.min(prev + Math.random() * 20, 90);
                const messageIndex = Math.floor((newProgress / 90) * (messages.length - 1));
                setLoadingMessage(messages[messageIndex]);
                return newProgress;
            });
        }, 800);

        try {
            const endpoint = action === 'breakdown' ? '/api/breakdown' : '/api/content';
            const response = await fetch(endpoint, {
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to get ${action}`);
            }

            const data = await response.json();

            setLoadingProgress(100);
            setLoadingMessage("Complete!");

            setTimeout(async () => {
                let contentToCache;

                if (action === 'breakdown') {
                    const newBreakdown = {
                        concept: conceptText,
                        breakdown: data.breakdown,
                        priorities: data.priorities || {},
                        timestamp: Date.now()
                    };

                    setCurrentBreakdown(newBreakdown);
                    setCurrentContent(null);
                    setContentType('breakdown');
                    setPriorityData(data.priorities || {});
                    contentToCache = newBreakdown;

                    // Generate importance explanations
                    try {
                        const importanceResponse = await fetch('/api/bulk-importance', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...getAuthHeaders(),
                            },
                            body: JSON.stringify({
                                concepts: data.breakdown,
                                learningPath: learningPath
                            })
                        });

                        if (importanceResponse.ok) {
                            const importanceResult = await importanceResponse.json();
                            const processedImportance = {};
                            Object.entries(importanceResult.importance).forEach(([key, value]) => {
                                processedImportance[key] = markdownToHtml(value);
                            });
                            setImportanceData(processedImportance);
                        }
                    } catch (importanceError) {
                        console.warn('Could not load importance explanations:', importanceError);
                    }

                    setBreakdownHistory(prev => {
                        const newHistory = [...prev];
                        const newIndex = currentHistoryIndex + 1;
                        newHistory[newIndex] = newBreakdown;
                        return newHistory.slice(0, newIndex + 1);
                    });

                    setCurrentHistoryIndex(prev => prev + 1);
                } else {
                    const newContent = {
                        concept: conceptText,
                        content: markdownToHtml(data.content),
                        action: action,
                        timestamp: Date.now()
                    };

                    setCurrentContent(newContent);
                    setContentType(action);
                    contentToCache = newContent;
                }

                // Cache the content
                setContentCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(cacheKey, contentToCache);
                    return newCache;
                });

                setLoading(false);
                clearInterval(progressInterval);

                setTimeout(() => {
                    if (resultsHeaderRef.current) {
                        resultsHeaderRef.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 100);

            }, 500);

        } catch (error) {
            console.error(`Error getting ${action}:`, error);
            setLoading(false);
            clearInterval(progressInterval);
            throw error;
        }
    }, [getAuthHeaders, resultsHeaderRef, breakdownHistory, currentHistoryIndex, contentCache]);

    const handleMoreConcepts = useCallback(async () => {
        if (!currentBreakdown) return;

        const activePath = breakdownHistory.slice(0, currentHistoryIndex + 1);
        const learningPath = activePath.filter(item => item && item.concept).map(item => item.concept);

        console.log(`Getting more concepts for: "${currentBreakdown.concept}", learningPath: [${learningPath.join(', ')}]`);

        setLoadingMore(true);
        setLoadingProgress(0);

        const messages = actionLoadingMessages.more;
        setLoadingMessage(messages[0]);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                const newProgress = Math.min(prev + Math.random() * 20, 90);
                const messageIndex = Math.floor((newProgress / 90) * (messages.length - 1));
                setLoadingMessage(messages[messageIndex]);
                return newProgress;
            });
        }, 800);

        try {
            const response = await fetch('/api/more-concepts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    concept: currentBreakdown.concept,
                    existingConcepts: currentBreakdown.breakdown,
                    learningPath: learningPath
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get more concepts');
            }

            const data = await response.json();
            setLoadingProgress(100);
            setLoadingMessage("Complete!");

            setTimeout(async () => {
                // Merge new concepts with existing ones
                const updatedBreakdown = {
                    ...currentBreakdown,
                    breakdown: [...currentBreakdown.breakdown, ...data.breakdown],
                    priorities: { ...currentBreakdown.priorities, ...data.priorities },
                    timestamp: Date.now()
                };

                setCurrentBreakdown(updatedBreakdown);
                setPriorityData({ ...priorityData, ...data.priorities });

                // Update the history
                setBreakdownHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[currentHistoryIndex] = updatedBreakdown;
                    return newHistory;
                });

                // Generate importance explanations for new concepts
                try {
                    const importanceResponse = await fetch('/api/bulk-importance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...getAuthHeaders(),
                        },
                        body: JSON.stringify({
                            concepts: data.breakdown,
                            learningPath: learningPath
                        })
                    });

                    if (importanceResponse.ok) {
                        const importanceResult = await importanceResponse.json();
                        const processedImportance = {};
                        Object.entries(importanceResult.importance).forEach(([key, value]) => {
                            processedImportance[key] = markdownToHtml(value);
                        });
                        setImportanceData(prev => ({ ...prev, ...processedImportance }));
                    }
                } catch (importanceError) {
                    console.warn('Could not load importance explanations for new concepts:', importanceError);
                }

                setLoadingMore(false);
                clearInterval(progressInterval);

                // Removed the autoscroll logic here
                // No automatic scrolling to new concepts

            }, 500);

        } catch (error) {
            console.error('Error getting more concepts:', error);
            setLoadingMore(false);
            clearInterval(progressInterval);
            throw error;
        }
    }, [getAuthHeaders, currentBreakdown, breakdownHistory, currentHistoryIndex, priorityData, importanceData]);

    const handleOptionClick = useCallback((option, index) => {
        setSelectedIndex(index);
        if (expandedIndex === index) {
            setMenuButtonsReady(false);
            setExpandedIndex(-1);
            setSelectedIndex(-1);
        } else {
            setExpandedIndex(index);
            setTimeout(() => {
                setMenuButtonsReady(true);
            }, 150);
        }
    }, [expandedIndex]);

    const handleMenuCollapse = useCallback(() => {
        setMenuButtonsReady(false);
        setExpandedIndex(-1);
        setSelectedIndex(-1);
    }, []);

    const handleActionSelect = useCallback((option, action) => {
        setExpandedIndex(-1);

        if (action === 'breakdown') {
            getContent(option, action, false);
        } else {
            getContent(option, action, false);
        }
    }, [getContent]);

    const goBackToHistory = useCallback((index) => {
        const historyItem = breakdownHistory[index];
        setCurrentBreakdown(historyItem);
        setCurrentContent(null);
        setContentType('breakdown');
        setCurrentHistoryIndex(index);
        setSelectedIndex(-1);
        setExpandedIndex(-1);
        setPriorityData(historyItem.priorities || {});
    }, [breakdownHistory]);

    const goBackToBreakdown = useCallback(() => {
        if (currentHistoryIndex >= 0 && breakdownHistory[currentHistoryIndex]) {
            setCurrentBreakdown(breakdownHistory[currentHistoryIndex]);
            setCurrentContent(null);
            setContentType('breakdown');
            setSelectedIndex(-1);
            setExpandedIndex(-1);
            setPriorityData(breakdownHistory[currentHistoryIndex].priorities || {});
        }
    }, [currentHistoryIndex, breakdownHistory]);

    return {
        // State
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
        // State setters
        setSelectedIndex,
        setExpandedIndex,
        setMenuButtonsReady,
        // Methods
        getContentWithFreshState,
        getContent,
        goBackToHistory,
        goBackToBreakdown,
        handleOptionClick,
        handleMenuCollapse,
        handleActionSelect,
        handleMoreConcepts
    };
};
