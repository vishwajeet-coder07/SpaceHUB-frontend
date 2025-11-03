import React from 'react';

const CommunityRightPanel = ({ community }) => {
  const members = Array.isArray(community?.onlineMembers) && community.onlineMembers.length
    ? community.onlineMembers
    : [
        {
          id: 'sample-1',
          name: 'Suryansh234#',
          avatar: '/avatars/avatar-1.png',
        },
      ];

  return (
    <div className="hidden lg:block w-90 bg-gray-200 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0 rounded-xl p-6 border border-gray-500">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Members
      </h3>

      <div className="space-y-4">
        {members.map((m) => (
          <div key={m.id || m.name} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
            <div className="text-gray-700 text-lg">{m.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityRightPanel;
