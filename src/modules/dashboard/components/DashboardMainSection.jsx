import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCommunities, getAllLocalGroups, BASE_URL } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';

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
import {
  selectCommunities,
  selectLocalGroups,
  selectActiveTab,
  selectDashboardLoading,
  selectDashboardError,
  setCommunities,
  setLocalGroups,
  setActiveTab,
  setLoading,
  setError,
} from '../../../shared/store/slices/dashboardSlice';

const DashboardMainSection = ({ selectedFriend, onOpenAddFriends, showRightSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  const activeTab = useSelector(selectActiveTab);
  const loading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const communities = useSelector(selectCommunities);
  const localGroups = useSelector(selectLocalGroups);


  const safeUrl = (rawUrl) => {
    if (!rawUrl) return '';

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      console.log('rawUrl', rawUrl);
      return rawUrl;
    }
    const absolute = `${BASE_URL}${rawUrl}`;
    try { return encodeURI(absolute); } catch { return absolute; }
  };

  const fetchCommunities = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(''));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;
    
    if (!userEmail) {
      dispatch(setError('User email not found'));
      dispatch(setLoading(false));
      return;
    }
    
    try {
      const res = await getMyCommunities(userEmail);
      const list = res?.data?.communities || res?.communities || res?.data || [];
      dispatch(setCommunities(list));
    } catch (e) {
      dispatch(setError(e.message || 'Failed to load'));
    }
  }, [user, dispatch]);

  const fetchLocalGroups = useCallback(async () => {
    dispatch(setLoading(true));
    dispatch(setError(''));
    
    const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
    const userEmail = user?.email || storedEmail;
    
    if (!userEmail) {
      dispatch(setError('User email not found'));
      dispatch(setLoading(false));
      return;
    }
    
    try {
      const res = await getAllLocalGroups(userEmail);
      const list = res?.data?.groups || res?.groups || res?.data || res?.rooms || [];
      dispatch(setLocalGroups(list));
    } catch (e) {
      dispatch(setError(e.message || 'Failed to load'));
    }
  }, [user, dispatch]);

  const hasLoadedRef = useRef({ community: false, localGroups: false });

  useEffect(() => {
    if (activeTab === 'Community') {
     
      fetchCommunities();
      hasLoadedRef.current.community = true;
    } else {
     
      fetchLocalGroups();
      hasLoadedRef.current.localGroups = true;
    }
  }, [activeTab, fetchCommunities, fetchLocalGroups]);

  useEffect(() => {
    const onRefreshCommunities = () => fetchCommunities();
    const onRefreshLocalGroups = () => fetchLocalGroups();
    window.addEventListener('refresh:communities', onRefreshCommunities);
    window.addEventListener('refresh:local-groups', onRefreshLocalGroups);
    return () => {
      window.removeEventListener('refresh:communities', onRefreshCommunities);
      window.removeEventListener('refresh:local-groups', onRefreshLocalGroups);
    };
  
  }, [fetchCommunities, fetchLocalGroups]);


  const ListCard = ({ item, onSelect }) => {
    const rawUrl = item.imageUrl || item.bannerUrl || item.imageURL || '';
    const title = item.name || 'Untitled';
    const description = item.description || '';
    const imgSrc = safeUrl(rawUrl);
    const members = item.totalMembers || item.members || 0;
    const online = item.onlineMembers || item.online || 0;
    const [imageError, setImageError] = useState(false);
    
    useEffect(() => {
      setImageError(false);
    }, [imgSrc]);

    return (
      <button onClick={() => onSelect(item)} className="text-left w-full">
        <div className="flex items-stretch rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow transform transition-transform hover:scale-[1.02] w-full">
          {/* Left Section - Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-l-xl overflow-hidden bg-zinc-400 flex-shrink-0">
            {imgSrc && !imageError ? (
              <img 
                src={imgSrc} 
                alt={title} 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
                <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                  {title.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Section - Content */}
          <div className="flex-1 min-w-0 bg-[#282828] text-white rounded-r-xl p-3 sm:p-4 relative">
            {/* Member Status - Top Right */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-right text-xs sm:text-sm">
              <div className="text-gray-300">members: {members || 0}</div>
              <div className="text-green-400">• {online || 0} Online</div>
            </div>
            
            {/* Title and Description */}
            <div className="pr-16 sm:pr-20 md:pr-24 lg:pr-32">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-1">{description}</p>
          </div>
          </div>
        </div>
      </button>
    );
  };

  const handleSelectCommunity = (item) => {
    const itemId = item.id || item.communityId || item.community_id || item.groupId || item.roomId;
    if (!itemId) {
      console.error('No ID found for item:', item);
      return;
    }
    // Ensure ID is converted to string for URL
    const idString = String(itemId);
    if (activeTab === 'Community') {
      navigate(`/dashboard/community/${idString}`);
    } else {
      navigate(`/dashboard/local-group/${idString}`);
    }
  };

  const renderList = (items, emptyTitle, emptySub) => {
    if (loading) {
      return (
        <div className="w-full flex flex-col gap-3 overflow-y-auto">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="w-full">
              <div className="flex items-stretch rounded-xl overflow-hidden w-full">
                {/* Left shimmer */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-zinc-300 animate-pulse rounded-l-xl" />
                {/* Right shimmer */}
                <div className="flex-1 min-w-0 bg-[#282828] rounded-r-xl p-3 sm:p-4 relative">
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-right">
                    <div className="h-3 w-20 bg-gray-500/40 rounded mb-1 animate-pulse" />
                    <div className="h-3 w-16 bg-green-500/40 rounded animate-pulse" />
                  </div>
                  <div className="pr-16 sm:pr-20 md:pr-24 lg:pr-32">
                    <div className="h-5 sm:h-6 w-40 bg-gray-500/60 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-5/6 bg-gray-500/40 rounded mb-1 animate-pulse" />
                    <div className="h-3 w-3/5 bg-gray-500/30 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (error) return <div className="text-red-600">{error}</div>;
    if (!items.length) {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{emptyTitle}</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">{emptySub}</p>
        </div>
      );
    }
    return (
      <div className="w-full flex flex-col gap-3 overflow-y-auto">
        {items.map((it) => (
          <ListCard 
            key={it.id || it.groupId || it.roomId || it.communityId || it.name} 
            item={it}
            onSelect={handleSelectCommunity}
          />
        ))}
      </div>
    );
  };


  if (selectedFriend) {
    const friendName = formatFriendName(selectedFriend);
    const friendAvatar = selectedFriend.avatar || selectedFriend.avatarUrl || selectedFriend.profileImage || '/avatars/avatar-1.png';

    return (
      <div className="flex-1 min-w-0 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
            <img 
              src={friendAvatar} 
              alt={friendName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-semibold hidden">
              {friendName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{friendName}</h3>
            <p className="text-xs text-gray-500">Direct Message</p>
          </div>
        </div>

        {/* Chat Messages Area - Static Placeholder */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Direct Messaging</h3>
            <p className="text-gray-500 max-w-md">
              hello
            </p>
          </div>
        </div>

        {/* Input Area - Disabled */}
        <div className="bg-gray-100 border-t border-gray-300 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed">
              hee
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-200 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-hidden rounded-xl border border-gray-500">
      <div className="bg-gray-200 border-b border-gray-500 px-4 sm:px-6 py-4 flex-shrink-0 rounded-t-xl">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => dispatch(setActiveTab('Community'))}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'Community'
                ? 'bg-[#282828] text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => dispatch(setActiveTab('Local-Groups'))}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'Local-Groups'
                ? 'bg-[#282828] text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Local-Groups
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'Community'
          ? renderList(
              communities,
              'No community joined',
              "You haven't joined any communities yet. Explore and connect with others who share your interests — your next great conversation might be waiting!"
            )
          : renderList(
              localGroups,
              'No Local-Groups yet',
              "You haven't joined any Local-Groups yet. Explore and connect with others who share your interests"
            )}
      </div>
    </div>
  );
};

export default DashboardMainSection;


