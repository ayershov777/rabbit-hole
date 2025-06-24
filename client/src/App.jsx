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
  ListItem
} from '@mui/material';
import {
  ChevronRight,
  Lightbulb,
  History,
  Search,
  TrendingUp
} from 'lucide-react';

const loadingMessages = [
  "Analyzing concept complexity...",
  "Identifying knowledge prerequisites...",
  "Mapping learning pathways...",
  "Organizing foundational concepts...",
  "Finalizing breakdown structure..."
];

export const App = () => {
  const [concept, setConcept] = useState('');
  const [currentBreakdown, setCurrentBreakdown] = useState(null);
  const [breakdownHistory, setBreakdownHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
  const listboxRef = useRef(null);
  const resultsHeaderRef = useRef(null);

  const getBreakdown = async (conceptText) => {
    setLoading(true);
    setError('');
    setLoadingProgress(0);
    setLoadingMessage(loadingMessages[0]);
    setCurrentBreakdown(null);
    setSelectedIndex(-1);

    // Simulate progress updates for better UX
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 20, 90);
        const messageIndex = Math.floor((newProgress / 90) * (loadingMessages.length - 1));
        setLoadingMessage(loadingMessages[messageIndex]);
        return newProgress;
      });
    }, 800);

    try {
      // Create learning path from current breadcrumb history
      const learningPath = breakdownHistory.map(item => item.concept);
      
      const response = await fetch('/api/breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          concept: conceptText,
          learningPath: learningPath
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get breakdown');
      }

      const data = await response.json();

      setLoadingProgress(100);
      setLoadingMessage("Complete!");

      setTimeout(() => {
        const newBreakdown = {
          concept: conceptText,
          breakdown: data.breakdown,
          timestamp: Date.now()
        };

        setCurrentBreakdown(newBreakdown);
        
        // Only add to history if it's not a duplicate of the last item
        setBreakdownHistory(prev => {
          if (prev.length === 0 || prev[prev.length - 1].concept !== conceptText) {
            return [...prev, newBreakdown];
          }
          return prev;
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
      console.error('Error getting breakdown:', error);
      setError(error.message || 'Failed to generate knowledge breakdown. Please try again.');
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
    setCurrentBreakdown(null);
    setError('');
    
    // Clear chat history on server for fresh start
    try {
      await fetch('/api/clear-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ learningPath: [] })
      });
    } catch (error) {
      console.warn('Could not clear chat history:', error);
    }
    
    getBreakdown(concept.trim());
  };

  const selectConcept = (newConcept) => {
    getBreakdown(newConcept);
  };

  const goBackToHistory = (index) => {
    const historyItem = breakdownHistory[index];
    setCurrentBreakdown(historyItem);
    setBreakdownHistory(prev => prev.slice(0, index + 1));
    setSelectedIndex(-1);
  };

  const handleListboxFocus = () => {
    // Restore the last selected index when regaining focus
    if (lastSelectedIndex >= 0 && currentBreakdown && lastSelectedIndex < currentBreakdown.breakdown.length) {
      setSelectedIndex(lastSelectedIndex);
    }
  };

  const handleListboxBlur = (event) => {
    // Only reset if focus is leaving the listbox entirely
    // (not moving to a child element)
    if (!event.currentTarget.contains(event.relatedTarget)) {
      // Store the current selection before hiding it
      setLastSelectedIndex(selectedIndex);
      setSelectedIndex(-1);
    }
  };

  const handleListboxKeyDown = (event) => {
    if (!currentBreakdown) return;

    const maxIndex = currentBreakdown.breakdown.length - 1;
    let newIndex = selectedIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = selectedIndex < maxIndex ? selectedIndex + 1 : 0;
        setSelectedIndex(newIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = selectedIndex > 0 ? selectedIndex - 1 : maxIndex;
        setSelectedIndex(newIndex);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
          selectConcept(currentBreakdown.breakdown[selectedIndex]);
        }
        return; // Don't scroll on Enter
      case 'Escape':
        event.preventDefault();
        setSelectedIndex(-1);
        return; // Don't scroll on Escape
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        setSelectedIndex(newIndex);
        break;
      case 'End':
        event.preventDefault();
        newIndex = maxIndex;
        setSelectedIndex(newIndex);
        break;
      default:
        return; // Don't scroll for other keys
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
    }, 50); // Small delay to ensure state update is complete
  };

  const handleOptionClick = (option, index) => {
    setSelectedIndex(index);
    selectConcept(option);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !loading) {
      event.preventDefault();
      startBreakdown();
    }
  };

  // Reset selected index when breakdown changes
  useEffect(() => {
    setSelectedIndex(-1);
    setLastSelectedIndex(-1);
  }, [currentBreakdown]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
      py: 4
    }}>
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
        {currentBreakdown && !loading && (
          <Box>
            {/* Breadcrumb History */}
            {breakdownHistory.length > 1 && (
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
                  {breakdownHistory.map((item, index) => (
                    <Chip
                      key={index}
                      label={item.concept.length > 30 ? item.concept.substring(0, 30) + '...' : item.concept}
                      onClick={() => goBackToHistory(index)}
                      variant={index === breakdownHistory.length - 1 ? 'filled' : 'outlined'}
                      sx={{
                        margin: '2px 0',
                        fontWeight: 600,
                        border: '3px solid #1a1a2e',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        ...(index === breakdownHistory.length - 1 ? {
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

            {/* Results Header */}
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
                  <Typography 
                    ref={resultsHeaderRef}
                    variant="h5" 
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
                    To understand "{currentBreakdown.concept}"
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    You should learn these foundational concepts first:
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a1a2e' }}>
                  Select a concept to explore further:
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
                      outline: 'none'
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
                      onClick={() => handleOptionClick(option, index)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        mb: 2,
                        border: '3px solid #1a1a2e',
                        borderRadius: 2,
                        background: selectedIndex === index ? '#f5f5f5' : '#fafafa',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transform: selectedIndex === index ? 'translateX(12px)' : 'translateX(0)',
                        boxShadow: selectedIndex === index ? '4px 4px 0px #1a1a2e' : 'none',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: 4,
                          height: '100%',
                          background: '#0066ff',
                          transform: selectedIndex === index ? 'scaleY(1)' : 'scaleY(0)',
                          transition: 'transform 0.3s ease',
                          transformOrigin: 'bottom'
                        },
                        '&:hover': {
                          background: '#f5f5f5',
                          transform: 'translateX(12px)',
                          boxShadow: '4px 4px 0px #1a1a2e'
                        },
                        '&:hover::before': {
                          transform: 'scaleY(1)'
                        }
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
                      <ChevronRight 
                        size={20} 
                        color="#4a4a6a"
                        style={{
                          transition: 'transform 0.3s ease',
                          transform: selectedIndex === index ? 'translateX(4px)' : 'translateX(0)'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
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
