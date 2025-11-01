import React from 'react';

const DashboardLeftSidebar = ({ selectedView, setSelectedView }) => {
  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
      <div className="space-y-2 mb-6">
        <button
          onClick={() => setSelectedView('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            selectedView === 'dashboard'
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
            onClick={() => setSelectedView('discover')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              selectedView === 'discover'
                ? 'bg-[#282828] text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Discover</span>
          </button>

          <div className="flex items-center justify-between px-4 py-3 text-gray-700">
            <span className="font-medium">Direct message</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLeftSidebar;
