import React, { useState } from 'react';

const DashboardMainSection = () => {
  const [activeTab, setActiveTab] = useState('Community');

  return (
    <div className="flex-1 bg-gray-100 min-w-0 flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
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

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-hidden">
        <div className="text-center">
          {activeTab === 'Community' ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No community joined</h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                You haven't joined any communities yet. Explore and connect with others who share your interests — your next great conversation might be waiting!
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No Groups yet</h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                You haven’t joined any groups yet. Explore and connect with others who share your interests
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMainSection;


