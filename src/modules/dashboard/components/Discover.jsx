import React, { useEffect, useRef, useState } from 'react';
import { authenticatedFetch, BASE_URL, searchCommunities } from '../../../shared/services/API';
import JoinCommunityModal from './JoinCommunityModal';

const CommunityCard = ({ community, onClick }) => {
  const title = community.name || 'Untitled';
  const desc = community.description || '';
  const bannerImg = community.bannerUrl || '';
  const profileImg = community.imageUrl || community.imageURL || '';
  const members = community.totalMembers || community.members || 0;
  const online = community.onlineMembers || community.online || 0;
  const [bannerError, setBannerError] = useState(false);
  const [profileError, setProfileError] = useState(false);

  const safeUrl = (rawUrl) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    return `${BASE_URL}${rawUrl}`;
  };

  return (
    <div
      key={community.id || community.communityId || title}
      onClick={() => onClick?.(community)}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow transform transition-transform hover:scale-[1.02] bg-transparent cursor-pointer"
    >
      {/* Top banner area */}
      <div className="h-40 sm:h-44 bg-gray-200">
        {bannerImg && !bannerError ? (
          <img 
            src={safeUrl(bannerImg)} 
            alt={title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setBannerError(true)}
          />
        ) : null}
      </div>
      {/* Bottom dark card */}
      <div className="bg-[#282828] text-white px-4 py-4 min-h-[170px] relative">
        {/* Profile image above community name */}
        
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-400 border-2 border-[#282828] flex-shrink-0">
            {profileImg && !profileError ? (
              <img
                src={safeUrl(profileImg)}
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setProfileError(true)}
              />
            ) : (
              <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
                <div className="text-xl font-bold text-gray-800">
                  {title.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2 pt-2">
          <div></div>
          <div>
            <div>members: {members}</div>
            <div className="text-green-400">• {online} Online</div>
          </div>
        </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-8">{desc}</p>
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm bg-transparent">
      <div className="h-40 sm:h-44 bg-gray-200 animate-pulse" />
      <div className="bg-[#282828] px-4 py-4 min-h-[170px]">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-400 border-2 border-[#282828] animate-pulse" />
          <div className="text-sm text-gray-300 mb-2 pt-2">
            <div className="h-4 w-20 bg-gray-500/50 rounded mb-1 animate-pulse" />
            <div className="h-3 w-24 bg-green-500/40 rounded animate-pulse" />
          </div>
        </div>
        <div className="mt-3">
          <div className="h-6 w-40 bg-gray-500/60 rounded mb-2 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-500/40 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-gray-500/30 rounded animate-pulse" />
            <div className="h-3 w-4/6 bg-gray-500/30 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const debounceRef = useRef(null);

  const fetchCommunities = async (page = 0, size = 30) => {
    setLoading(true);
    setError('');
    try {
      const url = `${BASE_URL}community/discover?page=${page}&size=${size}`;
      const res = await authenticatedFetch(url, { method: 'GET' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
      const list = data?.data?.communities || data?.communities || data?.data || [];
      setCommunities(list);
    } catch (e) {
      setError(e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities(0, 20);
  }, []);

  // Remote search when 3+ characters
  useEffect(() => {
    const query = searchQuery.trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.length < 3) {
      setSearchResults([]);
      setSearching(false);
      setSearchError('');
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const userDataRaw = sessionStorage.getItem('userData');
        const userEmail = userDataRaw ? (JSON.parse(userDataRaw)?.email || JSON.parse(userDataRaw)?.userEmail) : undefined;
        const res = await searchCommunities({ query, requesterEmail: userEmail, page: 0, size: 20 });
        const list = res?.data?.communities || res?.communities || res?.data || [];
        setSearchResults(Array.isArray(list) ? list : []);
      } catch (e) {
        setSearchError(e.message || 'Search failed');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community);
    setShowJoinModal(true);
  };

  const handleCloseModal = () => {
    setShowJoinModal(false);
    setSelectedCommunity(null);
  };

  return (
    <div className="flex-1 bg-gray-100 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
      {/* Header row with pill and search */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 flex-wrap">
        <span className="px-3 py-3 rounded-full bg-[#282828] text-white text-md font-semibold">Community</span>
        <div className="flex-1" />
        <div className="w-full sm:w-[360px]">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Loading and error states */}
        {(searching || (!searching && loading)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl ">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        )}
        {searchError && <div className="text-red-600">{searchError}</div>}
        {!searching && error && <div className="text-red-600">{error}</div>}

        {/* Results grid */}
        {!searching && !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl ">
            {(searchQuery.trim().length >= 3 ? searchResults : communities).map((community) => (
              <CommunityCard 
                key={community.id || community.communityId || community.name}
                community={community}
                onClick={handleCommunityClick}
              />
            ))}
            {searchQuery.trim().length >= 3 && !searching && searchResults.length === 0 && (
              <div className="text-gray-600">No communities found.</div>
            )}
          </div>
        )}
      </div>

      {/* Join Community Modal */}
      <JoinCommunityModal
        isOpen={showJoinModal}
        onClose={handleCloseModal}
        community={selectedCommunity}
      />
    </div>
  );
};

export default Discover;

