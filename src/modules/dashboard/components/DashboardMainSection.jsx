import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCommunities, getAllLocalGroups, BASE_URL } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';

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
        <div className="flex items-stretch rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow transform transition-transform hover:scale-[1.02] w-full">
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
      );
    }
    if (error) return <div className="text-red-600">{error}</div>;
    if (!items.length) {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{emptyTitle}</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">{emptySub}</p>
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

    // Clear messages when switching friends
    setMessages([]);
    setLoadingMessages(false);

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
          
          // Check if this message is for the current conversation
          const isForCurrentChat = 
            (data.senderEmail === userEmail && data.receiverEmail === friendEmail) ||
            (data.senderEmail === friendEmail && data.receiverEmail === userEmail);

          if (isForCurrentChat) {
            const receivedMsg = {
              id: data.id || `msg-${Date.now()}-${Math.random()}`,
              author: data.senderEmail === userEmail 
                ? (user?.username || userEmail) 
                : friendName,
              email: data.senderEmail || '',
              text: data.content || '',
              createdAt: data.timestamp || new Date().toISOString(),
              avatar: data.senderEmail === userEmail
                ? (user?.avatarUrl || '/avatars/avatar-1.png')
                : friendAvatar,
              isSelf: data.senderEmail === userEmail,
              images: []
            };

            setMessages((prev) => [...prev, receivedMsg]);
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
      <div className="flex-1 min-w-0 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500 overflow-hidden">
        {/* Header */}
        <div className="h-12 border-b border-gray-500 flex items-center justify-between px-4">
          <div className="font-semibold text-gray-800 truncate">{friendName}</div>
          <div className="flex items-center gap-2">
            {wsConnected ? (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Connected
              </span>
            ) : (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Connecting...
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-3">
          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length > 0 ? (
            <>
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-xs">{formatDateChip(messages[0].createdAt)}</span>
              </div>
              {messages.map((m, idx) => {
                const prev = messages[idx - 1];
                const showDateChip = !!prev && formatDateChip(prev.createdAt) !== formatDateChip(m.createdAt);
                const isSelf = !!m.isSelf;
                return (
                  <React.Fragment key={m.id}>
                    {showDateChip && (
                      <div className="flex justify-center mt-2">
                        <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-xs">{formatDateChip(m.createdAt)}</span>
                      </div>
                    )}
                    <div className={`${isSelf ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-200 border-gray-400'} border-l-8 rounded-md p-3 pl-3 flex gap-3 min-w-0`}>
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 self-start">
                        <img src={m.avatar || '/avatars/avatar-1.png'} alt={m.author} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                          <span className="font-semibold text-gray-900 truncate">{m.author}</span>
                          <span className="text-gray-500 flex-shrink-0">{formatTime(m.createdAt)}</span>
                        </div>
                        {(() => {
                          const expanded = !!expandedMessageIds[m.id];
                          const clamp = shouldClampMessage(m.text) && !expanded;
                          return (
                            <>
                              <div
                                className={`whitespace-pre-wrap break-words break-all text-gray-900 ${clamp ? 'line-clamp-15' : ''}`}
                                style={clamp ? { display: '-webkit-box', WebkitLineClamp: 15, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}
                              >
                                {m.text}
                              </div>
                              {shouldClampMessage(m.text) && (
                                <button
                                  onClick={() => toggleExpand(m.id)}
                                  className="mt-2 text-sm text-indigo-700 hover:text-indigo-900 font-medium"
                                >
                                  {expanded ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </>
                          );
                        })()}
                        {Array.isArray(m.images) && m.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {m.images.map((img, i) => (
                              <div key={i} className="rounded-md overflow-hidden bg-black/5 border border-gray-300 w-[min(360px,100%)]">
                                <img src={img} alt="attachment" className="w-full h-auto object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Direct Messaging</h3>
              <p className="text-gray-500 max-w-md">Start a conversation with {friendName}</p>
            </div>
          )}
        </div>

        {/* Composer - Same style as ChatRoom */}
        <div className="px-4 py-3">
          <div className={`relative bg-[#282828] text-white rounded-xl px-4 ${attachments.length > 0 ? 'py-3' : 'h-12'} flex flex-col gap-2`}>
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((a, idx) => (
                  <div key={idx} className="relative rounded-md overflow-hidden bg-black/20 border border-gray-600">
                    <img src={a.url} alt="preview" className="w-full h-20 object-cover" />
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center mt-2 gap-3">
              <button onClick={() => setShowEmoji((v) => !v)} className="text-xl" title="Emoji">😊</button>
              <span>📊</span>
              <button onClick={onPickFiles} className="text-xl" title="Share files">🗃️</button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${friendName}`}
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                ref={messageInputRef}
              />
              <button onClick={handleSend} className="ml-auto bg-gray-100 text-gray-900 rounded-md px-3 py-1">➤</button>
              {showEmoji && (
                <div className="absolute bottom-14 left-2 bg-white text-gray-900 rounded-lg shadow p-2 grid grid-cols-6 gap-2">
                  {emojis.map((em) => (
                    <button key={em} onClick={() => onEmojiClick(em)} className="text-xl hover:scale-110 transition-transform" title={em}>
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-200 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-hidden rounded-xl border border-gray-500">
      <div className="bg-gray-200 border-b border-gray-500 px-4 sm:px-6 py-4 flex-shrink-0 rounded-t-xl">
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
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
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


