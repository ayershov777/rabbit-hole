import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LiveSupportContext = createContext({});

export const useLiveSupport = () => {
    const context = useContext(LiveSupportContext);
    if (!context) {
        throw new Error('useLiveSupport must be used within a LiveSupportProvider');
    }
    return context;
};

export const LiveSupportProvider = ({ children }) => {
    const { getAuthHeaders, isAuthenticated } = useAuth();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeView, setActiveView] = useState('profile'); // 'profile', 'matches', 'chat'
    const [activeChatUser, setActiveChatUser] = useState(null);

    // Profile state
    const [profile, setProfile] = useState({
        whoYouAre: '',
        whoYouAreLookingFor: '',
        mentoringSubjects: '',
        professionalServices: ''
    });
    const [profileComplete, setProfileComplete] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    // Matching state
    const [matches, setMatches] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [matchesLoading, setMatchesLoading] = useState(false);

    // Chat state
    const [conversations, setConversations] = useState([]);
    const [chatHistory, setChatHistory] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);

    // Load profile on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadProfile();
        }
    }, [isAuthenticated]);

    const loadProfile = async () => {
        if (!isAuthenticated) return;

        setProfileLoading(true);
        try {
            const response = await fetch('/api/live-support/profile', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setProfileComplete(data.isComplete);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        if (!isAuthenticated) return;

        setProfileLoading(true);
        try {
            const response = await fetch('/api/live-support/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setProfileComplete(data.isComplete);

                // If profile is complete, load matches
                if (data.isComplete) {
                    loadMatches();
                }

                return { success: true };
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            return { success: false, error: error.message };
        } finally {
            setProfileLoading(false);
        }
    };

    const reprocessProfile = async () => {
        if (!isAuthenticated) return;

        try {
            const response = await fetch('/api/live-support/reprocess-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setProfileComplete(data.isComplete);

                // Reload matches with improved profile
                if (data.isComplete) {
                    loadMatches();
                }

                return { success: true, message: data.message };
            } else {
                throw new Error('Failed to reprocess profile');
            }
        } catch (error) {
            console.error('Error reprocessing profile:', error);
            return { success: false, error: error.message };
        }
    };

    const loadMatches = async () => {
        if (!isAuthenticated || !profileComplete) return;

        setMatchesLoading(true);
        try {
            const [matchesResponse, activeUsersResponse] = await Promise.all([
                fetch('/api/live-support/matches', {
                    headers: getAuthHeaders()
                }),
                fetch('/api/live-support/active-users', {
                    headers: getAuthHeaders()
                })
            ]);

            if (matchesResponse.ok) {
                const matchesData = await matchesResponse.json();
                setMatches(matchesData.matches);
            }

            if (activeUsersResponse.ok) {
                const activeData = await activeUsersResponse.json();
                setActiveUsers(activeData.activeUsers);
            }
        } catch (error) {
            console.error('Error loading matches:', error);
        } finally {
            setMatchesLoading(false);
        }
    };

    const loadConversations = async () => {
        if (!isAuthenticated) return;

        try {
            const response = await fetch('/api/live-support/conversations', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations);

                // Calculate unread count
                const totalUnread = data.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                setUnreadCount(totalUnread);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadChatHistory = async (otherUserId) => {
        if (!isAuthenticated || !otherUserId) return;

        try {
            const response = await fetch(`/api/live-support/history/${otherUserId}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setChatHistory(prev => ({
                    ...prev,
                    [otherUserId]: data.chatHistory
                }));
                return data.chatHistory;
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
        return [];
    };

    const startChat = (user) => {
        setActiveChatUser(user);
        setActiveView('chat');

        // Load chat history if not already loaded
        if (!chatHistory[user._id]) {
            loadChatHistory(user._id);
        }
    };

    const openModal = (view = 'profile') => {
        setActiveView(view);
        setIsModalOpen(true);

        // Load data based on view
        if (view === 'matches' && profileComplete) {
            loadMatches();
        } else if (view === 'chat') {
            loadConversations();
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveChatUser(null);
    };

    const updateOnlineStatus = async (isOnline, isAvailableForChat) => {
        if (!isAuthenticated) return;

        try {
            await fetch('/api/live-support/status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ isOnline, isAvailableForChat })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Set online when component mounts and offline when it unmounts
    useEffect(() => {
        if (isAuthenticated) {
            updateOnlineStatus(true, true);
            loadConversations();

            return () => {
                updateOnlineStatus(false, false);
            };
        }
    }, [isAuthenticated]);

    const value = {
        // Modal state
        isModalOpen,
        activeView,
        activeChatUser,
        openModal,
        closeModal,
        setActiveView,

        // Profile
        profile,
        profileComplete,
        profileLoading,
        loadProfile,
        updateProfile,
        reprocessProfile,

        // Matching
        matches,
        activeUsers,
        matchesLoading,
        loadMatches,

        // Chat
        conversations,
        chatHistory,
        unreadCount,
        loadConversations,
        loadChatHistory,
        startChat,

        // Utility
        updateOnlineStatus
    };

    return (
        <LiveSupportContext.Provider value={value}>
            {children}
        </LiveSupportContext.Provider>
    );
};
