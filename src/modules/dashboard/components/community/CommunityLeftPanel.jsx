import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { authenticatedFetch, BASE_URL } from '../../../../shared/services/API';
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

// Chat Room or Voice Room Section (with plus icon)
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
      const url = `${BASE_URL}community/rooms/create`;
      const body = {
        roomName: groupName.trim(),
        requesterEmail: user.email,
        communityId: communityId
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-[#282828] rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  const title = community?.name || 'Community';
  // Get community ID from various possible fields
  const communityId = community?.id || community?.communityId || community?.community_id;

  const initial = useMemo(() => ({
    announcements: community?.announcements || [],
    groups: [], // Will be fetched from API
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
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);

  // Reset image error when community or imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [community?.imageUrl]);

  // Fetch groups from API
  const fetchGroups = useCallback(async () => {
    if (!communityId) {
      console.warn('Community ID not available');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch(`${BASE_URL}community/rooms/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch groups');
      }

      // Filter groups by communityId if needed, or transform response
      // Adjust based on actual API response structure
      const roomsList = data?.data?.rooms || data?.rooms || data?.data || [];
      
      // Filter rooms for this community if needed
      const communityRooms = roomsList.filter(room => 
        room.communityId === communityId || 
        room.community_id === communityId ||
        room.community?.id === communityId
      );

      // Transform to our structure
      const transformedGroups = communityRooms.map((room) => ({
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
      console.error('Error fetching groups:', err);
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Fetch groups when component mounts or community changes
  useEffect(() => {
    if (communityId) {
      fetchGroups();
    }
  }, [communityId, fetchGroups]);

  // Listen for refresh events
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
    const name = window.prompt(`Create chat room channel for ${groupName}`);
    if (!name || !name.trim()) return;
    const clean = name.trim();
    
    setGroups((prev) =>
      prev.map((g) =>
        g.name === groupName
          ? { ...g, chatRooms: [...(g.chatRooms || ['general']), clean] }
          : g
      )
    );
    
    try {
      window.dispatchEvent(new CustomEvent('community:add-channel', {
        detail: { community, groupName, kind: 'chat-room', name: clean }
      }));
    } catch {}
  };

  const handleAddVoiceRoom = (groupName) => {
    const name = window.prompt(`Create voice room channel for ${groupName}`);
    if (!name || !name.trim()) return;
    const clean = name.trim();
    
    setGroups((prev) =>
      prev.map((g) =>
        g.name === groupName
          ? { ...g, voiceRooms: [...(g.voiceRooms || ['general']), clean] }
          : g
      )
    );
    
    try {
      window.dispatchEvent(new CustomEvent('community:add-channel', {
        detail: { community, groupName, kind: 'voice-room', name: clean }
      }));
    } catch {}
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
      // Handle invite people
      console.log('Invite people');
    } else if (action === 'create-group') {
      // Show create group modal
      setShowCreateGroupModal(true);
    } else if (action === 'settings') {
      // Handle settings
      console.log('Settings');
    }
  };

  const handleCreateGroupSuccess = (newGroup) => {
    // Refresh groups from API after successful creation
    fetchGroups();
    
    // Optionally dispatch event for other components
    window.dispatchEvent(new CustomEvent('community:refresh-groups', { detail: community }));
  };

  // Close dropdown when clicking outside
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
    <div className="w-64 bg-gray-200 border-r border-gray-300 h-[calc(100vh-56px)] flex flex-col rounded-l-2xl">
      {/* Header */}
      <div ref={dropdownRef} className="px-4 py-3 border-b border-gray-300 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate flex-1">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-yellow-400 flex-shrink-0">
              {community?.imageUrl && !imageError ? (
                <img 
                  src={community.imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-yellow-400 flex items-center justify-center">
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
            <button onClick={onBack} title="Back" className="text-gray-600 hover:text-gray-900">←</button>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="mt-2 bg-[#282828] rounded-lg shadow-lg overflow-hidden">
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
      <div className="flex-1 overflow-y-auto px-4 py-3">
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
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-300">
        <button onClick={onBack} className="w-full text-left text-sm text-gray-700 hover:text-gray-900">
          Back to Dashboard
        </button>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        communityName={title}
        communityId={communityId}
        onCreateSuccess={handleCreateGroupSuccess}
      />
    </div>
  );
};

export default CommunityLeftPanel;
