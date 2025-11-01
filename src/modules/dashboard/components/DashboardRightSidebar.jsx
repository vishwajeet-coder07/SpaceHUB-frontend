import React from 'react';

const DashboardRightSidebar = () => {
  return (
    <div className="hidden lg:block w-100 bg-white border-l border-gray-200 p-6 h-[calc(100vh-56px)] overflow-y-hidden flex-shrink-0">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">FRIENDS</h3>

        <div className="mb-6">
          <h4 className="font-bold text-gray-800 mb-2">Add friends now</h4>
          <p className="text-sm text-gray-600 mb-4">
            Your next adventure begins with a click Meet, chat, and make lasting connections.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Send request
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <img
            src="/friends-empty.png"
            alt="No friends yet illustration"
            className="max-w-full w-56 sm:w-64 h-auto"
          />
        </div>

        <p className="text-sm text-gray-600 text-center">
          No friends yet. Start connecting with people who share your interests.
        </p>
      </div>
    </div>
  );
};

export default DashboardRightSidebar;


