import React, { useEffect, useState } from 'react';
import { getAllCommunities, BASE_URL } from '../../../shared/services/API';

const DashboardMainSection = () => {
  const [activeTab, setActiveTab] = useState('Community');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    if (activeTab !== 'Community') return;
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAllCommunities();
        const list = res?.data?.communities || [];
        if (isMounted) setCommunities(list);
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load communities');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [activeTab]);

  const safeUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const absolute = rawUrl.startsWith('http') ? rawUrl : `${BASE_URL}${rawUrl}`;
    try {
      // encodeURI will encode spaces and unicode but preserve existing % encodings
      return encodeURI(absolute);
    } catch {
      return absolute;
    }
  };

  const CommunityCard = ({ community }) => {
    const rawUrl = community.imageUrl || community.imageURL || community.presignedUrl || community.image || '';
    const title = community.name || 'Untitled';
    const description = community.description || '';
    const imgSrc = safeUrl(rawUrl);

    return (
      <div className="flex items-stretch gap-4 bg-gray-900 text-white rounded-xl p-3 sm:p-4 shadow w-full">
        <div className="w-28 sm:w-36 h-20 sm:h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {imgSrc ? (
            <img src={imgSrc} alt={title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold truncate">{title}</h3>
          <p className="text-gray-300 text-sm sm:text-base line-clamp-2">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-end justify-center text-sm sm:text-base whitespace-nowrap">
          <div className="text-gray-200">members: 0</div>
          <div className="text-green-400 mt-1">• 0 Online</div>
        </div>
      </div>
    );
  };

  const renderCommunity = () => {
    if (loading) return <div className="text-gray-700">Loading communities...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!communities.length) {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No community joined</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            You haven't joined any communities yet. Explore and connect with others who share your interests — your next great conversation might be waiting!
          </p>
        </div>
      );
    }
    return (
      <div className="w-full flex flex-col gap-3 overflow-y-auto">
        {communities.map((c) => (
          <CommunityCard key={c.communityId || c.id || c.name} community={c} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-100 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('Community')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'Community'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => setActiveTab('Group')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'Group'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Group
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {activeTab === 'Community' ? renderCommunity() : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Groups yet</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              You haven’t joined any groups yet. Explore and connect with others who share your interests
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMainSection;


