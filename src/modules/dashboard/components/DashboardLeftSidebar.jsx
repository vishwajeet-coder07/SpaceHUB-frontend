import React, { useState, useEffect, useCallback } from 'react';
import { getFriendsList } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';

// Helper function to format name as "first last"
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

// Friend Avatar Component with fallback
const FriendAvatar = ({ avatar, username, firstName, isSelected }) => {
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  if (!avatar || imageError) {
    const initial = firstName ? firstName.charAt(0).toUpperCase() : username.charAt(0).toUpperCase();
    return (
      <span 
        className={`text-xs font-semibold ${
          isSelected ? 'text-white' : 'text-gray-600'
        }`}
      >
        {initial}
      </span>
    );
  }

  return (
    <img 
      src={avatar} 
      alt={username} 
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};

const DashboardLeftSidebar = ({ selectedView, setSelectedView, selectedFriend, setSelectedFriend }) => {
  const { user } = useAuth();
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFriends = useCallback(async () => {
      setLoading(true);
      setError('');
      
      const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
      const userEmail = user?.email || storedEmail;
      
      if (!userEmail) {
        setError('User email not found');
        setLoading(false);
        return;
      }
      
      let hasCachedData = false;
      try {
        const cachedFriends = sessionStorage.getItem('friendsList');
        if (cachedFriends) {
          const parsedFriends = JSON.parse(cachedFriends);
          const cachedUserEmail = sessionStorage.getItem('friendsListUserEmail');
          if (cachedUserEmail === userEmail && Array.isArray(parsedFriends) && parsedFriends.length > 0) {
            setFriends(parsedFriends);
            setFilteredFriends(parsedFriends);
            hasCachedData = true;
            setLoading(false);

          }
        }
      } catch (e) {
        console.error('Error loading cached friends:', e);
      }
      
      try {
        const response = await getFriendsList(userEmail);
        const friendsList = response?.data || [];
        const processedFriends = Array.isArray(friendsList) 
          ? friendsList.map(friend => ({
              id: friend.id,
              firstName: friend.firstName || friend.first || '',
              lastName: friend.lastName || friend.last || '',
              email: friend.email || '',
              ...friend
            }))
          : [];
        
        // console.log('Processed friends list:', processedFriends);
        
        // Save to sessionStorage
        try {
          sessionStorage.setItem('friendsList', JSON.stringify(processedFriends));
          sessionStorage.setItem('friendsListUserEmail', userEmail);
          sessionStorage.setItem('friendsListTimestamp', Date.now().toString());
        } catch (storageError) {
          console.error('Error saving friends to sessionStorage:', storageError);
        }
        
        setFriends(processedFriends);
        setFilteredFriends(processedFriends);
      } catch (e) {
        setError(e.message || 'Failed to load friends');
        setFriends([]);
        setFilteredFriends([]);
      } finally {
        setLoading(false);
      }
    }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    const handler = () => fetchFriends();
    window.addEventListener('friends:refresh', handler);
    return () => window.removeEventListener('friends:refresh', handler);
  }, [fetchFriends]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFriends(
        friends.filter((friend) => {
          const friendName = formatFriendName(friend);
          return (
            friendName.toLowerCase().includes(query) ||
            friend.username?.toLowerCase().includes(query) ||
            friend.firstName?.toLowerCase().includes(query) ||
            friend.lastName?.toLowerCase().includes(query) ||
            friend.first?.toLowerCase().includes(query) ||
            friend.last?.toLowerCase().includes(query) ||
            friend.email?.toLowerCase().includes(query)
          );
        })
      );
    }
  }, [searchQuery, friends]);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setSelectedView('dashboard');
  };

  return (
    <div className="hidden md:block w-80 bg-gray-200 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0 rounded-r-xl">
      <div className="space-y-2 mb-6">
        <button
          onClick={() => {
            setSelectedView('dashboard');
            setSelectedFriend(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
            selectedView === 'dashboard' && !selectedFriend
              ? 'bg-[#282828] text-white'
              : 'text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span className="font-medium">Dashboard</span>
        </button>

        <div className="space-y-2">
          <button
            onClick={() => {
              setSelectedView('discover');
              setSelectedFriend(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
              selectedView === 'discover'
                ? 'bg-[#282828] text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium">Discover</span>
          </button>

          {/* Direct Message Section */}
          <div>
            <button
              onClick={() => setIsDirectMessageOpen(!isDirectMessageOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="font-medium">Direct message</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isDirectMessageOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDirectMessageOpen && (
              <div className="mt-2 space-y-2">
                {/* Search Bar */}
                <div className="px-4">
                  <div className="relative">
                    <svg 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Friends List */}
                <div className="space-y-1">
                  {loading ? (
                    // Shimmer loading effect
                    Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="px-4 py-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
                        <div className="flex-1 h-4 bg-gray-300 rounded animate-pulse" />
                      </div>
                    ))
                  ) : error ? (
                    <div className="px-4 py-2 text-sm text-red-500 text-center">
                      {error}
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      {searchQuery.trim() ? 'No friends found' : 'No friends yet'}
                    </div>
                  ) : (
                    filteredFriends.map((friend) => {
                      const friendId = friend.id || friend.userId || friend.friendId;
                      const friendDisplayName = formatFriendName(friend);
                      const friendAvatar = friend.avatar || friend.avatarUrl || friend.profileImage;
                      const isSelected = selectedFriend?.id === friendId || 
                                       selectedFriend?.userId === friendId ||
                                       selectedFriend?.friendId === friendId;
                      
                      return (
                        <button
                          key={friendId || friendDisplayName}
                          onClick={() => handleFriendClick(friend)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                            isSelected
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <FriendAvatar 
                            avatar={friendAvatar}
                            username={friendDisplayName}
                            firstName={friend.firstName}
                            isSelected={isSelected}
                          />
                        </div>
                          <span className="font-medium text-sm truncate">
                            {friendDisplayName}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLeftSidebar;
