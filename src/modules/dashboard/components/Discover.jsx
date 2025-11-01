import React, { useEffect, useState } from 'react';
import { authenticatedFetch, BASE_URL } from '../../../shared/services/API';
import JoinCommunityModal from './JoinCommunityModal';

const CommunityCard = ({ community, onClick }) => {
  const title = community.name || 'Untitled';
  const desc = community.description || '';
  const img = community.bannerUrl || community.imageUrl || community.imageURL || '';
  const members = community.totalMembers || community.members || 0;
  const online = community.onlineMembers || community.online || 0;
  const [imageError, setImageError] = useState(false);

  return (
    <div
      key={community.id || community.communityId || title}
      onClick={() => onClick?.(community)}
      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-transparent cursor-pointer"
    >
      {/* Top image area */}
      <div className="h-40 sm:h-44 bg-gray-200">
        {img && !imageError ? (
          <img 
            src={img} 
            alt={title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : null}
      </div>
      {/* Bottom dark card */}
      <div className="bg-[#282828] text-white px-4 py-4 min-h-[170px]">
        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
          <div className='w-12 h-12 bg-gray-300 rounded-sm'> </div>
          <div>
            <div>members: 0</div>
            <div className="text-green-400">• 0 Online</div>
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

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchCommunities = async (page = 0, size = 20) => {
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

  const filtered = communities.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  });

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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 sm:p-6">
        {loading && <div className="text-gray-700">Loading communities...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filtered.map((community) => (
              <CommunityCard 
                key={community.id || community.communityId || community.name} 
                community={community}
                onClick={handleCommunityClick}
              />
            ))}
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

