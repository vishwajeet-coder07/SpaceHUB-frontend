import React, { useState, useEffect } from 'react';

const DashboardLeftSidebar = ({ selectedView, setSelectedView, selectedFriend, setSelectedFriend }) => {
  const [isDirectMessageOpen, setIsDirectMessageOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => {
    const fetchedFriends = [];
    setFriends(fetchedFriends);
    setFilteredFriends(fetchedFriends);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFriends(
        friends.filter((friend) =>
          friend.username?.toLowerCase().includes(query) ||
          friend.name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, friends]);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setSelectedView('dashboard');
  };

  return (
    <div className="hidden md:block w-80 bg-gray-200 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0 rounded-r-xl p-4 border-l border-gray-500">
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
                  {filteredFriends.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      No friends yet
                    </div>
                  ) : (
                    filteredFriends.map((friend) => (
                      <button
                        key={friend.id || friend.userId}
                        onClick={() => handleFriendClick(friend)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          selectedFriend?.id === friend.id || selectedFriend?.userId === friend.userId
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.username || friend.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-gray-600">
                              {(friend.username || friend.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-sm truncate">
                          {friend.username || friend.name || 'Unknown'}
                        </span>
                      </button>
                    ))
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
