import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
  Breadcrumbs,
  Stack,
  Avatar,
  List,
  ListItem,
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  History,
  Search,
  TrendingUp,
  HelpCircle,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthButton } from './components/AuthButton';

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
  const [contentType, setContentType] = useState('breakdown'); // 'breakdown', 'importance', 'overview'
  const [breakdownHistory, setBreakdownHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);

  // Content cache to avoid re-generating same content
  const [contentCache, setContentCache] = useState(new Map());

  // Expandable panel state
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [menuButtonsReady, setMenuButtonsReady] = useState(false);

  const listboxRef = useRef(null);
  const resultsHeaderRef = useRef(null);

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
    setExpandedIndex(-1); // Collapse any expanded panels

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

            // If we're not at the end of history, replace from this point forward
            newHistory[newIndex] = newBreakdown;
            // Remove any items beyond this point
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
    setContentCache(new Map()); // Clear the cache for fresh start

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
    // Toggle expansion - if already expanded, collapse; otherwise expand
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
    setExpandedIndex(-1); // Collapse the panel
    getContent(option, action);
  };

  const goBackToHistory = (index) => {
    const historyItem = breakdownHistory[index];
    setCurrentBreakdown(historyItem);
    setCurrentContent(null);
    setContentType('breakdown');
    setCurrentHistoryIndex(index); // Don't truncate history, just change current index
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

  const handleListboxFocus = () => {
    // Don't auto-select any item on focus - let arrow keys do the selection
  };

  const handleListboxBlur = (event) => {
    // Only reset if focus is not moving to action buttons
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      // Close any open menus when focus leaves the listbox entirely
      setTimeout(() => {
        handleMenuCollapse();
      }, 100);
    }
  };

  const handleListboxKeyDown = (event) => {
    if (!currentBreakdown) return;

    // Check if focus is currently on an action button
    const activeElement = document.activeElement;
    const isActionButtonFocused = activeElement && activeElement.closest('[data-option-index]') && activeElement.tagName === 'BUTTON';

    // If an action button is focused, don't handle arrow keys at the listbox level
    if (isActionButtonFocused && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      return;
    }

    const maxIndex = currentBreakdown.breakdown.length - 1;
    let newIndex = selectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (selectedIndex === -1) {
          // First arrow press - select first item
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
          // First arrow press - select last item
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
        // Allow natural tab navigation through action buttons when expanded
        if (expandedIndex >= 0 && menuButtonsReady) {
          // Let tab work naturally through the action buttons
          return;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
          const option = currentBreakdown.breakdown[selectedIndex];
          // Default to importance action on Enter
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !loading) {
      event.preventDefault();
      startBreakdown();
    }
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

  const getCurrentConcept = () => {
    if (currentContent) return currentContent.concept;
    if (currentBreakdown) return currentBreakdown.concept;
    return '';
  };

  const getVisibleHistory = () => {
    return breakdownHistory.slice(0, currentHistoryIndex + 1);
  };

  // Reset selected index when breakdown changes
  useEffect(() => {
    setSelectedIndex(-1);
    setLastSelectedIndex(-1);
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
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            border: '3px solid #1a1a2e',
            borderRadius: 2,
            boxShadow: '4px 4px 0px #1a1a2e',
            position: 'relative',
            overflow: 'hidden',
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
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Search size={20} color="#1a1a2e" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
                What do you want to understand?
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              <TextField
                fullWidth
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Machine Learning, Quantum Physics, Blockchain..."
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    height: '56px',
                    '& fieldset': {
                      borderWidth: 3,
                      borderColor: '#1a1a2e'
                    },
                    '&:hover fieldset': {
                      borderColor: '#1a1a2e'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0066ff',
                      boxShadow: '0 0 0 4px rgba(0, 102, 255, 0.2)'
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={startBreakdown}
                disabled={loading}
                sx={{
                  background: '#1a1a2e',
                  border: '3px solid #1a1a2e',
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  px: 4,
                  height: '56px',
                  minWidth: '180px',
                  position: 'relative',
                  overflow: 'hidden',
                  color: '#fafafa !important',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #0066ff, #00b894)',
                    transition: 'left 0.5s ease',
                    zIndex: 0
                  },
                  '& .MuiButton-startIcon': {
                    position: 'relative',
                    zIndex: 2,
                    color: '#fafafa !important'
                  },
                  '&:hover::before, &:focus::before': {
                    left: 0
                  },
                  '&:hover': {
                    background: '#1a1a2e',
                    borderColor: '#1a1a2e',
                    boxShadow: '0 6px 20px rgba(26, 26, 46, 0.3)',
                    color: '#fafafa !important'
                  },
                  '&:focus': {
                    outline: '4px solid #0066ff',
                    outlineOffset: 2,
                    color: '#fafafa !important'
                  },
                  '& > span': {
                    position: 'relative',
                    zIndex: 2,
                    color: '#fafafa !important'
                  }
                }}
                startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fafafa !important' }} /> : <ChevronRight size={16} />}
              >
                <Box component="span" sx={{ position: 'relative', zIndex: 2, color: '#fafafa !important' }}>
                  {loading ? 'Analyzing...' : 'Break It Down'}
                </Box>
              </Button>
            </Box>
          </Stack>
        </Paper>

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
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              border: '3px solid #e9ecef',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a1a2e' }}>
              {loadingMessage}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={loadingProgress}
              sx={{
                height: 12,
                borderRadius: 2,
                border: '2px solid #1a1a2e',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #0066ff, #00b894)',
                  borderRadius: 0
                }
              }}
            />
            <Typography variant="body2" sx={{ mt: 2, color: '#4a4a6a' }}>
              {Math.round(loadingProgress)}% complete
            </Typography>
          </Paper>
        )}

        {/* Results Section */}
        {(currentBreakdown || currentContent) && !loading && (
          <Box>
            {/* Breadcrumb History */}
            {getVisibleHistory().length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  my: 4,
                  border: '2px solid #e9ecef',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <History size={16} color="#4a4a6a" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4a4a6a' }}>
                    Learning Path:
                  </Typography>
                </Box>
                <Breadcrumbs separator="›" sx={{ flexWrap: 'wrap' }}>
                  {getVisibleHistory().map((item, index) => (
                    <Chip
                      key={index}
                      label={item.concept.length > 30 ? item.concept.substring(0, 30) + '...' : item.concept}
                      onClick={() => goBackToHistory(index)}
                      variant={index === currentHistoryIndex ? 'filled' : 'outlined'}
                      sx={{
                        margin: '2px 0',
                        fontWeight: 600,
                        border: '3px solid #1a1a2e',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        ...(index === currentHistoryIndex ? {
                          background: '#1a1a2e',
                          color: '#fafafa',
                          '&:hover': {
                            background: '#1a1a2e'
                          }
                        } : {
                          background: '#fafafa',
                          color: '#1a1a2e',
                          '&:hover': {
                            background: '#f5f5f5',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(26, 26, 46, 0.15)'
                          }
                        })
                      }}
                    />
                  ))}
                </Breadcrumbs>
              </Paper>
            )}

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
                  <>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a2e' }}>
                      Click on a concept or use arrow keys to explore options:
                    </Typography>

                    <List
                      ref={listboxRef}
                      role="listbox"
                      tabIndex={0}
                      aria-label="Knowledge areas to explore"
                      onKeyDown={handleListboxKeyDown}
                      onFocus={handleListboxFocus}
                      onBlur={handleListboxBlur}
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
                      {currentBreakdown.breakdown.map((option, index) => (
                        <ListItem
                          key={index}
                          role="option"
                          data-option-index={index}
                          aria-selected={selectedIndex === index}
                          aria-expanded={expandedIndex === index}
                          onClick={() => handleOptionClick(option, index)}
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
                                        handleActionSelect(option, action.id);
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
                )}

                {/* Content Display (Importance/Overview) */}
                {currentContent && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#1a1a2e',
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {currentContent.content}
                    </Typography>

                    {/* Action Buttons for Content Views */}
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
                          .filter(action => action.id !== currentContent.action)
                          .map((action) => (
                            <Grid item xs={12} sm={6} key={action.id}>
                              <Button
                                fullWidth
                                variant={action.variant}
                                onClick={() => getContent(currentContent.concept, action.id)}
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
                  </Box>
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
