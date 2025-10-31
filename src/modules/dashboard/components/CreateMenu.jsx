import React from 'react';

const CreateMenu = ({ onBack, onFriends, onClubs, onJoin }) => {
  return (
    <div className="relative w-full max-w-full sm:max-w-[750px] rounded-2xl overflow-hidden shadow-2xl min-h-[550px] sm:h-[680px] mx-auto">
      {/* Top panel */}
      <div className="bg-white px-2 py-2 sm:p-4 rounded-t-2xl">
        <div className="bg-[#282828] text-white px-2 py-3 sm:p-5 mt-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-semibold">Create</h2>
            <button onClick={onBack} className="text-white/90 hover:text-white text-base sm:text-lg">Back</button>
          </div>
          <div className="mt-3 sm:mt-4 flex flex-col gap-2 sm:space-y-4">
            <button onClick={onFriends} className="w-full bg-white text-gray-900 rounded-xl px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow transition text-base sm:text-lg">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 14c2.21 0 4 1.79 4 4v1H12v-1c0-2.21 1.79-4 4-4Z" fill="#111827"/>
                  <path d="M8 14c2.21 0 4 1.79 4 4v1H0v-1c0-2.21 1.79-4 4-4Z" fill="#111827"/>
                  <circle cx="16" cy="8" r="3" fill="#111827"/>
                  <circle cx="8" cy="8" r="3" fill="#111827"/>
                </svg>
              </span>
              <span className="font-semibold">For me and my Friends</span>
            </button>
            <button onClick={onClubs} className="w-full bg-white text-gray-900 rounded-xl px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow transition text-base sm:text-lg">
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15c2.76 0 5 2.24 5 5v1H7v-1c0-2.76 2.24-5 5-5Z" fill="#111827"/>
                  <circle cx="12" cy="8" r="3" fill="#111827"/>
                  <path d="M19 8h-2V6h-2V4h2V2h2v2h2v2h-2v2Z" fill="#111827"/>
                </svg>
              </span>
              <span className="font-semibold">For clubs and community</span>
            </button>
          </div>
        </div>
      </div>
      {/* Illustration placeholder area */}
      <div className="bg-white">
        <div className="h-36 sm:h-56 bg-white" />
      </div>
      {/* Bottom CTA responsive */}
      <div className="bg-white px-2 py-2 sm:p-5">
        <div className="rounded-t-2xl border border-black border-3 px-2 py-3 sm:p-6 flex flex-col items-center text-center shadow-2xl w-full">
          <p className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Have an invite link?</p>
          <button onClick={onJoin} className="w-full px-2 py-2 sm:px-5 sm:py-3 rounded-xl bg-indigo-600 text-white text-base sm:text-lg font-semibold hover:bg-indigo-700 transition">Join a group or a community</button>
        </div>
      </div>
    </div>
  );
};

export default CreateMenu;


