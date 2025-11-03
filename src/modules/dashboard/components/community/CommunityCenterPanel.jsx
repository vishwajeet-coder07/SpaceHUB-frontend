import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';
import { getCommunityMembers } from '../../../../shared/services/API';

const CommunityCenterPanel = ({ community, roomCode, selectedChannel }) => {
  const channelName = '#general';
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const wsRef = useRef(null);
  const { user } = useAuth();

  const communityId = useMemo(() => community?.id || community?.communityId || community?.community_id, [community]);
  const storageKey = useMemo(() => (communityId ? `welcomeShown:community:${communityId}:channel:general` : ''), [communityId]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]); // [{file, url}]
  const [currentRoomCode, setCurrentRoomCode] = useState(roomCode || null);

    const emojis = ['😊', '😂', '🎉', '🔥', '👍', '❤️'];

  const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const withUrls = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setAttachments((prev) => [...prev, ...withUrls]);
    try {
      window.dispatchEvent(new CustomEvent('community:share-files', { detail: { files, community } }));
    } catch (error) {
      console.error('Error dispatching share-files event:', error);
    }
    e.target.value = '';
  };

  const onEmojiClick = (e) => {
    setMessage((prev) => prev + e);
    setShowEmoji(false);
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

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;
    
    const selfAvatar = JSON.parse(sessionStorage.getItem('userData') || '{}')?.avatarUrl || '/avatars/avatar-1.png';
    const selfName = JSON.parse(sessionStorage.getItem('userData') || '{}')?.username || user?.email || 'You';
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    
    const newMsg = {
      id: `m-${Date.now()}`,
      author: selfName,
      email: userEmail,
      text: trimmed,
      createdAt: new Date().toISOString(),
      avatar: selfAvatar,
      isSelf: true,
      images: attachments.map((a) => a.url),
    };
    
    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          text: trimmed,
          images: attachments.map((a) => a.url),
          timestamp: newMsg.createdAt,
        }));
      } catch (e) {
        console.error('Failed to send via WebSocket:', e);
      }
    }
    
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    // clear attachments and revoke URLs
    try {
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
    } catch {}
    setAttachments([]);
    try {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    } catch {}
  };

  useEffect(() => {
    // Auto-scroll when messages change (e.g., initial load or receiving new messages)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for channel selection events
  useEffect(() => {
    const handleChannelSelect = (event) => {
      const { roomCode: newRoomCode } = event.detail || {};
      if (newRoomCode) {
        setCurrentRoomCode(newRoomCode);
      }
    };
    window.addEventListener('community:channel-selected', handleChannelSelect);
    return () => {
      window.removeEventListener('community:channel-selected', handleChannelSelect);
    };
  }, []);

  // WebSocket connection
  useEffect(() => {
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const activeRoomCode = currentRoomCode || roomCode;
    if (!userEmail || !activeRoomCode) return;

    const wsUrl = `wss://codewithketan.me/chat?roomCode=${encodeURIComponent(activeRoomCode)}&email=${encodeURIComponent(userEmail)}`;
    
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to room:', activeRoomCode);
        setMessages([]); // Clear messages when switching rooms
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            const receivedMsg = {
              id: `m-${Date.now()}-${Math.random()}`,
              author: data.author || data.username || 'Unknown',
              email: data.email || '',
              text: data.text || '',
              createdAt: data.timestamp || new Date().toISOString(),
              avatar: data.avatar || '/avatars/avatar-1.png',
              isSelf: data.email === userEmail,
              images: Array.isArray(data.images) ? data.images : [],
            };
            setMessages((prev) => [...prev, receivedMsg]);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
    }
  }, [currentRoomCode, roomCode, user?.email]);

  useEffect(() => {
    const checkAdminAndMaybeShow = async () => {
      if (!communityId || !user?.email) return;

      try {
        const seen = localStorage.getItem(storageKey);
        if (seen === '1') return;

        const data = await getCommunityMembers(communityId);

        const members = data?.data?.members || data?.members || [];
        const me = members.find((m) => (m.email || m.username) === user.email);
        const myRole = me?.role || '';

        if ((myRole || '').toUpperCase() === 'ADMIN') {
          setShowWelcomeModal(true);
        }
      } catch (e) {
        console.error('Failed to decide welcome modal visibility:', e);
      }
    };

    checkAdminAndMaybeShow();
  }, [communityId, user?.email, storageKey]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    try {
      if (storageKey) localStorage.setItem(storageKey, '1');
    } catch {}
  };

  const openInviteModal = () => {
    closeWelcomeModal();
    try {
      window.dispatchEvent(new Event('community:open-invite'));
    } catch (e) {
      console.error('Failed to open invite modal:', e);
    }
  };

  const startConversation = () => {
    closeWelcomeModal();
    setMessage('hey');
    try {
      requestAnimationFrame(() => messageInputRef.current?.focus());
    } catch {}
  };

  return (
    <div className="flex-1 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500">
      {/* Header */}
      <div className="h-12 border-b border-gray-500 flex items-center justify-between px-4">
        <div className="font-semibold text-gray-800 truncate">{channelName}</div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">👥</span>
        </div>
      </div>

      {/* Scrollable area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {/* Date chips and messages */}
        {messages.length > 0 && (
          <>
            {/* First date chip */}
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
                  <div className={`${isSelf ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-200 border-gray-400'} border-l-8 rounded-md p-3 pl-3 flex gap-3`}>
                    {/* Avatar inside bubble */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 self-start">
                      <img src={m.avatar || '/avatars/avatar-1.png'} alt={m.author} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <span className="font-semibold text-gray-900">{m.author}</span>
                        <span className="text-gray-500">{formatTime(m.createdAt)}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-gray-900">{m.text}</div>
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
        )}
      </div>

      {/* Composer */}
      <div className="px-4 py-3">
        <div className={`relative bg-[#282828] text-white rounded-xl px-4 ${attachments.length > 0 ? 'py-3' : 'h-12'} flex flex-col gap-2`}>
          {/* Attachments preview inside input div */}
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
          {/* Emoji button */}
          <button onClick={() => setShowEmoji((v) => !v)} className="text-xl" title="Emoji">😊</button>
<span>📊</span>
          {/* File share */}
          <button onClick={onPickFiles} className="text-xl" title="Share files">🗃️</button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />

          {/* Input */}
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
            placeholder="#General"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            ref={messageInputRef}
          />

          <button onClick={handleSend} className="ml-auto bg-gray-100 text-gray-900 rounded-md px-3 py-1">➤</button>

          {/* Emoji popup */}
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

      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-[#282828] text-white rounded-xl p-6 w-[min(90%,560px)] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Welcome</h3>
              <button onClick={closeWelcomeModal} className="text-white/80 hover:text-white" title="Close">✕</button>
            </div>
            <h2 className="text-2xl font-bold text-center">Welcome to</h2>
            <p className="mt-1 text-lg font-semibold text-center">{channelName}</p>
            <div className="mt-6 space-y-3 text-gray-900">
              <button onClick={openInviteModal} className="w-full bg-white rounded-md px-4 py-3 flex items-center justify-between">
                <span>Invite your friends</span>
                <span>›</span>
              </button>
              <button onClick={startConversation} className="w-full bg-white rounded-md px-4 py-3 flex items-center justify-between">
                <span>Send hey to start the convo!</span>
                <span>›</span>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeWelcomeModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityCenterPanel;
