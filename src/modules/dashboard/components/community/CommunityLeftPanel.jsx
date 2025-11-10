import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch, BASE_URL, createCommunityInvite, createLocalGroupInvite, getCommunityRooms, getLocalGroupById, getCommunityMembers, leaveCommunity, joinRoom, createNewChatroom, getChatroomsSummary, getVoiceRoomsList, createVoiceRoom, joinVoiceRoom } from '../../../../shared/services/API';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';

const AnnouncementSection = ({ items, open, onToggle, selectedChannel, onSelectChannel }) => {
  const getChannelId = (channelName) => `announcement:${channelName}`;
  
  return (
    <div className="mb-3">
      <div className="flex items-center text-base text-gray-800">
        <button onClick={onToggle} className="flex items-center gap-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-gray-800">Announcement</span>
        </button>
      </div>
      {open && (
        <div className="mt-2 pl-5 space-y-1">
          {items && items.length > 0 ? (
            items.map((c) => {
              const channelId = getChannelId(c);
              const isSelected = selectedChannel === channelId;
              return (
                <button
                  key={c}
                  onClick={() => onSelectChannel?.(channelId)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold ${
                    isSelected
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  # {c}
                </button>
              );
            })
          ) : (
            <button
              onClick={() => onSelectChannel?.(getChannelId('general'))}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold ${
                selectedChannel === getChannelId('general')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}>
              #general
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Chat Room or Voice Room Section
const RoomSection = ({ title, open, onToggle, onAdd, channels, isVoice = false, selectedChannel, onSelectChannel, groupName, roomCode, roomId }) => {
  const filteredChannels = (channels || []).filter(ch => ch !== 'general' && ch !== 'General');
  const roomType = isVoice ? 'voice' : 'chat';
  const [fetchedChatrooms, setFetchedChatrooms] = useState([]);
  const [fetchedVoiceRooms, setFetchedVoiceRooms] = useState([]);
  const [loadingChatrooms, setLoadingChatrooms] = useState(false);
  const [loadingVoiceRooms, setLoadingVoiceRooms] = useState(false);
  
  const getChannelId = (channelName) => `${groupName}:${roomType}:${channelName}`;
  
  
  useEffect(() => {
    if (open && !isVoice && roomCode) {
      const fetchChatrooms = async () => {
        setLoadingChatrooms(true);
        try {
          const response = await getChatroomsSummary(roomCode);
          const chatroomsData = response?.data || [];
          const chatroomNames = chatroomsData.map((cr) => cr.name || cr.chatRoomCode).filter(Boolean);
          setFetchedChatrooms(chatroomNames);
        } catch (error) {
          console.error('Failed to fetch chatrooms:', error);
          setFetchedChatrooms([]);
        } finally {
          setLoadingChatrooms(false);
        }
      };
      
      fetchChatrooms();
    } else if (open && isVoice && roomId) {
      const fetchVoiceRooms = async () => {
        setLoadingVoiceRooms(true);
        try {
          const response = await getVoiceRoomsList(roomId);
          const voiceRoomsData = response?.voiceRooms || [];
          const voiceRoomNames = voiceRoomsData.map((vr) => vr.name).filter(Boolean);
          setFetchedVoiceRooms(voiceRoomNames);
        } catch (error) {
          console.error('Failed to fetch voice rooms:', error);
          setFetchedVoiceRooms([]);
        } finally {
          setLoadingVoiceRooms(false);
        }
      };
      
      fetchVoiceRooms();
    } else if (!open) {
      setFetchedChatrooms([]);
      setFetchedVoiceRooms([]);
    }
  }, [open, isVoice, roomCode, roomId]);
  
  const allChannels = useMemo(() => {
    const merged = [...filteredChannels];
    if (isVoice) {
      fetchedVoiceRooms.forEach((name) => {
        if (!merged.includes(name)) {
          merged.push(name);
        }
      });
    } else {
    fetchedChatrooms.forEach((name) => {
      if (!merged.includes(name)) {
        merged.push(name);
      }
    });
    }
    return merged;
  }, [filteredChannels, fetchedChatrooms, fetchedVoiceRooms, isVoice]);
  
  const handleChannelClick = (channelName) => {
    const channelId = getChannelId(channelName);
    onSelectChannel?.(channelId, roomCode, roomId);
  };
  
  const hasChannels = allChannels.length > 0;
  
  return (
    <div className="mb-2 ml-4">
      <div className="flex items-center justify-between text-base text-gray-800">
        <button onClick={onToggle} className="flex items-center gap-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-gray-800">{title}</span>
        </button>
        <button onClick={onAdd} className="text-gray-500 hover:text-gray-700" title={`Create ${title}`}>
          +
        </button>
      </div>
      {open && (
        <div className="mt-2 pl-5 space-y-1">
          {loadingChatrooms && !isVoice && (
            <div className="px-3 py-2 text-xs text-gray-500">Loading chatrooms...</div>
          )}
          {loadingVoiceRooms && isVoice && (
            <div className="px-3 py-2 text-xs text-gray-500">Loading voice rooms...</div>
          )}
          {!hasChannels && !loadingChatrooms && !loadingVoiceRooms && (
            <div className="px-3 py-3 text-xs text-gray-500 italic">
              No {isVoice ? 'voice' : 'chat'} rooms yet. Click + to create one!
            </div>
          )}
          {hasChannels && allChannels.map((channel) => {
            const channelId = getChannelId(channel);
            const isSelected = selectedChannel === channelId;
            const isFetched = isVoice ? fetchedVoiceRooms.includes(channel) : fetchedChatrooms.includes(channel);
            return (
              <button
                key={channel}
                onClick={() => handleChannelClick(channel)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gray-700 text-white font-semibold'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                {isVoice ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={isSelected ? 'text-white' : 'text-gray-700'}>
                    <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5c-.55 0-1-.45-1-1V9c0-3.87 3.13-7 7-7s7 3.13 7 7v2c0 .55-.45 1-1 1h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
                  </svg>
                ) : (
                  <span className={isSelected ? 'text-white' : 'text-gray-700'}>#</span>
                )}
                <span>{channel}</span>
                {isFetched && (
                  <span className="ml-auto text-xs text-gray-400" title="Fetched from API">•</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Invite People Modal
const InviteModal = ({ isOpen, onClose, communityId, isLocalGroup = false }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const modalRef = useRef(null);

  const generateInviteLink = useCallback(async () => {
    if (!communityId || !user?.email) {
      setError('Group ID or user email not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (isLocalGroup) {
        // Use local group invite API
        response = await createLocalGroupInvite({
          groupId: communityId,
          inviterEmail: user.email,
          maxUses: 5,
          expiresInHours: 24
        });
      } else {
        // Use community invite API
        response = await createCommunityInvite({
          communityId,
          inviterEmail: user.email,
        });
      }

      const link = response?.data?.inviteLink || response?.inviteLink || response?.data?.link || response?.link || '';
      if (link) {
        setInviteLink(link);
      } else {
        setError('Failed to generate invite link');
      }
    } catch (err) {
      console.error('Error generating invite link:', err);
      setError(err.message || 'Failed to generate invite link');
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { message: err.message || 'Failed to generate invite link', type: 'error' }
      }));
    } finally {
      setLoading(false);
    }
  }, [communityId, user?.email, isLocalGroup]);

  useEffect(() => {
    if (isOpen) {
      setInviteLink('');
      setError('');
      setLoading(false);
      setCopied(false);
      generateInviteLink();
    }
  }, [isOpen, generateInviteLink]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#282828]/50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-[#282828] rounded-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
          title="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Invite people</h2>
        <p className="text-white/80 text-center text-sm mb-6">
          Your community starts with you. Invite people and make it come alive.
        </p>
        
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {loading ? (
          <div className="text-white text-center py-4">Generating invite link...</div>
        ) : inviteLink ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white flex-shrink-0">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-transparent text-white outline-none text-sm"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">

        </div>
      </div>
    </div>
  );
};

// Create Channel Modal
const CreateChannelModal = ({ isOpen, onClose, onSuccess }) => {
  const [channelName, setChannelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setChannelName('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (!channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    const cleanName = channelName.trim().replace(/^#+/, '');
    
    if (!cleanName) {
      setError('Channel name cannot be empty');
      return;
    }

    onSuccess?.(cleanName);
    setChannelName('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  {/* Create Channel Modal */}
  return (
    <div className="fixed inset-0 bg-[#282828]/50 flex items-start justify-center z-20 pt-20">
      <div ref={modalRef} className="bg-black rounded-md max-w-lg w-full mx-">
        <div className="flex items-center gap-4 p-4 ">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="#Channelname"
              className="flex-1 bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 outline-purple-400 ring-2 ring-purple-600"
              autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !channelName.trim()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && (
          <div className="px-4 pb-2">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Create Group Modal
const CreateGroupModal = ({ isOpen, onClose, communityName, communityId, onCreateSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (!user?.email) {
      setError('User email not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `${BASE_URL}community/${communityId}/rooms/create`;
      const body = {
        roomName: groupName.trim(),
        requesterEmail: user.email
      };

      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create group');
      }

      onCreateSuccess?.(data.data || data);
      onClose();
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

{/* Create Group Modal */}
  return (
    <div className="fixed inset-0 bg-[#282828]/50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-[#282828] rounded-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
          title="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-white text-center mb-2">{communityName}</h2>
        <p className="text-white/80 text-center text-sm mb-6">Create a Group for seamless workflow!</p>
        
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg outline-none placeholder:text-gray-400"
            maxLength={14}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !groupName.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Group Section (contains Chat room and Voice room)
const GroupSection = ({ groupName, open, onToggle, chatRooms, voiceRooms, onAddChatRoom, onAddVoiceRoom, selectedChannel, onSelectChannel, roomCode, roomId }) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [fetchedChatrooms, setFetchedChatrooms] = useState([]);
  const [loadingChatrooms, setLoadingChatrooms] = useState(false);
  
  // Fetch chatrooms when group dropdown opens
  useEffect(() => {
    if (open && roomCode) {
      const fetchChatrooms = async () => {
        setLoadingChatrooms(true);
        try {
          const response = await getChatroomsSummary(roomCode);
          const chatroomsData = response?.data || [];
          
          // Extract chatroom names from the response
          const chatroomNames = chatroomsData.map((cr) => cr.name || cr.chatRoomCode).filter(Boolean);
          setFetchedChatrooms(chatroomNames);
        } catch (error) {
          console.error('Failed to fetch chatrooms:', error);
          setFetchedChatrooms([]);
        } finally {
          setLoadingChatrooms(false);
        }
      };
      
      fetchChatrooms();
    } else if (!open) {
      // Clear fetched chatrooms when dropdown closes
      setFetchedChatrooms([]);
    }
  }, [open, roomCode]);
  
  // Filter out 'general' from both room types
  const filteredChatRooms = (chatRooms || []).filter(ch => ch !== 'general' && ch !== 'General');
  const filteredVoiceRooms = (voiceRooms || []).filter(ch => ch !== 'general' && ch !== 'General');
  
  // Merge fetched chatrooms with existing chat rooms, avoiding duplicates
  const allChatRooms = useMemo(() => {
    const merged = [...filteredChatRooms];
    fetchedChatrooms.forEach((name) => {
      if (!merged.includes(name)) {
        merged.push(name);
      }
    });
    return merged;
  }, [filteredChatRooms, fetchedChatrooms]);

  const hasNoRooms = allChatRooms.length === 0 && filteredVoiceRooms.length === 0;
  
  return (
    <div className="mb-3">
      <div className="flex items-center text-base text-gray-800">
        <button onClick={onToggle} className="flex items-center gap-2">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-gray-800">{groupName}</span>
        </button>
      </div>
      {open && (
        <div className="mt-2">
          {loadingChatrooms ? (
            <div className="ml-4 space-y-2">
              {/* Shimmer for Chat Room section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-8 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
              {/* Shimmer for Voice Room section */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : hasNoRooms ? (
            <div className="ml-4 px-3 py-4 text-xs text-gray-500 italic bg-gray-50 rounded-md border border-gray-200">
              <p className="mb-2">No channels yet. Create a channel to get started!</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onAddChatRoom(groupName)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  Create Chat Room
                </button>
                <button
                  onClick={() => onAddVoiceRoom(groupName)}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  Create Voice Room
                </button>
              </div>
            </div>
          ) : (
            <>
              <RoomSection
                title="Chat room"
                open={chatOpen}
                onToggle={() => setChatOpen(!chatOpen)}
                onAdd={() => onAddChatRoom(groupName)}
                channels={allChatRooms}
                isVoice={false}
                selectedChannel={selectedChannel}
                onSelectChannel={onSelectChannel}
                groupName={groupName}
                roomCode={roomCode}
              />
              <RoomSection
                title="Voice room"
                open={voiceOpen}
                onToggle={() => setVoiceOpen(!voiceOpen)}
                onAdd={() => onAddVoiceRoom(groupName)}
                channels={filteredVoiceRooms}
                isVoice={true}
                selectedChannel={selectedChannel}
                onSelectChannel={onSelectChannel}
                groupName={groupName}
                roomCode={roomCode}
                roomId={roomId}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CommunityLeftPanel = ({ community, onBack, isLocalGroup = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const title = community?.name || 'Community';
  const communityId = community?.id || community?.communityId || community?.community_id;

  const initial = useMemo(() => ({
    announcements: community?.announcements || [],
    groups: [], 
  }), [community]);

  const [announcements] = useState(initial.announcements);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('announcement:general');

  const handleChannelSelect = async (channelId, roomCode, roomId) => {
    setSelectedChannel(channelId);
    
    let chatRoomCode = null;
    let janusRoomId = null;
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
    
    // Parse channelId to extract channel name and group name
    const parts = channelId?.split(':') || [];
    if (parts.length >= 3) {
      const groupName = parts[0]; // Extract groupName from channelId
      const channelName = parts[2];
      const roomType = parts[1];
      
      if (roomType === 'chat') {
      // Only fetch chatRoomCode for non-general channels
      if (channelName && channelName !== 'general' && roomCode) {
        try {
          // First, check session storage for existing chatroom
          const storageKey = `chatroom_${roomCode}_${channelName}`;
          const stored = sessionStorage.getItem(storageKey);
          
          if (stored) {
            const parsed = JSON.parse(stored);
            chatRoomCode = parsed?.data?.chatRoomCode || parsed?.chatRoomCode;
          }
          
          if (!chatRoomCode) {
            const response = await getChatroomsSummary(roomCode);
            const chatroomsData = response?.data || [];
            const chatroom = chatroomsData.find((cr) => cr.name === channelName);
            if (chatroom) {
              chatRoomCode = chatroom.chatRoomCode;
              sessionStorage.setItem(storageKey, JSON.stringify({ data: { chatRoomCode } }));
            }
          }
        } catch (error) {
          console.error('Failed to get chatRoomCode:', error);
        }
      }
      } else if (roomType === 'voice') {
        // Handle voice room - get janusRoomId from sessionStorage
        if (channelName && roomId && userEmail) {
          try {
            // First, try to get from the specific storage key (from create response)
            const storageKey = `voiceRoom_${roomId}_${channelName}`;
            const stored = sessionStorage.getItem(storageKey);
            
            if (stored) {
              const parsed = JSON.parse(stored);
              // Handle different response structures
              janusRoomId = parsed?.data?.janusRoomId || 
                           parsed?.data?.voiceRooms?.[0]?.janusRoomId ||
                           parsed?.janusRoomId ||
                           parsed?.voiceRooms?.[0]?.janusRoomId;
            }
            
            // If not found, check the voiceRooms array
            if (!janusRoomId) {
              const voiceRoomsArray = JSON.parse(sessionStorage.getItem('voiceRooms') || '[]');
              const voiceRoom = voiceRoomsArray.find(
                (vr) => vr.name === channelName && (vr.chatRoomId === roomId || vr.chatRoomId === String(roomId))
              );
              if (voiceRoom) {
                janusRoomId = voiceRoom.janusRoomId;
              }
            }
            
            // If still not found, try fetching from API
            if (!janusRoomId) {
              try {
                const response = await getVoiceRoomsList(roomId);
                const voiceRoomsData = response?.voiceRooms || [];
                const voiceRoom = voiceRoomsData.find((vr) => vr.name === channelName);
                if (voiceRoom && voiceRoom.janusRoomId) {
                  janusRoomId = voiceRoom.janusRoomId;
                  // Save to sessionStorage for future use
                  const storageKey = `voiceRoom_${roomId}_${channelName}`;
                  sessionStorage.setItem(storageKey, JSON.stringify({ data: voiceRoom }));
                  
                  // Also update the voiceRooms array
                  const voiceRoomsArray = JSON.parse(sessionStorage.getItem('voiceRooms') || '[]');
                  const existingIndex = voiceRoomsArray.findIndex(
                    (vr) => vr.name === channelName && (vr.chatRoomId === roomId || vr.chatRoomId === String(roomId))
                  );
                  if (existingIndex >= 0) {
                    voiceRoomsArray[existingIndex] = { ...voiceRoom, chatRoomId: roomId, groupName };
                  } else {
                    voiceRoomsArray.push({ ...voiceRoom, chatRoomId: roomId, groupName });
                  }
                  sessionStorage.setItem('voiceRooms', JSON.stringify(voiceRoomsArray));
                }
              } catch (error) {
                console.error('Failed to fetch voice room from API:', error);
              }
            }
            
            // Join the voice room if janusRoomId is found
            if (janusRoomId) {
              try {
                const joinResponse = await joinVoiceRoom(janusRoomId, userEmail);
                console.log('Joined voice room:', joinResponse);
                // Save join response if needed
                sessionStorage.setItem(`voiceRoomJoin_${janusRoomId}`, JSON.stringify(joinResponse));
                
                // Extract sessionId and handleId from response
                const responseData = joinResponse?.data || joinResponse;
                const sessionId = responseData?.sessionId;
                const handleId = responseData?.handleId;
                
                // Dispatch event with join data for VoiceRoom component
                if (sessionId && handleId) {
                  window.dispatchEvent(new CustomEvent('voice-room:joined', {
                    detail: { janusRoomId, sessionId, handleId, userId: userEmail }
                  }));
                }
                
                // Show success toast
                window.dispatchEvent(new CustomEvent('toast', {
                  detail: { message: 'Successfully joined voice room!', type: 'success' }
                }));
              } catch (error) {
                console.error('Failed to join voice room:', error);
                // Don't show error toast for 403, might be expected behavior
                if (error.message && !error.message.includes('403')) {
                  window.dispatchEvent(new CustomEvent('toast', {
                    detail: { message: error.message || 'Failed to join voice room', type: 'error' }
                  }));
                }
              }
            } else {
              console.warn('janusRoomId not found for voice room:', channelName);
            }
          } catch (error) {
            console.error('Failed to get janusRoomId:', error);
          }
        }
      }
    }
    
    try {
      window.dispatchEvent(new CustomEvent('community:channel-selected', {
        detail: { channelId, roomCode, chatRoomCode, janusRoomId }
      }));
    } catch (error) {
      console.error('Error dispatching channel-selected event:', error);
    }
  };

  const [openAnn, setOpenAnn] = useState(true);
  const [openGroups, setOpenGroups] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelModalContext, setChannelModalContext] = useState({ groupName: null, roomType: null, roomId: null });
  const [imageError, setImageError] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    setImageError(false);
  }, [community?.imageUrl]);

  useEffect(() => {
    const determineRole = async () => {
      try {
        const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
        if (!communityId || !userEmail) return;
        if (isLocalGroup) {
          try {
            const cached = sessionStorage.getItem(`localGroupDetails:${communityId}`);
            const lg = cached ? JSON.parse(cached) : null;
            const creator = lg?.creatorEmail || lg?.createdByEmail || lg?.creator || '';
            setCurrentUserRole(creator && creator.toLowerCase() === userEmail.toLowerCase() ? 'ADMIN' : 'MEMBER');
          } catch {}
        } else {
          const data = await getCommunityMembers(communityId);
          const members = data?.data?.members || data?.members || [];
          const me = members.find((m) => (m.email || m.username) && (m.email || m.username).toLowerCase() === userEmail.toLowerCase());
          setCurrentUserRole(((me?.role || '').toUpperCase()) || '');
          
          // Store avatar URLs and usernames in session storage for use in chat rooms and voice rooms
          const avatarMap = {};
          const usernameMap = {};
          members.forEach((member) => {
            const email = member?.email || member?.username || '';
            if (email) {
              if (member?.avatarPreviewUrl) {
                avatarMap[email.toLowerCase()] = member.avatarPreviewUrl;
              }
              if (member?.username) {
                usernameMap[email.toLowerCase()] = member.username;
              }
            }
          });
          
          // Store avatars in session storage with community ID as key
          if (Object.keys(avatarMap).length > 0) {
            const storageKey = `community_avatars_${communityId}`;
            const existingAvatars = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
            sessionStorage.setItem(storageKey, JSON.stringify({ ...existingAvatars, ...avatarMap }));
          }
          
          // Store usernames in session storage with community ID as key
          if (Object.keys(usernameMap).length > 0) {
            const storageKey = `community_usernames_${communityId}`;
            const existingUsernames = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
            sessionStorage.setItem(storageKey, JSON.stringify({ ...existingUsernames, ...usernameMap }));
          }
        }
      } catch {}
    };
    determineRole();
  }, [communityId, isLocalGroup, user?.email]);

  const fetchGroups = useCallback(async () => {
    if (!communityId) {
      console.warn('Community ID not available');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isLocalGroup) {
        const data = await getLocalGroupById(communityId);
        const lg = data?.data || data || {};

        try {
          sessionStorage.setItem(`localGroupDetails:${communityId}`, JSON.stringify(lg));
        } catch {}

        const transformedGroups = [
          {
            id: lg.id || lg.groupId || communityId,
            name: lg.name || lg.groupName || title || 'Local Group',
            chatRooms: [],
            voiceRooms: [],
            roomCode: lg.roomCode || lg.code || undefined,
          },
        ];

        setGroups(transformedGroups);
        setOpenGroups(
          transformedGroups.reduce((acc, g) => ({ ...acc, [g.name]: true }), {})
        );
      } else {
        const data = await getCommunityRooms(communityId);
        const roomsList = data?.data || [];

        // Save the community rooms response to sessionStorage for later reference
        try {
          sessionStorage.setItem(`communityRooms:${communityId}`, JSON.stringify(data));
        } catch (err) {
          console.warn('Failed to save community rooms to sessionStorage:', err);
        }

        const transformedGroups = roomsList.map((room) => {
          const chatRooms = (room.chatRooms || []).filter(ch => ch !== 'general' && ch !== 'General');
          const voiceRooms = (room.voiceRooms || []).filter(ch => ch !== 'general' && ch !== 'General');
          return {
            id: room.id,
            name: room.name || room.roomName,
            chatRooms,
            voiceRooms,
            roomCode: room.roomCode
          };
        });

        setGroups(transformedGroups);
        setOpenGroups(
          transformedGroups.reduce((acc, g) => ({ ...acc, [g.name]: false }), {})
        );
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [communityId, isLocalGroup, title]);

  useEffect(() => {
    if (communityId) {
      fetchGroups();
    }
  }, [communityId, fetchGroups]);

  useEffect(() => {
    const onRefresh = () => {
      if (communityId) {
        fetchGroups();
      }
    };
    window.addEventListener('community:refresh-groups', onRefresh);
    const onOpenInvite = () => setShowInviteModal(true);
    window.addEventListener('community:open-invite', onOpenInvite);
    return () => {
      window.removeEventListener('community:refresh-groups', onRefresh);
      window.removeEventListener('community:open-invite', onOpenInvite);
    };
  }, [communityId, fetchGroups]);

  const handleAddChatRoom = (groupName) => {
    setChannelModalContext({ groupName, roomType: 'chat' });
    setShowCreateChannelModal(true);
  };

  const handleAddVoiceRoom = (groupName) => {
    // Find the group to get roomId
    const targetGroup = groups.find((g) => g.name === groupName);
    const roomId = targetGroup?.id;
    setChannelModalContext({ groupName, roomType: 'voice', roomId });
    setShowCreateChannelModal(true);
  };

  const handleChannelCreated = async (channelName) => {
    const { groupName, roomType, roomId } = channelModalContext;
    if (!groupName || !channelName) return;

    const clean = channelName.trim();
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
    
    // Create chatroom via API for chat rooms
    if (roomType === 'chat') {
      // Find the group to get roomCode
      const targetGroup = groups.find((g) => g.name === groupName);
      const roomCode = targetGroup?.roomCode;
      
      if (roomCode) {
        try {
          const response = await createNewChatroom(roomCode, clean);
          
          // Save response to session storage
          const storageKey = `chatroom_${roomCode}_${clean}`;
          const existingChatrooms = JSON.parse(sessionStorage.getItem('chatrooms') || '[]');
          const chatroomData = {
            id: response?.data?.id || response?.id,
            name: response?.data?.name || clean,
            createdAt: response?.data?.createdAt || Date.now(),
            chatRoomCode: response?.data?.chatRoomCode || response?.data?.id,
            roomCode: roomCode,
            groupName: groupName,
            created: new Date().toISOString()
          };
          
          // Check if already exists, update if found, otherwise add
          const existingIndex = existingChatrooms.findIndex(
            (cr) => cr.chatRoomCode === chatroomData.chatRoomCode || 
                    (cr.name === clean && cr.roomCode === roomCode)
          );
          
          if (existingIndex >= 0) {
            existingChatrooms[existingIndex] = chatroomData;
          } else {
            existingChatrooms.push(chatroomData);
          }
          
          sessionStorage.setItem('chatrooms', JSON.stringify(existingChatrooms));
          sessionStorage.setItem(storageKey, JSON.stringify(response));
          
          // Show success toast
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Chatroom created successfully!', type: 'success' }
          }));
        } catch (error) {
          console.error('Failed to create chatroom:', error);
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: error.message || 'Failed to create chatroom', type: 'error' }
          }));
        }
      }
      
      setGroups((prev) =>
        prev.map((g) =>
          g.name === groupName
            ? { ...g, chatRooms: [...(g.chatRooms || []), clean] }
            : g
        )
      );
    } else if (roomType === 'voice') {
      // Create voice room via API
      if (roomId && userEmail) {
        try {
          const response = await createVoiceRoom(roomId, clean, userEmail);
          
          // Save response to session storage
          const storageKey = `voiceRoom_${roomId}_${clean}`;
          const existingVoiceRooms = JSON.parse(sessionStorage.getItem('voiceRooms') || '[]');
          
          // Handle different response structures - could be direct object or wrapped in voiceRooms array
          const voiceRoomFromResponse = response?.data || response;
          const actualVoiceRoom = voiceRoomFromResponse?.voiceRooms?.[0] || voiceRoomFromResponse;
          
          const voiceRoomData = {
            id: actualVoiceRoom?.id || response?.data?.id || response?.id,
            janusRoomId: actualVoiceRoom?.janusRoomId || response?.data?.janusRoomId || response?.janusRoomId,
            name: actualVoiceRoom?.name || response?.data?.name || clean,
            createdBy: actualVoiceRoom?.createdBy || response?.data?.createdBy || userEmail,
            createdAt: actualVoiceRoom?.createdAt || response?.data?.createdAt || new Date().toISOString(),
            active: actualVoiceRoom?.active !== undefined ? actualVoiceRoom?.active : (response?.data?.active !== undefined ? response?.data?.active : true),
            roomCode: actualVoiceRoom?.roomCode || response?.data?.roomCode || response?.roomCode,
            chatRoomId: roomId,
            groupName: groupName,
            created: new Date().toISOString()
          };
          
          // Check if already exists, update if found, otherwise add
          const existingIndex = existingVoiceRooms.findIndex(
            (vr) => (vr.id === voiceRoomData.id && (vr.chatRoomId === roomId || vr.chatRoomId === String(roomId))) || 
                    (vr.name === clean && (vr.chatRoomId === roomId || vr.chatRoomId === String(roomId)))
          );
          
          if (existingIndex >= 0) {
            existingVoiceRooms[existingIndex] = voiceRoomData;
          } else {
            existingVoiceRooms.push(voiceRoomData);
          }
          
          sessionStorage.setItem('voiceRooms', JSON.stringify(existingVoiceRooms));
          // Save the full response for reference
          sessionStorage.setItem(storageKey, JSON.stringify(response));
          
          // Show success toast
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: 'Voice room created successfully!', type: 'success' }
          }));
          
          // Refresh groups to get updated voice rooms list
          fetchGroups();
        } catch (error) {
          console.error('Failed to create voice room:', error);
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { message: error.message || 'Failed to create voice room', type: 'error' }
          }));
        }
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Room ID or user email not found', type: 'error' }
        }));
      }
      
      // Update local state immediately for better UX
      setGroups((prev) =>
        prev.map((g) =>
          g.name === groupName
            ? { ...g, voiceRooms: [...(g.voiceRooms || []), clean] }
            : g
        )
      );
    }
    
    try {
      window.dispatchEvent(new CustomEvent('community:add-channel', {
        detail: { community, groupName, kind: roomType === 'chat' ? 'chat-room' : 'voice-room', name: clean }
      }));
    } catch (error) {
      console.error('Error dispatching add-channel event:', error);
    }
  };

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));

    // Removed auto-selection of 'general' channel since general channels are no longer used
  };

  const handleDropdownAction = (action) => {
    setShowDropdown(false);
    if (action === 'invite') {
      setShowInviteModal(true);
    } else if (action === 'create-group') {
      // Only allow workspace owners and admins to create groups
      const isAuthorized = currentUserRole === 'ADMIN' || 
                          currentUserRole === 'OWNER' || 
                          currentUserRole === 'WORKSPACE_OWNER';
      if (!isLocalGroup && isAuthorized) {
        setShowCreateGroupModal(true);
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { message: 'Only workspace owners and admins can create groups', type: 'error' }
        }));
      }
    } else if (action === 'settings') {
      // Navigate to settings page
      if (communityId) {
        if (isLocalGroup) {
          navigate(`/dashboard/local-group/${communityId}/settings`);
        } else {
          navigate(`/dashboard/community/${communityId}/settings`);
        }
      }
    } else if (action === 'leave') {
      const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
      if (isLocalGroup) {
        try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Left local-group', type: 'success' } })); } catch {}
        onBack?.();
      } else if (community?.name && userEmail) {
        leaveCommunity({ communityName: community.name, userEmail })
          .then(() => {
            try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Left community', type: 'success' } })); } catch {}
            onBack?.();
          })
          .catch((err) => {
            try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: err.message || 'Failed to leave', type: 'error' } })); } catch {}
          });
      }
    }
  };

  const handleCreateGroupSuccess = () => {
    fetchGroups();
    
    window.dispatchEvent(new CustomEvent('community:refresh-groups', { detail: community }));
    try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Group created', type: 'success' } })); } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  {/* Community Left Panel */}
  return (
    <div className="min-w-[80vw] sm:min-w-55 md:min-w-70 bg-gray-200 h-full flex flex-col rounded-r-xl overflow-hidden">
      {/* Header */}
      <div
        ref={dropdownRef}
        className={`px-4 py-3 relative ${
          showDropdown
            ? 'bg-[#282828] rounded-md'
            : 'border-b border-gray-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate flex-1">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-400 flex-shrink-0">
              {community?.imageUrl && !imageError ? (
                <img 
                  src={community.imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">{title.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <span className={`font-semibold text-lg truncate ${showDropdown ? 'text-white' : 'text-gray-900'}`}>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              title="Menu"
              className={`${showDropdown ? 'text-white' : 'text-gray-600 hover:text-gray-900'} transition-transform`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>


        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="mt-0 pt-2 bg-[#282828] rounded-b-md overflow-hidden">
            <button
              onClick={() => handleDropdownAction('invite')}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black transition-colors rounded-md"
            >
              Invite people
            </button>
            {!isLocalGroup && (currentUserRole === 'ADMIN' || currentUserRole === 'OWNER' || currentUserRole === 'WORKSPACE_OWNER') && (
              <button
                onClick={() => handleDropdownAction('create-group')}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black transition-colors rounded-md"
              >
                Create group
              </button>
            )}
            {currentUserRole === 'ADMIN' && (
              <button
                onClick={() => handleDropdownAction('settings')}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black transition-colors rounded-md"
              >
                Settings
              </button>
            )}
            <button
              onClick={() => handleDropdownAction('leave')}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white hover:text-black transition-colors rounded-md"
            >
              {isLocalGroup ? 'Leave local-group' : 'Leave community'}
            </button>
          </div>
        )}
        
      </div>


      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 relative pb-16">
        {loading && (
          <div className="space-y-4">
            {/* Announcement skeleton */}
            {!isLocalGroup && (
              <div className="mb-3">
                <div className="h-4 w-28 bg-gray-300 rounded animate-pulse mb-2" />
                <div className="space-y-2 pl-5">
                  <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            )}

            {/* Groups skeleton */}
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="mb-3">
                <div className="h-4 w-36 bg-gray-300 rounded animate-pulse mb-2" />
                <div className="pl-4 space-y-2">
                  <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}
        
        {/* Announcement Section hidden for Local Groups */}
        {!isLocalGroup && (
          <AnnouncementSection
            items={announcements}
            open={openAnn}
            onToggle={() => setOpenAnn((v) => !v)}
            selectedChannel={selectedChannel}
            onSelectChannel={(channelId) => handleChannelSelect(channelId, null)}
          />
        )}

        {/* Groups with Chat room and Voice room */}
        {!loading && groups.length === 0 && !error && (
          <div className="text-gray-600 text-sm mt-4">No groups yet. Create a group to get started!</div>
        )}
        
        {!loading && groups.map((group) => (
          <GroupSection
            key={group.id || group.name}
            groupName={group.name}
            open={openGroups[group.name] || false}
            onToggle={() => toggleGroup(group.name)}
            chatRooms={group.chatRooms || ['general']}
            voiceRooms={group.voiceRooms || ['general']}
            onAddChatRoom={handleAddChatRoom}
            onAddVoiceRoom={handleAddVoiceRoom}
            selectedChannel={selectedChannel}
            onSelectChannel={handleChannelSelect}
            roomCode={group.roomCode}
            roomId={group.id}
          />
        ))}
            {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 px-4 pb-3 pt-2 border-t border-gray-300 rounded-b-xl">
        <button onClick={onBack} className="w-full text-center text-sm bg-zinc-900 text-white rounded-xl py-3 font-medium">
          Back to Dashboard
        </button>
      </div>
      </div>



      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        communityName={title}
        communityId={communityId}
        onCreateSuccess={handleCreateGroupSuccess}
      />

      {/* Invite People Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        communityName={title}
        communityId={communityId}
        isLocalGroup={isLocalGroup}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={showCreateChannelModal}
        onClose={() => {
          setShowCreateChannelModal(false);
          setChannelModalContext({ groupName: null, roomType: null });
        }}
        groupName={channelModalContext.groupName}
        roomType={channelModalContext.roomType}
        onSuccess={handleChannelCreated}
      />
    </div>
  );
};

export default CommunityLeftPanel;
