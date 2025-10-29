import React, { useState } from 'react';

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data for community cards - will be replaced with API data
  const communityCards = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Community ${i + 1}`,
  }));

  return (
    <div className="flex-1 bg-gray-100 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Community Cards Grid */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {communityCards.map((community) => (
            <div
              key={community.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Top half - White */}
              <div className="h-32 bg-white"></div>
              {/* Bottom half - Black */}
              <div className="h-32 bg-black"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;

