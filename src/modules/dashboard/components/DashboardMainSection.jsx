import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCommunities, getAllLocalGroups, getChatHistory, BASE_URL } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import ChatRoom from './chatRoom/Chatroom';

const formatFriendName = (friend) => {
  if (friend.firstName && friend.lastName) {
    return `${friend.firstName} ${friend.lastName}`;
  }
  if (friend.first && friend.last) {
    return `${friend.first} ${friend.last}`;
  }
  if (friend.name) {
    return friend.name;
  }
  if (friend.username) {
    return friend.username;
  }
  return 'Unknown';
};
import {
  selectCommunities,
  selectLocalGroups,
  selectActiveTab,
  selectDashboardLoading,
  selectDashboardError,
  setCommunities,
  setLocalGroups,
  setActiveTab,
  setLoading,
  setError,
} from '../../../shared/store/slices/dashboardSlice';
import { setSelectedFriend } from '../../../shared/store/slices/uiSlice';

const DashboardMainSection = ({ selectedFriend, onOpenAddFriends, showRightSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const activeTab = useSelector(selectActiveTab);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const communities = useSelector(selectCommunities);
  const localGroups = useSelector(selectLocalGroups);
  
  // Direct chat state - moved outside conditional
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [expandedMessageIds, setExpandedMessageIds] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const wsRef = useRef(null);
  
  const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
  const userEmail = user?.email || storedEmail;
  
  const emojis = useMemo(() => ['😊', '😂', '🎉', '🔥', '👍', '❤️'], []);
  
  const friendEmail = selectedFriend?.email;


  const safeUrl = (rawUrl) => {
    if (!rawUrl) return '';

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      console.log('rawUrl', rawUrl);
      return rawUrl;
    }
    const absolute = `${BASE_URL}${rawUrl}`;
    try { return encodeURI(absolute); } catch { return absolute; }
  };

  const fetchCommunities = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(''));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;
    
    if (!userEmail) {
      dispatch(setError('User email not found'));
      dispatch(setLoading(false));
      return;
    }
    
    try {
      const res = await getMyCommunities(userEmail);
      const list = res?.data?.communities || res?.communities || res?.data || [];
      dispatch(setCommunities(list));
    } catch (e) {
      dispatch(setError(e.message || 'Failed to load'));
    }
  }, [user, dispatch]);

  const fetchLocalGroups = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(''));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;
    
    if (!userEmail) {
      dispatch(setError('User email not found'));
      dispatch(setLoading(false));
      return;
    }
    
    try {
      const res = await getAllLocalGroups(userEmail);
      const list = res?.data?.groups || res?.groups || res?.data || res?.rooms || [];
      dispatch(setLocalGroups(list));
    } catch (e) {
      dispatch(setError(e.message || 'Failed to load'));
    }
  }, [user, dispatch]);

  const hasLoadedRef = useRef({ community: false, localGroups: false });

  useEffect(() => {
    if (activeTab === 'Community') {
     
      fetchCommunities();
      hasLoadedRef.current.community = true;
    } else {
     
      fetchLocalGroups();
      hasLoadedRef.current.localGroups = true;
    }
  }, [activeTab, fetchCommunities, fetchLocalGroups]);

  useEffect(() => {
    const onRefreshCommunities = () => fetchCommunities();
    const onRefreshLocalGroups = () => fetchLocalGroups();
    window.addEventListener('refresh:communities', onRefreshCommunities);
    window.addEventListener('refresh:local-groups', onRefreshLocalGroups);
    return () => {
      window.removeEventListener('refresh:communities', onRefreshCommunities);
      window.removeEventListener('refresh:local-groups', onRefreshLocalGroups);
    };
  
  }, [fetchCommunities, fetchLocalGroups]);


  const ListCard = ({ item, onSelect }) => {
    const rawUrl = item.imageUrl || item.bannerUrl || item.imageURL || '';
    const title = item.name || 'Untitled';
    const description = item.description || '';
    const imgSrc = safeUrl(rawUrl);
    const members = item.totalMembers || item.members || 0;
    const online = item.onlineMembers || item.online || 0;
    const [imageError, setImageError] = useState(false);
    
    useEffect(() => {
      setImageError(false);
    }, [imgSrc]);

    return (
      <button onClick={() => onSelect(item)} className="text-left w-full">
        {/* Mobile Design - White card with light gray border */}
        <div className="md:hidden flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
          {/* Left - Square Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {imgSrc && !imageError ? (
              <img 
                src={imgSrc} 
                alt={title} 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-xl font-bold text-gray-400">
                  {title.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          {/* Middle - Title and Description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{description || 'No description'}</p>
          </div>
          
          {/* Right - Members and Online Status */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-gray-600 mb-1">members: {members || 0}</div>
            <div className="text-xs text-green-600 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              {online || 0} Online
            </div>
          </div>
        </div>

        {/* Desktop Design - Original */}
        <div className="hidden md:flex items-stretch rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow transform transition-transform hover:scale-[1.02] w-full">
          {/* Left Section - Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-l-xl overflow-hidden bg-zinc-400 flex-shrink-0">
            {imgSrc && !imageError ? (
              <img 
                src={imgSrc} 
                alt={title} 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
                <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                  {title.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Section - Content */}
          <div className="flex-1 min-w-0 bg-[#282828] text-white rounded-r-xl p-3 sm:p-4 relative">
            {/* Member Status - Top Right */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-right text-xs sm:text-sm">
              <div className="text-gray-300">members: {members || 0}</div>
              <div className="text-green-400">• {online || 0} Online</div>
            </div>
            
            {/* Title and Description */}
            <div className="pr-16 sm:pr-20 md:pr-24 lg:pr-32">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-1">{description}</p>
          </div>
          </div>
        </div>
      </button>
    );
  };

  const handleSelectCommunity = (item) => {
    const itemId = item.id || item.communityId || item.community_id || item.groupId || item.roomId;
    if (!itemId) {
      console.error('No ID found for item:', item);
      return;
    }
    // Ensure ID is converted to string for URL
    const idString = String(itemId);
    if (activeTab === 'Community') {
      navigate(`/dashboard/community/${idString}`);
    } else {
      navigate(`/dashboard/local-group/${idString}`);
    }
  };

  const renderList = (items, emptyTitle, emptySub) => {
    if (loading) {
      return (
        <div className="w-full flex flex-col gap-3 overflow-y-auto">
          {/* Mobile Skeleton */}
          <div className="md:hidden space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
                <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded mb-1 animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          {/* Desktop Skeleton */}
          <div className="hidden md:block">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="w-full">
              <div className="flex items-stretch rounded-xl overflow-hidden w-full">
                {/* Left shimmer */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-zinc-300 animate-pulse rounded-l-xl" />
                {/* Right shimmer */}
                <div className="flex-1 min-w-0 bg-[#282828] rounded-r-xl p-3 sm:p-4 relative">
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-right">
                    <div className="h-3 w-20 bg-gray-500/40 rounded mb-1 animate-pulse" />
                    <div className="h-3 w-16 bg-green-500/40 rounded animate-pulse" />
                  </div>
                  <div className="pr-16 sm:pr-20 md:pr-24 lg:pr-32">
                    <div className="h-5 sm:h-6 w-40 bg-gray-500/60 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-5/6 bg-gray-500/40 rounded mb-1 animate-pulse" />
                    <div className="h-3 w-3/5 bg-gray-500/30 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      );
    }
    if (error) return <div className="text-red-600">{error}</div>;
    if (!items.length) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-4">{emptyTitle}</h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-md mx-auto px-4">{emptySub}</p>
        </div>
      );
    }
    return (
      <div className="w-full flex flex-col gap-3 overflow-y-auto">
        {items.map((it) => (
          <ListCard 
            key={it.id || it.groupId || it.roomId || it.communityId || it.name} 
            item={it}
            onSelect={handleSelectCommunity}
          />
        ))}
      </div>
    );
  };


  // WebSocket connection for direct messaging
  useEffect(() => {
    if (!friendEmail || !userEmail) {
      setMessages([]);
      setLoadingMessages(false);
      // Close WebSocket if no friend selected
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsConnected(false);
      }
      return;
    }

    let cancelled = false;
    const friendName = formatFriendName(selectedFriend || {});
    const friendAvatar = selectedFriend?.avatar || selectedFriend?.avatarUrl || selectedFriend?.profileImage || '/avatars/avatar-1.png';
    const selfAvatar = user?.avatarUrl || '/avatars/avatar-1.png';

    const loadHistory = async () => {
      setLoadingMessages(true);
      try {
        const response = await getChatHistory(userEmail, friendEmail);
        const rawMessages = response?.data || response?.messages || response?.history || response?.chat || response || [];

        if (cancelled) return;

        const normalized = Array.isArray(rawMessages)
          ? rawMessages.map((msg, idx) => {
              const senderEmail = msg.senderEmail || msg.sender || msg.from || msg.userEmail || msg.email || '';
              const text = msg.content || msg.message || msg.text || '';
              const timestamp = msg.timestamp || msg.createdAt || msg.sentAt || msg.time || new Date().toISOString();
              const isSelf = senderEmail && senderEmail.toLowerCase() === userEmail.toLowerCase();
              const rawImages = Array.isArray(msg.images)
                ? msg.images
                : msg.image
                  ? [msg.image]
                  : [];

              const resolvedImages = rawImages.map((img) => safeUrl(img));

              return {
                id: msg.id || msg.messageId || msg._id || `history-${idx}`,
                author: isSelf ? (user?.username || userEmail) : friendName,
                email: senderEmail,
                text,
                createdAt: timestamp,
                avatar: isSelf ? selfAvatar : friendAvatar,
                isSelf,
                images: resolvedImages,
              };
            })
          : [];

        setMessages(normalized);
      } catch (historyError) {
        console.error('Failed to load chat history:', historyError);
        if (!cancelled) {
          setMessages([]);
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Unable to load chat history.', type: 'error' }
          }));
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [friendEmail, userEmail, selectedFriend, user]);

  useEffect(() => {
    if (!friendEmail || !userEmail) {
      // Close WebSocket if no friend selected
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
        setWsConnected(false);
      }
      return;
    }

    const friendName = formatFriendName(selectedFriend);
    const friendAvatar = selectedFriend?.avatar || selectedFriend?.avatarUrl || selectedFriend?.profileImage || '/avatars/avatar-1.png';

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Establish WebSocket connection with sender/receiver emails in query params
    const wsUrl = `wss://codewithketan.me/ws/direct-chat?senderEmail=${encodeURIComponent(userEmail)}&receiverEmail=${encodeURIComponent(friendEmail)}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for direct chat');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const mapMessage = (msg) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            author: msg.senderEmail === userEmail 
              ? (user?.username || userEmail) 
              : friendName,
            email: msg.senderEmail || '',
            text: msg.content || msg.message || '',
            createdAt: msg.timestamp || new Date().toISOString(),
            avatar: msg.senderEmail === userEmail
              ? (user?.avatarUrl || '/avatars/avatar-1.png')
              : friendAvatar,
            isSelf: msg.senderEmail === userEmail,
            images: []
          });

          if (data?.type === 'history' && Array.isArray(data.messages)) {
            const sorted = [...data.messages].sort(
              (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
            );
            const historyMessages = sorted
              .filter((msg) => (
                (msg.senderEmail === userEmail && msg.receiverEmail === friendEmail) ||
                (msg.senderEmail === friendEmail && msg.receiverEmail === userEmail)
              ))
              .map(mapMessage);
            setMessages(historyMessages);
            return;
          }
          
          const isForCurrentChat = 
            (data.senderEmail === userEmail && data.receiverEmail === friendEmail) ||
            (data.senderEmail === friendEmail && data.receiverEmail === userEmail);

          if (isForCurrentChat) {
            const receivedMsg = mapMessage(data);
            setMessages((prev) => {
              const next = [...prev, receivedMsg];
              return next.sort(
                (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
              );
            });
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
        // Show error toast
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Connection error. Please try again.', type: 'error' }
        }));
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setWsConnected(false);
        
        if (event.code !== 1000 && event.code !== 1001) {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Connection closed. Reconnecting...', type: 'warning' }
          }));
        }
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
          setWsConnected(false);
        }
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setWsConnected(false);
    }
  }, [friendEmail, userEmail, selectedFriend, user]);
    
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const formatTime = (date) => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };
    
  const formatDateChip = (date) => {
    const d = new Date(date);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return 'Today';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  
  const shouldClampMessage = (text) => {
    if (!text) return false;
    const approxLineBreaks = (text.match(/\n/g) || []).length + 1;
    if (approxLineBreaks > 15) return true;
    return text.length > 900;
  };
  
  const toggleExpand = (id) => {
    setExpandedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  
  const onPickFiles = () => fileInputRef.current?.click();
  
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const withUrls = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setAttachments((prev) => [...prev, ...withUrls]);
    e.target.value = '';
  };
  
  const onEmojiClick = (e) => {
    setMessage((prev) => prev + e);
    setShowEmoji(false);
  };
  
  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;
    if (!friendEmail || !userEmail) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const payload = { content: trimmed };
        wsRef.current.send(JSON.stringify(payload));
        setMessage('');
        try { attachments.forEach((a) => URL.revokeObjectURL(a.url)); } catch {}
        setAttachments([]);
      } catch (e) {
        console.error('Failed to send message via WebSocket:', e);

        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Failed to send message. Please try again.', type: 'error' }
        }));
      }
    } else {
      // WebSocket not connected, show error
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Not connected. Please wait...', type: 'error' }
      }));
    }
  };

  if (selectedFriend) {
    const friendName = formatFriendName(selectedFriend);
    const friendAvatar = selectedFriend.avatar || selectedFriend.avatarUrl || selectedFriend.profileImage || '/avatars/avatar-1.png';

    return (
      <ChatRoom
        title={friendName}
        currentUser={{ email: user?.email, username: user?.username, avatarUrl: user?.avatarUrl }}
        messages={messages}
        chatUser={{
          name: friendName,
          avatar: friendAvatar,
          status: wsConnected ? 'Active now' : 'Offline'
        }}
        isGroupChat={false}
        onBack={() => {
          dispatch(setSelectedFriend(null));
        }}
        sendMessage={(text, attachments) => {
          // Use the existing handleSend logic from DashboardMainSection
                    handleSend();
        }}
      />
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-[#E6E6E6] md:bg-gray-100">
      {/* Mobile Header - Dashboard Title with Icon */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(setActiveTab('Community'))}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'Community'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 bg-transparent'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => dispatch(setActiveTab('Local-Groups'))}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'Local-Groups'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 bg-transparent'
            }`}
          >
            Group
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-gray-200 border-b border-gray-500 px-4 sm:px-6 py-4 flex-shrink-0 rounded-t-xl">
        <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => dispatch(setActiveTab('Community'))}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'Community'
                ? 'bg-[#282828] text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => dispatch(setActiveTab('Local-Groups'))}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'Local-Groups'
                ? 'bg-[#282828] text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Local-Groups
          </button>
          </div>
          {/* Add Friend Button - Desktop Only */}
          {onOpenAddFriends && (
            <button
              onClick={onOpenAddFriends}
              title='Add Friend'
              className="hidden md:flex w-7 h-7 items-center justify-center text-black hover:bg-gray-300 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 py-4 md:p-4 md:sm:p-6 overflow-y-auto">
        {activeTab === 'Community'
          ? renderList(
              communities,
              'No community joined',
              "You haven't joined any communities yet. Explore and connect with others who share your interests — your next great conversation might be waiting!"
            )
          : renderList(
              localGroups,
              'No Local-Groups yet',
              "You haven't joined any Local-Groups yet. Explore and connect with others who share your interests"
            )}
      </div>
    </div>
  );
};

export default DashboardMainSection;


