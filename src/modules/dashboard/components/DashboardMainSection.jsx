import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getAllCommunities, getAllLocalGroups, BASE_URL } from '../../../shared/services/API';
import CommunityCenterPanel from './community/CommunityCenterPanel';

const DashboardMainSection = () => {
  const [activeTab, setActiveTab] = useState('Community');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [communities, setCommunities] = useState([]);
  const [localGroups, setLocalGroups] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const safeUrl = (rawUrl) => {
    if (!rawUrl) return '';
    // If it's already a complete URL (pre-signed S3 URL), use it as-is
    // Pre-signed URLs are signature-sensitive and should not be encoded
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      console.log('rawUrl', rawUrl);
      return rawUrl;
    }
    // For relative URLs, construct absolute URL and encode only if needed
    const absolute = `${BASE_URL}${rawUrl}`;
    try { return encodeURI(absolute); } catch { return absolute; }
  };

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllCommunities();
      const list = res?.data?.communities || res?.communities || res?.data || [];
      setCommunities(list);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocalGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllLocalGroups();
      const list = res?.data?.groups || res?.groups || res?.data || res?.rooms || [];
      setLocalGroups(list);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

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
  
  }, []);

  // Refresh data when returning from viewing (to get fresh pre-signed URLs)
  useEffect(() => {
    const handleCommunityExit = () => {
      // Refresh data to get fresh pre-signed URLs (they expire after 1 hour)
      if (activeTab === 'Community') {
        fetchCommunities();
      } else if (activeTab === 'Local-Groups') {
        fetchLocalGroups();
      }
    };
    
    window.addEventListener('community:exit', handleCommunityExit);
    return () => {
      window.removeEventListener('community:exit', handleCommunityExit);
    };
  }, [activeTab, fetchCommunities, fetchLocalGroups]);

  const ListCard = ({ item, onSelect }) => {
    const rawUrl = item.imageUrl || item.bannerUrl || item.imageURL || '';
    const title = item.name || 'Untitled';
    const description = item.description || '';
    const imgSrc = safeUrl(rawUrl);
    const members = item.totalMembers || item.members || 0;
    const online = item.onlineMembers || item.online || 0;
    const [imageError, setImageError] = useState(false);
    
    // Reset image error when URL changes (fresh data from API)
    useEffect(() => {
      setImageError(false);
    }, [imgSrc]);

    return (
      <button onClick={() => onSelect(item)} className="text-left w-full">
        <div className="flex items-stretch rounded-l-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full">
          {/* Left Section - Icon */}
          <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-l-xl overflow-hidden bg-yellow-400 flex-shrink-0">
            {imgSrc && !imageError ? (
              <img 
                src={imgSrc} 
                alt={title} 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-yellow-400 flex items-center justify-center">
                <div className="text-4xl font-bold text-gray-800">
                  {title.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Section - Content */}
          <div className="flex-1 min-w-0 bg-[#282828] text-white rounded-r-xl p-4 relative">
            {/* Member Status - Top Right */}
            <div className="absolute top-4 right-4 text-right text-sm">
              <div className="text-gray-300">members: {members}</div>
              <div className="text-green-400">• {online} Online</div>
            </div>
            
            {/* Title and Description */}
            <div className="pr-24 sm:pr-32">
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{description}</p>
            </div>
          </div>
        </div>
      </button>
    );
  };

  const handleSelectCommunity = (item) => {
    setSelectedCommunity(item);
    window.dispatchEvent(new CustomEvent('community:view', { detail: item }));
  };

  const onBackFromCommunity = () => {
    setSelectedCommunity(null);
    // Refresh data when returning to get fresh pre-signed URLs (they expire after 1 hour)
    if (activeTab === 'Community') {
      fetchCommunities();
    } else if (activeTab === 'Local-Groups') {
      fetchLocalGroups();
    }
    window.dispatchEvent(new Event('community:exit'));
  };

  const renderList = (items, emptyTitle, emptySub) => {
    if (loading) return <div className="text-gray-700">Loading...</div>;
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

  if (selectedCommunity) {
    return (
      <CommunityCenterPanel community={selectedCommunity} onBack={onBackFromCommunity} />
    );
  }

  return (
    <div className="flex-1 bg-gray-100 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('Community')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'Community'
                ? 'bg-[#282828] text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('Local-Groups')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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


