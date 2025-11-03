import React, { useRef, useState } from 'react';

const CommunityCenterPanel = ({ community }) => {
  const channelName = '#general';
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);

    const emojis = ['😊', '😂', '🎉', '🔥', '👍', '❤️'];

    const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    try {
      window.dispatchEvent(new CustomEvent('community:share-files', { detail: { files, community } }));
    } catch (error) {
      // Event dispatch failed silently
    }
    e.target.value = '';
  };

  const onEmojiClick = (e) => {
    setMessage((prev) => prev + e);
    setShowEmoji(false);
  };

  return (
    <div className="flex-1 bg-gray-200 h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500">
      {/* Header */}
      <div className="h-12 border-b border-gray-500 flex items-center justify-between px-4">
        <div className="font-semibold text-gray-800 truncate">{channelName}</div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">👥</span>
        </div>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="bg-[#282828] text-white rounded-xl p-6 w-[min(90%,560px)] text-center">
          <h2 className="text-2xl font-bold">Welcome to</h2>
          <p className="mt-1 text-lg font-semibold">{channelName}</p>
          <div className="mt-6 space-y-3 text-gray-900">
            <button className="w-full bg-white rounded-md px-4 py-3 flex items-center justify-between">
              <span>Invite your friends</span>
              <span>›</span>
            </button>
            <button className="w-full bg-white rounded-md px-4 py-3 flex items-center justify-between">
              <span>Send hey to start the convo!</span>
              <span>›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 py-3">
        <div className="relative bg-[#282828] text-white rounded-xl px-4 h-12 flex items-center gap-3">
          {/* Emoji button */}
          <button onClick={() => setShowEmoji((v) => !v)} className="text-xl" title="Emoji">😊</button>
<span>📊</span>
          {/* File share */}
          <button onClick={onPickFiles} className="text-xl" title="Share files">🗃️</button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />

          {/* Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="#General"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
          />

          <button className="ml-auto bg-gray-100 text-gray-900 rounded-md px-3 py-1">➤</button>

          {/* Emoji popup */}
          {showEmoji && (
            <div className="absolute bottom-14 left-2 bg-white text-gray-900 rounded-lg shadow p-2 grid grid-cols-6 gap-2">
              {emojis.map((em) => (
                <button key={em} onClick={() => onEmojiClick(em)} className="text-xl hover:scale-110 transition-transform" title={em}>
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCenterPanel;
