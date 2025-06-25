import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Button
} from '@mui/material';
import { Lightbulb, ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthButton } from './components/AuthButton';
import { MainInput } from './components/MainInput';
import { LoadingState } from './components/LoadingState';
import { BreadcrumbNavigation } from './components/BreadcrumbNavigation';
import { BreakdownList } from './components/BreakdownList';
import { ContentDisplay } from './components/ContentDisplay';

const loadingMessages = [
  "Analyzing concept complexity...",
  "Identifying knowledge prerequisites...",
  "Mapping learning pathways...",
  "Organizing foundational concepts...",
  "Finalizing breakdown structure..."
];

const actionLoadingMessages = {
  breakdown: [
    "Analyzing concept complexity...",
    "Identifying knowledge prerequisites...",
    "Mapping learning pathways...",
    "Organizing foundational concepts...",
    "Finalizing breakdown structure..."
  ],
  importance: [
    "Analyzing concept importance...",
    "Identifying key benefits...",
    "Connecting to broader context...",
    "Highlighting practical applications...",
    "Finalizing importance explanation..."
  ],
  overview: [
    "Gathering key information...",
    "Organizing main concepts...",
    "Creating comprehensive overview...",
    "Structuring explanation...",
    "Finalizing overview content..."
  ]
};

export const RabbitHole = () => {
  const { getAuthHeaders } = useAuth();
  const [concept, setConcept] = useState('');
  const [currentBreakdown, setCurrentBreakdown] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [contentType, setContentType] = useState('breakdown');
  const [breakdownHistory, setBreakdownHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [menuButtonsReady, setMenuButtonsReady] = useState(false);
  const [contentCache, setContentCache] = useState(new Map());

  const resultsHeaderRef = useRef(null);

  const getContent = async (conceptText, action = 'breakdown') => {
    // Create learning path from current breadcrumb history up to current index
    const activePath = breakdownHistory.slice(0, currentHistoryIndex + 1);
    const learningPath = activePath.map(item => item.concept);

    // Create cache key for this specific content
    const cacheKey = `${action}_${conceptText}_${learningPath.join('->')}`;

    // Check if we already have this content cached
    if (contentCache.has(cacheKey)) {
      const cachedContent = contentCache.get(cacheKey);
      console.log(`Using cached content for: ${action} - ${conceptText}`);

      // Display cached content immediately without loading
      setSelectedIndex(-1);
      setExpandedIndex(-1);

      if (action === 'breakdown') {
        setCurrentBreakdown(cachedContent);
        setCurrentContent(null);
        setContentType('breakdown');

        // Update history if this is a new breakdown
        if (cachedContent.concept !== (breakdownHistory[currentHistoryIndex]?.concept)) {
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

      // Scroll to results
      setTimeout(() => {
        if (resultsHeaderRef.current) {
          resultsHeaderRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);

      return; // Exit early, no need to fetch
    }

    // If not cached, proceed with loading and API call
    console.log(`Fetching new content for: ${action} - ${conceptText}`);
    setLoading(true);
    setError('');
    setLoadingProgress(0);

    const messages = actionLoadingMessages[action] || loadingMessages;
    setLoadingMessage(messages[0]);

    if (action === 'breakdown') {
      setCurrentBreakdown(null);
      setCurrentContent(null);
    } else {
      setCurrentContent(null);
    }

    setSelectedIndex(-1);
    setExpandedIndex(-1);

    // Simulate progress updates for better UX
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

      setTimeout(() => {
        let contentToCache;

        if (action === 'breakdown') {
          const newBreakdown = {
            concept: conceptText,
            breakdown: data.breakdown,
            timestamp: Date.now()
          };

          setCurrentBreakdown(newBreakdown);
          setCurrentContent(null);
          setContentType('breakdown');
          contentToCache = newBreakdown;

          // Add to history or update existing
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
            content: data.content,
            action: action,
            timestamp: Date.now()
          };

          setCurrentContent(newContent);
          setContentType(action);
          contentToCache = newContent;
        }

        // Cache the content for future use
        setContentCache(prev => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, contentToCache);
          return newCache;
        });

        setLoading(false);
        clearInterval(progressInterval);

        // Scroll to results header after results load
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
      setError(error.message || `Failed to generate ${action}. Please try again.`);
      setLoading(false);
      clearInterval(progressInterval);
    }
  };

  const startBreakdown = async () => {
    if (!concept.trim()) {
      setError('Please enter a concept to understand');
      return;
    }

    // Clear everything when starting fresh
    setBreakdownHistory([]);
    setCurrentHistoryIndex(-1);
    setCurrentBreakdown(null);
    setCurrentContent(null);
    setContentType('breakdown');
    setError('');
    setExpandedIndex(-1);
    setContentCache(new Map());

    // Clear chat history on server for fresh start
    try {
      await fetch('/api/clear-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ learningPath: [] })
      });
    } catch (error) {
      console.warn('Could not clear chat history:', error);
    }

    getContent(concept.trim(), 'breakdown');
  };

  const handleOptionClick = (option, index) => {
    setSelectedIndex(index);
    if (expandedIndex === index) {
      handleMenuCollapse();
    } else {
      setExpandedIndex(index);
      setTimeout(() => {
        setMenuButtonsReady(true);
      }, 150);
    }
  };

  const handleMenuCollapse = () => {
    setMenuButtonsReady(false);
    setExpandedIndex(-1);
    setSelectedIndex(-1);
  };

  const handleActionSelect = (option, action) => {
    setExpandedIndex(-1);
    getContent(option, action);
  };

  const goBackToHistory = (index) => {
    const historyItem = breakdownHistory[index];
    setCurrentBreakdown(historyItem);
    setCurrentContent(null);
    setContentType('breakdown');
    setCurrentHistoryIndex(index);
    setSelectedIndex(-1);
    setExpandedIndex(-1);
  };

  const goBackToBreakdown = () => {
    if (currentHistoryIndex >= 0 && breakdownHistory[currentHistoryIndex]) {
      setCurrentBreakdown(breakdownHistory[currentHistoryIndex]);
      setCurrentContent(null);
      setContentType('breakdown');
      setSelectedIndex(-1);
      setExpandedIndex(-1);
    }
  };

  const handleListboxKeyDown = (event) => {
    if (!currentBreakdown) return;

    const activeElement = document.activeElement;
    const isActionButtonFocused = activeElement && activeElement.closest('[data-option-index]') && activeElement.tagName === 'BUTTON';

    if (isActionButtonFocused && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      return;
    }

    const maxIndex = currentBreakdown.breakdown.length - 1;
    let newIndex = selectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedIndex === -1) {
          newIndex = 0;
        } else {
          newIndex = selectedIndex < maxIndex ? selectedIndex + 1 : 0;
        }
        setSelectedIndex(newIndex);
        setExpandedIndex(newIndex);
        setTimeout(() => {
          setMenuButtonsReady(true);
        }, 150);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (selectedIndex === -1) {
          newIndex = maxIndex;
        } else {
          newIndex = selectedIndex > 0 ? selectedIndex - 1 : maxIndex;
        }
        setSelectedIndex(newIndex);
        setExpandedIndex(newIndex);
        setTimeout(() => {
          setMenuButtonsReady(true);
        }, 150);
        break;
      case 'Tab':
        if (expandedIndex >= 0 && menuButtonsReady) {
          return;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
          const option = currentBreakdown.breakdown[selectedIndex];
          handleActionSelect(option, 'importance');
        }
        return;
      case 'Escape':
        event.preventDefault();
        handleMenuCollapse();
        return;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        setSelectedIndex(newIndex);
        setExpandedIndex(newIndex);
        setTimeout(() => {
          setMenuButtonsReady(true);
        }, 150);
        break;
      case 'End':
        event.preventDefault();
        newIndex = maxIndex;
        setSelectedIndex(newIndex);
        setExpandedIndex(newIndex);
        setTimeout(() => {
          setMenuButtonsReady(true);
        }, 150);
        break;
      default:
        return;
    }

    // Scroll the selected item into view
    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-option-index="${newIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 50);
  };

  const getContentTitle = () => {
    if (!currentContent) return '';

    switch (currentContent.action) {
      case 'importance':
        return `Why "${currentContent.concept}" is Important`;
      case 'overview':
        return `Overview of "${currentContent.concept}"`;
      default:
        return currentContent.concept;
    }
  };

  const getContentDescription = () => {
    if (!currentContent) return '';

    switch (currentContent.action) {
      case 'importance':
        return 'Understanding the significance and benefits:';
      case 'overview':
        return 'Key concepts and principles:';
      default:
        return '';
    }
  };

  // Reset selected index when breakdown changes
  useEffect(() => {
    setSelectedIndex(-1);
    setExpandedIndex(-1);
    setMenuButtonsReady(false);
  }, [currentBreakdown, currentContent]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      py: 4
    }}>
      <AuthButton />
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Lightbulb size={48} color="#1a1a2e" />
          </Box>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              color: '#1a1a2e',
              mb: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 60,
                height: 4,
                background: 'linear-gradient(90deg, #0066ff, #00b894)',
                borderRadius: 1
              }
            }}
          >
            Knowledge Breakdown
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#4a4a6a',
              fontWeight: 500,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Enter any concept and discover the foundational knowledge you need to understand it
          </Typography>
        </Box>

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
          <Box>
            {/* Breadcrumb History */}
            <BreadcrumbNavigation
              history={breakdownHistory}
              currentIndex={currentHistoryIndex}
              onNavigate={goBackToHistory}
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
                  {(contentType === 'importance' || contentType === 'overview') && (
                    <Button
                      onClick={goBackToBreakdown}
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
                      ? `To understand "${currentBreakdown.concept}"`
                      : getContentTitle()
                    }
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {contentType === 'breakdown'
                      ? 'You should learn these foundational concepts first:'
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
                    onOptionClick={handleOptionClick}
                    onActionSelect={handleActionSelect}
                    onKeyDown={handleListboxKeyDown}
                  />
                )}

                {/* Content Display (Importance/Overview) */}
                {currentContent && (
                  <ContentDisplay
                    content={currentContent}
                    onActionSelect={getContent}
                  />
                )}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Shimmer Animation */}
        <style jsx>{`
            @keyframes shimmer {
              0% {
                left: -100%;
              }
              100% {
                left: 100%;
              }
            }
          `}</style>
      </Container>
    </Box>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <RabbitHole />
    </AuthProvider>
  );
};
