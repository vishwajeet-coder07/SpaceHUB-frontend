import React from 'react';

const DashboardRightSidebar = ({ onClose }) => {
  return (
    <div className="hidden lg:block w-90 bg-gray-200 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0 relative rounded-xl p-4 border border-gray-500">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
        title="Close"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3">ADD FRIENDS</h3>

        <div className="mb-4 mt-6">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">Add friends now</h4>
          <p className="text-xs text-gray-600 mb-3">
            Your next adventure begins with a click Meet, chat, and make lasting connections.
          </p>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter username"
                className="w-full px-3 pr-24 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Send request
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-3">
          <img
            src="/friends-empty.png"
            alt="No friends yet illustration"
            className="max-w-full w-40 h-auto"
          />
        </div>

        <p className="text-xs text-gray-600 text-center">
          No friends yet. Start connecting with people who share your interests.
        </p>
      </div>
    </div>
  );
};

export default DashboardRightSidebar;


