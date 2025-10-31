import React, { useState } from 'react';

const CreateJoin = ({ onBack, onSend }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [touched, setTouched] = useState(false);

  const showError = touched && !inviteLink.trim();

  const onSendClick = () => {
    setTouched(true);
    if (!inviteLink.trim()) return;
    onSend?.(inviteLink);
  };

  return (
    <div className="relative w-full max-w-[750px] h-[680px] rounded-2xl overflow-hidden shadow-2xl mx-auto my-0">
      <div className="bg-white py-3 px-2 sm:px-5 h-full flex items-center justify-center">
        <div className="relative bg-[#282828] text-white h-[70%] w-full rounded-2xl flex flex-col p-3 sm:p-8">
          {/* Back button absolutely top left */}
          <button onClick={onBack} className="absolute top-4 left-4 text-white/90 hover:text-white text-base sm:text-lg">Back</button>
          {/* Centered main content */}
          <div className="flex-1 flex flex-col justify-center items-center mt-6">
            <h2 className="text-2xl sm:text-4xl font-semibold text-center">Join group or community</h2>
            <p className="mt-3 sm:mt-4 text-gray-300 text-base sm:text-lg text-center max-w-md sm:max-w-xl">Enter the invite link below to become part of the community.</p>
          </div>
          {/* Bottom input + button row */}
          <div className="w-full flex flex-col items-center mb-4 px-1 sm:px-4 ">
            <div className="bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 w-full max-w-2xl">
              <input
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Invite link"
                className="flex-1 text-gray-900 text-base sm:text-lg outline-none bg-transparent"
              />
              <button
                onClick={onSendClick}
                className={`px-3 py-2 sm:px-8 sm:py-3 rounded-xl font-semibold text-base sm:text-lg ${inviteLink.trim() ? 'bg-indigo-600 text-white' : 'bg-indigo-600/60 text-white/80 cursor-not-allowed'}`}
              >
                Send request
              </button>
            </div>
            {showError && (
              <p className="mt-2 text-sm text-red-400 w-full max-w-2xl">Invite link is required.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJoin;


