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
    <div className="hidden lg:block w-100 bg-white border-l border-gray-200 p-6 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Online member</h3>

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
