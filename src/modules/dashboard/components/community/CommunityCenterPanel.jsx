import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';
import { getCommunityMembers, joinRoom } from '../../../../shared/services/API';
import ChatRoom from '../chatRoom/Chatroom';
import VoiceRoom from '../voiceRoom/VoiceRoom';
import { useVoiceRoom } from '../../../../shared/hooks/useVoiceRoom';

const CommunityCenterPanel = ({ community, roomCode }) => {
  const { user } = useAuth();
  const wsRef = useRef(null);

  const communityId = useMemo(() => community?.id || community?.communityId || community?.community_id, [community]);
  const storageKey = useMemo(() => (communityId ? `welcomeShown:community:${communityId}:channel:general` : ''), [communityId]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentRoomCode, setCurrentRoomCode] = useState(roomCode || null);
  const [currentMode, setCurrentMode] = useState('chat'); // 'chat' | 'voice'
  const [currentRoomTitle, setCurrentRoomTitle] = useState('#general');
  const [localMuted, setLocalMuted] = useState(false);

  const [activeChatRoomCode, setActiveChatRoomCode] = useState(null);
  const [voiceRoomData, setVoiceRoomData] = useState(null); // { janusRoomId, sessionId, handleId, userId }

  useEffect(() => {
    const handleChannelSelect = (event) => {
      const { channelId, roomCode: newRoomCode, chatRoomCode, janusRoomId } = event.detail || {};
      if (newRoomCode) setCurrentRoomCode(newRoomCode);
      if (chatRoomCode) setActiveChatRoomCode(chatRoomCode);
      else setActiveChatRoomCode(null);
      
      if (channelId && typeof channelId === 'string') {
        const parts = channelId.split(':');
        if (parts.length >= 3) {
          const kind = parts[1] === 'voice' ? 'voice' : 'chat';
          setCurrentMode(kind);
          setCurrentRoomTitle(`# ${parts[2]}`);
          
          // For voice rooms, get join response from sessionStorage
          if (kind === 'voice' && janusRoomId) {
            const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
            const joinResponseKey = `voiceRoomJoin_${janusRoomId}`;
            const joinResponseStr = sessionStorage.getItem(joinResponseKey);
            
            if (joinResponseStr) {
              try {
                const joinResponse = JSON.parse(joinResponseStr);
                const data = joinResponse?.data || joinResponse;
                setVoiceRoomData({
                  janusRoomId,
                  sessionId: data?.sessionId,
                  handleId: data?.handleId,
                  userId: userEmail
                });
              } catch (e) {
                console.error('Failed to parse join response:', e);
                setVoiceRoomData(null);
              }
            } else {
              // If join response not found, try to get from the join API response
              // The join happens in CommunityLeftPanel, so we need to wait for it
              // For now, set janusRoomId and let the hook handle it
              const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
              setVoiceRoomData({
                janusRoomId,
                sessionId: null,
                handleId: null,
                userId: userEmail
              });
            }
          } else {
            setVoiceRoomData(null);
          }
        } else if (channelId.startsWith('announcement:')) {
          setCurrentMode('chat');
          setCurrentRoomTitle('# general');
          setActiveChatRoomCode(null);
          setVoiceRoomData(null);
        }
      }
    };
    window.addEventListener('community:channel-selected', handleChannelSelect);
    return () => {
      window.removeEventListener('community:channel-selected', handleChannelSelect);
    };
  }, [user?.email]);
  
  // Listen for voice room join completion
  useEffect(() => {
    const handleVoiceRoomJoin = (event) => {
      const { janusRoomId, sessionId, handleId, userId } = event.detail || {};
      if (janusRoomId && sessionId && handleId && userId) {
        setVoiceRoomData({ janusRoomId, sessionId, handleId, userId });
      }
    };
    
    window.addEventListener('voice-room:joined', handleVoiceRoomJoin);
    return () => {
      window.removeEventListener('voice-room:joined', handleVoiceRoomJoin);
    };
  }, []);

  useEffect(() => {
    if (currentMode !== 'chat') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setMessages([]);
      return;
    }
    
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const activeRoomCode = currentRoomCode || roomCode;
    if (!userEmail || !activeRoomCode) return;

    const wsRoomCode = activeChatRoomCode || activeRoomCode;
    const wsUrl = `wss://codewithketan.me/chat?roomCode=${encodeURIComponent(wsRoomCode)}&email=${encodeURIComponent(userEmail)}`;
    
    // Clear messages when switching to a new room/channel
    setMessages([]);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    try {
      if (!activeChatRoomCode) {
        joinRoom(activeRoomCode, userEmail)
          .catch(() => {})
          .finally(() => {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            setupWebSocket(ws, wsRoomCode);
          });
      } else {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        setupWebSocket(ws, wsRoomCode);
      }
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [currentRoomCode, roomCode, currentMode, user?.email, activeChatRoomCode]);

  const setupWebSocket = (ws, roomCodeForLog) => {
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';

    ws.onopen = () => {
      console.log('WebSocket connected to room:', roomCodeForLog);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
                if (data?.type === 'history' || data?.history || (Array.isArray(data) && data.length > 0 && data[0]?.senderEmail)) {
          const historyArray = data?.type === 'history' 
            ? (data.messages || data.history || [])
            : (Array.isArray(data) ? data : []);
          
          if (Array.isArray(historyArray) && historyArray.length > 0) {
            const historyMessages = historyArray
              .map((msg, index) => {
                const senderEmail = msg?.senderEmail || msg?.email || msg?.sender || '';
                const timestamp = msg?.timestamp || msg?.createdAt || msg?.sentAt || msg?.time || new Date().toISOString();
                const content = msg?.content || msg?.message || msg?.text || '';
                const senderName = msg?.senderName || msg?.author || msg?.username || '';
                const fallbackAuthor = senderEmail ? senderEmail.split('@')[0] : 'Unknown';
                
                return {
                  id: msg?.id || msg?.messageId || msg?._id || `history-${index}-${timestamp}`,
                  author: senderName || fallbackAuthor,
                  email: senderEmail,
                  text: content,
                  createdAt: timestamp,
                  avatar: msg?.avatar || msg?.avatarUrl || msg?.profileImage || '/avatars/avatar-1.png',
                  isSelf: senderEmail && senderEmail.toLowerCase() === userEmail.toLowerCase(),
                  images: Array.isArray(msg?.images) ? msg.images : (msg?.image ? [msg.image] : []),
                };
              })
              .filter(msg => msg.text || (msg.images && msg.images.length > 0)) // Filter out empty messages
              .sort((a, b) => {
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();
                return timeA - timeB;
              });
            
            console.log('Received chat history:', historyMessages.length, 'messages');
            setMessages(historyMessages);
            return;
          }
        }
        
        // Handle regular incoming messages
        const isLegacy = typeof data?.message === 'string';
        const isTyped = data?.type === 'message' || data?.type === 'chat';
        if (isLegacy || isTyped) {
          const text = isLegacy ? data.message : (data.text || data.content || '');
          const senderEmail = data.senderEmail || data.email || '';
          
          const receivedMsg = {
            id: data.id || `m-${Date.now()}-${Math.random()}`,
            author: data.author || data.username || data.senderName || senderEmail || 'Unknown',
            email: senderEmail,
            text,
            createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
            avatar: data.avatar || data.avatarUrl || '/avatars/avatar-1.png',
            isSelf: senderEmail && senderEmail.toLowerCase() === userEmail.toLowerCase(),
            images: Array.isArray(data.images) ? data.images : [],
          };
          
          setMessages((prev) => {
            const updated = [...prev, receivedMsg];
            return updated.sort((a, b) => {
              const timeA = new Date(a.createdAt).getTime();
              const timeB = new Date(b.createdAt).getTime();
              return timeA - timeB;
            });
          });
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
  };

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
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Invite people to your community', type: 'info' } }));
    } catch (e) {
      console.error('Failed to open invite modal:', e);
    }
  };

  const startConversation = () => {
    closeWelcomeModal();
  };

  return (
    <div className="flex-1 min-w-0 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500 overflow-hidden">
      {currentMode === 'voice' ? (
        <VoiceRoomWithWebRTC
          title={currentRoomTitle}
          voiceRoomData={voiceRoomData}
        />
      ) : (
        <ChatRoom
          key={`${currentRoomCode || 'no-room'}-${currentRoomTitle}`}
          title={currentRoomTitle}
          currentUser={{ email: user?.email, username: user?.username, avatarUrl: JSON.parse(sessionStorage.getItem('userData') || '{}')?.avatarUrl }}
          messages={messages}
          onSend={async (msg) => {
            try {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const payload = { message: msg.text };
                if (Array.isArray(msg.images) && msg.images.length > 0) {
                  const out = [];
                  for (const url of msg.images) {
                    try {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      const reader = new FileReader();
                      const dataUrl = await new Promise((resolve, reject) => {
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                      });
                      out.push(dataUrl);
                    } catch {}
                  }
                  if (out.length > 0) payload.images = out;
                }
                wsRef.current.send(JSON.stringify(payload));
              }
            } catch {}

          }}
        />
      )}

      {showWelcomeModal && currentMode === 'chat' && currentRoomTitle === '# general' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-[#282828] text-white rounded-xl p-6 w-[min(90%,560px)] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Welcome</h3>
              <button onClick={closeWelcomeModal} className="text-white/80 hover:text-white" title="Close">✕</button>
        </div>
            <h2 className="text-2xl font-bold text-center">Welcome to</h2>
            <p className="mt-1 text-lg font-semibold text-center">{currentRoomTitle}</p>
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

// Voice Room Component with WebRTC
const VoiceRoomWithWebRTC = ({ title, voiceRoomData }) => {
  const enabled = voiceRoomData && voiceRoomData.janusRoomId && voiceRoomData.sessionId && voiceRoomData.handleId;
  
  const {
    isConnected,
    participants,
    isMuted,
    error,
    toggleMute,
    leave
  } = useVoiceRoom(
    voiceRoomData?.janusRoomId,
    voiceRoomData?.sessionId,
    voiceRoomData?.handleId,
    voiceRoomData?.userId,
    enabled
  );

  React.useEffect(() => {
    if (error) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: error, type: 'error' }
      }));
    }
  }, [error]);

  return (
    <VoiceRoom
      title={title}
      participants={participants}
      localMuted={isMuted}
      onToggleMute={toggleMute}
      onLeave={leave}
    />
  );
};

export default CommunityCenterPanel;
