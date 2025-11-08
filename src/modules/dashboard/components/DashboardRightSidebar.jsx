import React, { useEffect, useState, useCallback } from 'react';
import { searchUsers, sendFriendRequest } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';

const DashboardRightSidebar = ({ onClose }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [addingFriend, setAddingFriend] = useState({});
  const [requested, setRequested] = useState({});

  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    try {
      const data = await searchUsers(query.trim(), 0, 10);
      // console.log('data', data);
      const results = data?.data?.content || [];
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (e) {
      setSearchError(e.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleAddFriend = async (friendUser) => {
    const userEmail = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;
    const friendEmail = friendUser?.email;

    if (!userEmail || !friendEmail) {
      alert('Unable to send friend request. User email not found.');
      return;
    }

    const friendId = friendUser?.userId || friendUser?.id;
    setAddingFriend((prev) => ({ ...prev, [friendId]: true }));

    try {
      const response = await sendFriendRequest(userEmail, friendEmail);
      console.log('Friend request sent:', response);

      // Dispatch event for other components (need)
      window.dispatchEvent(new CustomEvent('user:add-friend', { detail: { user: friendUser, response } }));

      // Mark as requested and show toast
      setRequested((prev) => ({ ...prev, [friendId]: true }));
      try {
        const friendName = friendUser?.firstName && friendUser?.lastName 
          ? `${friendUser.firstName} ${friendUser.lastName}`
          : friendUser?.firstName 
          ? friendUser.firstName
          : friendUser?.username || friendUser?.email || 'user';
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: `Request sent to ${friendName}`, type: 'success' } }));
      } catch {}
    } catch (e) {
      console.error('Failed to send friend request:', e);
      try {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: e.message || 'Failed to send friend request', type: 'error' } }));
      } catch {}
    } finally {
      setAddingFriend((prev) => {
        const updated = { ...prev };
        delete updated[friendId];
        return updated;
      });
    }
  };

  const handleSendRequest = () => {
    if (searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="w-full lg:w-90 bg-white h-full lg:h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0 relative lg:rounded-xl p-4 lg:border lg:border-gray-500">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3 lg:top-4 right-3 lg:right-4 w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full transition-colors z-10"
        title="Close"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3">ADD FRIENDS</h3>

        <div className="mb-4 mt-6">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">Add friends now</h4>
          <p className="text-xs text-gray-600 mb-3">
            Your next adventure begins with a click Meet, chat, and make lasting connections.
          </p>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter username or email"
                className="w-full px-3 pr-24 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendRequest}
                disabled={searchLoading || searchQuery.trim().length < 2}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchLoading && (
          <div className="text-gray-600 text-sm text-center py-4">Searching...</div>
        )}
        {searchError && (
          <div className="text-red-600 text-sm text-center py-4">{searchError}</div>
        )}

        {!searchLoading && !searchError && searchQuery.trim().length >= 2 && (
          <div className="space-y-3 mb-4">
            {searchResults.length > 0 ? (
              searchResults.map((user, idx) => {
                // Format name using firstName and lastName if available
                let displayName = 'Unknown User';
                if (user.firstName && user.lastName) {
                  displayName = `${user.firstName} ${user.lastName}`;
                } else if (user.firstName) {
                  displayName = user.firstName;
                } else if (user.username) {
                  displayName = user.username;
                } else if (user.name) {
                  displayName = user.name;
                } else if (user.email) {
                  displayName = user.email.split('@')[0];
                }
                const email = user.email || '';
                const avatarUrl = user.avatarUrl || user.avatar || '/avatars/avatar-1.png';
                return (
                  <div key={user.userId || user.id || email || idx} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={displayName} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { 
                              e.target.style.display = 'none'; 
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }} 
                          />
                        ) : null}
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold hidden">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 text-sm font-medium truncate">{displayName}</div>
                        {email && (
                          <div className="text-xs text-gray-600 mt-0.5 truncate">{email}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user)}
                      disabled={addingFriend[user?.userId || user?.id] || requested[user?.userId || user?.id]}
                      className={`px-3 py-1.5 text-white text-xs font-medium rounded-md transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${requested[user?.userId || user?.id] ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {addingFriend[user?.userId || user?.id]
                        ? 'Sending...'
                        : requested[user?.userId || user?.id]
                          ? 'Requested'
                          : 'Add Friend'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-600 text-sm text-center py-4">
                No users found
              </div>
            )}
          </div>
        )}

        {/* Empty State - Only show when no search query */}
        {searchQuery.trim().length < 2 && (
          <>
            <div className="flex justify-center mb-3">
              <img
                src="/friends-empty.png"
                alt="No friends yet illustration"
                className="max-w-full w-40 h-auto"
              />
            </div>

            <p className="text-xs text-gray-600 text-center">
              No friends yet. Start connecting with people who share your interests.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardRightSidebar;


