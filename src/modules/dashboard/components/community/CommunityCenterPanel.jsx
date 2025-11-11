import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';
import { getCommunityMembers, joinRoom } from '../../../../shared/services/API';
import ChatRoom from '../chatRoom/Chatroom';
import VoiceRoom from '../voiceRoom/VoiceRoom';
import { useVoiceRoom } from '../../../../shared/hooks/useVoiceRoom';

const CommunityCenterPanel = ({ community, roomCode, onToggleRightPanel = null, onBack = null, isLocalGroup = false }) => {
  const { user } = useAuth();
  const wsRef = useRef(null);

  const communityId = useMemo(() => community?.id || community?.communityId || community?.community_id, [community]);
  const storageKey = useMemo(() => (communityId ? `welcomeShown:community:${communityId}:channel:general` : ''), [communityId]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Helper function to get avatar from session storage
  const getAvatarFromStorage = (email) => {
    if (!email || !communityId) return null;
    try {
      const storageKey = `community_avatars_${communityId}`;
      const avatars = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      return avatars[email.toLowerCase()] || null;
    } catch {
      return null;
    }
  };

  // Helper function to get username from session storage
  const getUsernameFromStorage = (email) => {
    if (!email || !communityId) return null;
    try {
      const storageKey = `community_usernames_${communityId}`;
      const usernames = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      return usernames[email.toLowerCase()] || null;
    } catch {
      return null;
    }
  };
  // Get stored channel selection from sessionStorage to persist across remounts
  const getStoredChannel = () => {
    if (!communityId) return null;
    try {
      const stored = sessionStorage.getItem(`community_selected_channel_${communityId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored channel:', e);
    }
    return null;
  };

  const storedChannel = getStoredChannel();
  const [currentRoomCode, setCurrentRoomCode] = useState(roomCode || storedChannel?.roomCode || null);
  const [currentMode, setCurrentMode] = useState(storedChannel?.mode || 'chat'); // 'chat' | 'voice'
  const [currentRoomTitle, setCurrentRoomTitle] = useState(storedChannel?.title || '#general');
  const [localMuted, setLocalMuted] = useState(false);

  const [activeChatRoomCode, setActiveChatRoomCode] = useState(storedChannel?.chatRoomCode || null);
  const [voiceRoomData, setVoiceRoomData] = useState(storedChannel?.voiceRoomData || null); // { janusRoomId, sessionId, handleId, userId }

  // Store channel selection in sessionStorage
  const storeChannelSelection = (channelData) => {
    if (!communityId) return;
    try {
      sessionStorage.setItem(`community_selected_channel_${communityId}`, JSON.stringify(channelData));
    } catch (e) {
      console.error('Failed to store channel selection:', e);
    }
  };

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
          const roomTitle = `# ${parts[2]}`;
          setCurrentMode(kind);
          setCurrentRoomTitle(roomTitle);
          
          let voiceData = null;
          if (kind === 'voice' && janusRoomId) {
            const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
            const joinResponseKey = `voiceRoomJoin_${janusRoomId}`;
            const joinResponseStr = sessionStorage.getItem(joinResponseKey);
            
            if (joinResponseStr) {
              try {
                const joinResponse = JSON.parse(joinResponseStr);
                const data = joinResponse?.data || joinResponse;
                voiceData = {
                  janusRoomId,
                  sessionId: data?.sessionId,
                  handleId: data?.handleId,
                  userId: userEmail
                };
              } catch (e) {
                console.error('Failed to parse join response:', e);
                voiceData = null;
              }
            } else {
              const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
              voiceData = {
                janusRoomId,
                sessionId: null,
                handleId: null,
                userId: userEmail
              };
            }
          }
          setVoiceRoomData(voiceData);

          // Store the channel selection
          storeChannelSelection({
            channelId,
            roomCode: newRoomCode || currentRoomCode || roomCode,
            chatRoomCode,
            mode: kind,
            title: roomTitle,
            voiceRoomData: voiceData
          });
        } else if (channelId.startsWith('announcement:')) {
          setCurrentMode('chat');
          setCurrentRoomTitle('# general');
          setActiveChatRoomCode(null);
          setVoiceRoomData(null);
          
          // Store the announcement selection
          storeChannelSelection({
            channelId,
            roomCode: newRoomCode || currentRoomCode || roomCode,
            chatRoomCode: null,
            mode: 'chat',
            title: '# general',
            voiceRoomData: null
          });
        }
      }
    };
    window.addEventListener('community:channel-selected', handleChannelSelect);
    return () => {
      window.removeEventListener('community:channel-selected', handleChannelSelect);
    };
  }, [user?.email, communityId, currentRoomCode, roomCode]);
  
  // Listen for voice room join completion
  useEffect(() => {
    const handleVoiceRoomJoin = (event) => {
      const { janusRoomId, sessionId, handleId, userId } = event.detail || {};
      if (janusRoomId && sessionId && handleId && userId) {
        const voiceData = { janusRoomId, sessionId, handleId, userId };
        setVoiceRoomData(voiceData);
        
        // Update stored channel selection with updated voice room data
        const stored = getStoredChannel();
        if (stored) {
          storeChannelSelection({
            ...stored,
            voiceRoomData: voiceData
          });
        }
      }
    };
    
    window.addEventListener('voice-room:joined', handleVoiceRoomJoin);
    return () => {
      window.removeEventListener('voice-room:joined', handleVoiceRoomJoin);
    };
  }, [communityId]);

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
                const senderName = msg?.senderName || msg?.author || msg?.username || '';
                
           
                const storedUsername = getUsernameFromStorage(senderEmail);
                const displayName = senderName || storedUsername || (senderEmail ? senderEmail.split('@')[0] : 'Unknown');
                
               
                const storedAvatar = getAvatarFromStorage(senderEmail);
                const avatar = storedAvatar || msg?.avatar || msg?.avatarUrl || msg?.avatarPreviewUrl || msg?.profileImage || '/avatars/avatar-1.png';
                
          
                if (msg?.type === 'FILE' || msg?.fileUrl || msg?.file_url) {
                  const fileUrl = msg?.fileUrl || msg?.file_url || '';
                  const fileName = msg?.fileName || msg?.file_name || msg?.text || 'file';
                  const contentType = msg?.contentType || msg?.content_type || '';
                  
          
                  const isImageFile = (contentType, fileName) => {
                    if (contentType) {
                      return contentType.startsWith('image/');
                    }
                    if (fileName) {
                      const ext = fileName.toLowerCase().split('.').pop();
                      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
                    }
                    return false;
                  };
                  
                  const isImage = isImageFile(contentType, fileName);
                  
                  return {
                    id: msg?.id || msg?.messageId || msg?._id || `history-file-${index}-${timestamp}`,
                    author: displayName,
                    email: senderEmail,
                    text: fileName,
                    createdAt: timestamp,
                    avatar: avatar,
                    isSelf: senderEmail && senderEmail.toLowerCase() === userEmail.toLowerCase(),
                    images: isImage ? [fileUrl] : [],
                    fileUrl: fileUrl,
                    fileName: fileName,
                    contentType: contentType,
                    isFile: true,
                    isImage: isImage
                  };
                }
                
                // Regular text message
                const content = msg?.content || msg?.message || msg?.text || '';
                
                return {
                  id: msg?.id || msg?.messageId || msg?._id || `history-${index}-${timestamp}`,
                  author: displayName,
                  email: senderEmail,
                  text: content,
                  createdAt: timestamp,
                  avatar: avatar,
                  isSelf: senderEmail && senderEmail.toLowerCase() === userEmail.toLowerCase(),
                  images: Array.isArray(msg?.images) ? msg.images : (msg?.image ? [msg.image] : []),
                };
              })
              .filter(msg => msg.text || (msg.images && msg.images.length > 0) || msg.isFile)
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
                const isLegacy = typeof data?.message === 'string';
        const isTyped = data?.type === 'message' || data?.type === 'chat';
        if (isLegacy || isTyped) {
          const text = isLegacy ? data.message : (data.text || data.content || '');
          const senderEmail = data.senderEmail || data.email || '';
          
          const storedUsername = getUsernameFromStorage(senderEmail);
          const displayName = data.author || data.username || data.senderName || storedUsername || (senderEmail ? senderEmail.split('@')[0] : 'Unknown');
          
          const storedAvatar = getAvatarFromStorage(senderEmail);
          const avatar = storedAvatar || data.avatar || data.avatarUrl || data.avatarPreviewUrl || '/avatars/avatar-1.png';
          
          const receivedMsg = {
            id: data.id || `m-${Date.now()}-${Math.random()}`,
            author: displayName,
            email: senderEmail,
            text,
            createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
            avatar: avatar,
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

    ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      
     
      const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
      const activeRoomCode = currentRoomCode || roomCode;
      const wsRoomCode = activeChatRoomCode || activeRoomCode;
      
      if (event.code !== 1000 && userEmail && wsRoomCode && currentMode === 'chat') {
        console.log('Attempting to reconnect WebSocket for community chat...');
        setTimeout(() => {
          if (userEmail && wsRoomCode && currentMode === 'chat' && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
            try {
              const wsUrl = `wss://codewithketan.me/chat?roomCode=${encodeURIComponent(wsRoomCode)}&email=${encodeURIComponent(userEmail)}`;
              const newWs = new WebSocket(wsUrl);
              wsRef.current = newWs;
              setupWebSocket(newWs, wsRoomCode);
            } catch (e) {
              console.error('Failed to reconnect WebSocket:', e);
            }
          }
        }, 10000);
      }
    };
  };

  useEffect(() => {
    const checkAdminAndMaybeShow = async () => {
      if (!communityId || !user?.email) return;
      if (isLocalGroup) return;

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
  }, [communityId, user?.email, storageKey, isLocalGroup]);

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
    <div className="flex-1 min-w-0 bg-white h-full flex flex-col rounded-xl border border-gray-500 overflow-hidden md:bg-white">
      {currentMode === 'voice' ? (
        <VoiceRoomWithWebRTC
          title={currentRoomTitle}
          voiceRoomData={voiceRoomData}
          communityId={communityId}
          onBack={onBack}
        />
      ) : (
        <ChatRoom
          key={`${currentRoomCode || 'no-room'}-${currentRoomTitle}`}
          title={currentRoomTitle}
          currentUser={{ email: user?.email, username: user?.username, avatarUrl: JSON.parse(sessionStorage.getItem('userData') || '{}')?.avatarUrl }}
          messages={messages}
          isGroupChat={true}
          onToggleRightPanel={onToggleRightPanel}
          onBack={onBack}
          onSend={async (msg) => {
            try {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
                  const fileMessages = msg.attachments
                    .filter(att => att.s3Url && !att.uploading)
                    .map(att => ({
                      type: 'FILE',
                      fileName: att.fileName || att.file?.name || 'file',
                      fileUrl: att.s3Url,
                      contentType: att.contentType || att.file?.type || 'application/octet-stream'
                    }));
                  
                  // Send file messages first
                  for (const fileMsg of fileMessages) {
                    wsRef.current.send(JSON.stringify(fileMsg));
                  }
                }
                
                if (msg.text && msg.text.trim()) {
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
                      } catch (err) {
                        console.error('Failed to process image:', err);
                      }
                    }
                    if (out.length > 0) payload.images = out;
                  }
                  wsRef.current.send(JSON.stringify(payload));
                }
              }
            } catch (err) {
              console.error('Failed to send message:', err);
            }

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
function VoiceRoomWithWebRTC({ title, voiceRoomData, communityId, onBack = null }) {
  const enabled = voiceRoomData && voiceRoomData.janusRoomId && voiceRoomData.sessionId && voiceRoomData.handleId;

  const {
    isConnected, participants, isMuted, error, toggleMute, leave
  } = useVoiceRoom(
    voiceRoomData?.janusRoomId,
    voiceRoomData?.sessionId,
    voiceRoomData?.handleId,
    voiceRoomData?.userId,
    enabled
  );

  // Helper function to get avatar from session storage
  const getAvatarFromStorage = (email) => {
    if (!email || !communityId) return null;
    try {
      const storageKey = `community_avatars_${communityId}`;
      const avatars = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      return avatars[email.toLowerCase()] || null;
    } catch {
      return null;
    }
  };

  const getUsernameFromStorage = (email) => {
    if (!email || !communityId) return null;
    try {
      const storageKey = `community_usernames_${communityId}`;
      const usernames = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      return usernames[email.toLowerCase()] || null;
    } catch {
      return null;
    }
  };

  const enrichedParticipants = React.useMemo(() => {
    return participants.map((p) => {
      const userId = p.userId || p.email || '';
      const storedAvatar = getAvatarFromStorage(userId);
      const storedUsername = getUsernameFromStorage(userId);
      const displayName = p.name || storedUsername || (userId ? userId.split('@')[0] : 'Member');
      return {
        ...p,
        avatarUrl: storedAvatar || p.avatarUrl || '/avatars/avatar-1.png',
        name: displayName,
        email: userId
      };
    });
  }, [participants, communityId]);

  React.useEffect(() => {
    if (error) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: error, type: 'error' }
      }));
    }
  }, [error]);

  const handleLeave = () => {
    leave();
    if (onBack && typeof window !== 'undefined' && window.innerWidth <= 640) {
      setTimeout(() => {
        onBack();
      }, 100);
    }
  };

  return (
    <VoiceRoom
      title={title}
      participants={enrichedParticipants}
      localMuted={isMuted}
      onToggleMute={toggleMute}
      onLeave={handleLeave}
      onBack={onBack} />
  );
}

export default CommunityCenterPanel;
