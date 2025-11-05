import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCommunities, getAllLocalGroups, BASE_URL } from '../../../shared/services/API';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
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
              <div className="text-gray-300">members: {members}</div>
              <div className="text-green-400">• {online} Online</div>
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

  // If a friend is selected, show chat interface
  if (selectedFriend) {
    const friendName = selectedFriend.username || selectedFriend.name || 'Unknown';
    const friendAvatar = selectedFriend.avatar;

    return (
      <div className="flex-1 bg-white min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-hidden rounded-xl">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {friendAvatar ? (
                <img src={friendAvatar} alt={friendName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-gray-600">
                  {friendName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{friendName}</h2>
          </div>
          {!showRightSidebar && (
            <button
              onClick={onOpenAddFriends}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
              title="Add Friends"
            >
              <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.306 11.025C12.0447 11.1007 12.7291 11.4478 13.2268 11.999C13.7244 12.5502 13.9999 13.2663 14 14.009C14 15.551 13.06 16.827 11.796 17.669C10.526 18.517 8.826 19.009 7 19.009C5.174 19.009 3.474 18.517 2.204 17.669C0.938 16.829 0 15.551 0 14.009C0 13.2133 0.31607 12.4502 0.87868 11.8876C1.44129 11.325 2.20435 11.009 3 11.009H11L11.306 11.025ZM19.006 11.009C19.8016 11.009 20.5647 11.325 21.1273 11.8876C21.6899 12.4502 22.006 13.2133 22.006 14.009C22.006 15.399 21.142 16.431 20.04 17.065C18.944 17.695 17.51 18.009 16.006 18.009C15.4993 18.0076 15.0053 17.9703 14.524 17.897C15.39 16.873 16.002 15.565 16.002 14.009C15.9997 12.9262 15.646 11.8734 14.994 11.009H19.006ZM7.004 0.000957934C7.6036 -0.0114072 8.19963 0.0960447 8.75716 0.317015C9.31469 0.537986 9.8225 0.868028 10.2508 1.2878C10.6791 1.70757 11.0194 2.20862 11.2515 2.76157C11.4837 3.31453 11.6032 3.90828 11.6029 4.508C11.6026 5.10772 11.4827 5.70136 11.25 6.25411C11.0173 6.80687 10.6767 7.30761 10.248 7.727C9.81927 8.14639 9.31117 8.47598 8.75344 8.69646C8.19571 8.91693 7.59958 9.02386 7 9.01096C5.82164 8.98613 4.69991 8.50059 3.87532 7.65844C3.05073 6.81629 2.58893 5.68458 2.58893 4.50596C2.58893 3.32733 3.05073 2.19562 3.87532 1.35348C4.69991 0.511328 5.82164 0.0257876 7 0.000957934M16.5 2.00296C16.9596 2.00296 17.4148 2.09349 17.8394 2.26938C18.264 2.44527 18.6499 2.70308 18.9749 3.02808C19.2999 3.35309 19.5577 3.73893 19.7336 4.16357C19.9095 4.58821 20 5.04333 20 5.50296C20 5.96258 19.9095 6.41771 19.7336 6.84235C19.5577 7.26699 19.2999 7.65283 18.9749 7.97783C18.6499 8.30284 18.264 8.56064 17.8394 8.73654C17.4148 8.91243 16.9596 9.00296 16.5 9.00296C15.5717 9.00296 14.6815 8.63421 14.0251 7.97783C13.3687 7.32145 13 6.43122 13 5.50296C13 4.5747 13.3687 3.68446 14.0251 3.02808C14.6815 2.37171 15.5717 2.00296 16.5 2.00296Z" fill="#282828"/>
              </svg>
            </button>
          )}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="text-center text-gray-500 text-sm">
            No messages yet. Start a conversation!
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="bg-gray-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="#general"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            readOnly
          />
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Default view: Communities and Local-Groups
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


