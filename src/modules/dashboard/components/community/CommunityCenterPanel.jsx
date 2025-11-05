import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';
import { getCommunityMembers, joinRoom } from '../../../../shared/services/API';
import ChatRoom from '../chatRoom/Chatroom';
import VoiceRoom from '../voiceRoom/VoiceRoom';

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

  // Listen for channel selection events
  useEffect(() => {
    const handleChannelSelect = (event) => {
      const { channelId, roomCode: newRoomCode } = event.detail || {};
      if (newRoomCode) setCurrentRoomCode(newRoomCode);
      if (channelId && typeof channelId === 'string') {
        const parts = channelId.split(':');
        if (parts.length >= 3) {
          const kind = parts[1] === 'voice' ? 'voice' : 'chat';
          setCurrentMode(kind);
          setCurrentRoomTitle(`# ${parts[2]}`);
        } else if (channelId.startsWith('announcement:')) {
          setCurrentMode('chat');
          setCurrentRoomTitle('# general');
        }
      }
    };
    window.addEventListener('community:channel-selected', handleChannelSelect);
    return () => {
      window.removeEventListener('community:channel-selected', handleChannelSelect);
    };
  }, []);

  useEffect(() => {
    if (currentMode !== 'chat') {
    
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }
    
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const activeRoomCode = currentRoomCode || roomCode;
    if (!userEmail || !activeRoomCode) return;

    const wsUrl = `wss://codewithketan.me/chat?roomCode=${encodeURIComponent(activeRoomCode)}&email=${encodeURIComponent(userEmail)}`;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    try {
      joinRoom(activeRoomCode, userEmail)
        .catch(() => {})
        .finally(() => {
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            console.log('WebSocket connected to room:', activeRoomCode);
            setMessages([]); 
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              const isLegacy = typeof data?.message === 'string';
              const isTyped = data?.type === 'message';
              if (isLegacy || isTyped) {
                const text = isLegacy ? data.message : (data.text || '');
                const senderEmail = data.senderEmail || data.email || '';
                const receivedMsg = {
                  id: `m-${Date.now()}-${Math.random()}`,
                  author: data.author || data.username || senderEmail || 'Unknown',
                  email: senderEmail,
                  text,
                  createdAt: data.timestamp || new Date().toISOString(),
                  avatar: data.avatar || '/avatars/avatar-1.png',
                  isSelf: senderEmail === userEmail,
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
        });
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
    }
  }, [currentRoomCode, roomCode, currentMode, user?.email]);

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
        <VoiceRoom
          title={currentRoomTitle}
          participants={[]}
          localMuted={localMuted}
          onToggleMute={() => setLocalMuted((prev) => !prev)}
          onLeave={() => {
            // Handle leave voice room
            console.log('Leave voice room');
          }}
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
            setMessages((prev) => [...prev, msg]);
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

export default CommunityCenterPanel;
