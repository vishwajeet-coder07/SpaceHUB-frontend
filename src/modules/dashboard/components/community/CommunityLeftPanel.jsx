import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch, BASE_URL, createCommunityInvite } from '../../../../shared/services/API';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';

// Announcement Section 
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
const RoomSection = ({ title, open, onToggle, onAdd, channels, isVoice = false, selectedChannel, onSelectChannel, groupName }) => {
  const defaultChannels = channels && channels.length > 0 ? channels : ['general'];
  const roomType = isVoice ? 'voice' : 'chat';
  
  const getChannelId = (channelName) => `${groupName}:${roomType}:${channelName}`;
  
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
          {defaultChannels.map((channel) => {
            const channelId = getChannelId(channel);
            const isSelected = selectedChannel === channelId;
            return (
              <button
                key={channel}
                onClick={() => onSelectChannel?.(channelId)}
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
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Invite People Modal
const InviteModal = ({ isOpen, onClose, communityId }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const modalRef = useRef(null);

  const generateInviteLink = useCallback(async () => {
    if (!communityId || !user?.email) {
      setError('Community ID or user email not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCommunityInvite({
        communityId,
        inviterEmail: user.email,
      });

      const link = response?.data?.inviteLink || response?.inviteLink || '';
      if (link) {
        setInviteLink(link);
      } else {
        setError('Failed to generate invite link');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  }, [communityId, user?.email]);

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
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-colors"
          >
            Close
          </button>
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

  return (
    <div className="fixed inset-0 bg-[#282828]/50 flex items-start justify-center z-50 pt-20">
      <div ref={modalRef} className="bg-white rounded-lg max-w-lg w-full mx-4 border border-gray-300">
        <div className="flex items-center gap-4 p-4">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="#Channelname"
            className="flex-1 border border-gray-300 rounded px-4 py-2 text-gray-900 outline-none focus:border-purple-500"
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
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
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
const GroupSection = ({ groupName, open, onToggle, chatRooms, voiceRooms, onAddChatRoom, onAddVoiceRoom, selectedChannel, onSelectChannel }) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(true);
  
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
          <RoomSection
            title="Chat room"
            open={chatOpen}
            onToggle={() => setChatOpen(!chatOpen)}
            onAdd={() => onAddChatRoom(groupName)}
            channels={chatRooms}
            isVoice={false}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
            groupName={groupName}
          />
          <RoomSection
            title="Voice room"
            open={voiceOpen}
            onToggle={() => setVoiceOpen(!voiceOpen)}
            onAdd={() => onAddVoiceRoom(groupName)}
            channels={voiceRooms}
            isVoice={true}
            selectedChannel={selectedChannel}
            onSelectChannel={onSelectChannel}
            groupName={groupName}
          />
        </div>
      )}
    </div>
  );
};

const CommunityLeftPanel = ({ community, onBack }) => {
  const navigate = useNavigate();
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

  const [openAnn, setOpenAnn] = useState(true);
  const [openGroups, setOpenGroups] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelModalContext, setChannelModalContext] = useState({ groupName: null, roomType: null });
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    setImageError(false);
  }, [community?.imageUrl]);

  const fetchGroups = useCallback(async () => {
    if (!communityId) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch(`${BASE_URL}community/${communityId}/rooms/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch groups');
      }

      const roomsList = data?.data || [];

      const transformedGroups = roomsList.map((room) => ({
        id: room.id,
        name: room.name || room.roomName,
        chatRooms: room.chatRooms || ['general'],
        voiceRooms: room.voiceRooms || ['general'],
        roomCode: room.roomCode
      }));

      setGroups(transformedGroups);
      setOpenGroups(
        transformedGroups.reduce((acc, g) => ({ ...acc, [g.name]: false }), {})
      );
    } catch (err) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

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
    return () => {
      window.removeEventListener('community:refresh-groups', onRefresh);
    };
  }, [communityId, fetchGroups]);

  const handleAddChatRoom = (groupName) => {
    setChannelModalContext({ groupName, roomType: 'chat' });
    setShowCreateChannelModal(true);
  };

  const handleAddVoiceRoom = (groupName) => {
    setChannelModalContext({ groupName, roomType: 'voice' });
    setShowCreateChannelModal(true);
  };

  const handleChannelCreated = (channelName) => {
    const { groupName, roomType } = channelModalContext;
    if (!groupName || !channelName) return;

    const clean = channelName.trim();
    
    if (roomType === 'chat') {
      setGroups((prev) =>
        prev.map((g) =>
          g.name === groupName
            ? { ...g, chatRooms: [...(g.chatRooms || ['general']), clean] }
            : g
        )
      );
    } else {
      setGroups((prev) =>
        prev.map((g) =>
          g.name === groupName
            ? { ...g, voiceRooms: [...(g.voiceRooms || ['general']), clean] }
            : g
        )
      );
    }
    
    try {
      window.dispatchEvent(new CustomEvent('community:add-channel', {
        detail: { community, groupName, kind: roomType === 'chat' ? 'chat-room' : 'voice-room', name: clean }
      }));
    } catch (error) {
    }
  };

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const handleDropdownAction = (action) => {
    setShowDropdown(false);
    if (action === 'invite') {
      setShowInviteModal(true);
    } else if (action === 'create-group') {
      setShowCreateGroupModal(true);
    } else if (action === 'settings') {
      // Navigate to settings page
      if (communityId) {
        navigate(`/dashboard/community/${communityId}/settings`);
      }
    }
  };

  const handleCreateGroupSuccess = () => {
    fetchGroups();
    
    window.dispatchEvent(new CustomEvent('community:refresh-groups', { detail: community }));
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

  return (
    <div className="w-80 bg-gray-200 h-[calc(100vh-56px)] flex flex-col rounded-r-xl border-l border-gray-500">
      {/* Header */}
      <div ref={dropdownRef} className="px-4 py-3 border-b border-gray-500 relative">
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
            <span className="font-semibold text-lg text-gray-900 truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              title="Menu"
              className="text-gray-600 hover:text-gray-900 transition-transform"
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
          <div className="mt-2 bg-[#282828] rounded-lg overflow-hidden">
            <button
              onClick={() => handleDropdownAction('invite')}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              Invite people
            </button>
            <button
              onClick={() => handleDropdownAction('create-group')}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              Create group
            </button>
            <button
              onClick={() => handleDropdownAction('settings')}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              Settings
            </button>
          </div>
        )}
      </div>


      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 relative pb-16">
        {loading && (
          <div className="text-gray-600 text-sm mb-4">Loading groups...</div>
        )}
        {error && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}
        
        {/* Announcement Section - No plus icon */}
        <AnnouncementSection
          items={announcements}
          open={openAnn}
          onToggle={() => setOpenAnn((v) => !v)}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
        />

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
            onSelectChannel={setSelectedChannel}
          />
        ))}
            {/* Footer */}
      <div className="absolute bottom-0 w-55 rounded-xl bg-zinc-900 px-3 py-2 border-t border-gray-300">
        <button onClick={onBack} className="w-full text-center text-sm text-white">
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
