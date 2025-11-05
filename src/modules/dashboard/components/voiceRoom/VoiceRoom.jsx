import React, { useMemo } from 'react';
const VoiceRoom = ({
  title = '# general',
  participants = [],
  localMuted = false,
  onToggleMute,
  onLeave,
}) => {
  const placeholderAvatar = '/avatars/avatar-1.png';

  const smallPageSize = 2;
  const largePageSize = 4;

  const pagesSm = useMemo(() => {
    const out = [];
    for (let i = 0; i < participants.length; i += smallPageSize) {
      out.push(participants.slice(i, i + smallPageSize));
    }
    return out.length ? out : [[]];
  }, [participants]);

  const pagesLg = useMemo(() => {
    const out = [];
    for (let i = 0; i < participants.length; i += largePageSize) {
      out.push(participants.slice(i, i + largePageSize));
    }
    return out.length ? out : [[]];
  }, [participants]);

  const Tile = ({ p }) => (
    <div className="bg-gray-200 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 h-64">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-300">
        <img
          src={p?.avatarUrl || placeholderAvatar}
          alt={p?.name || 'user'}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-3 text-gray-800 font-medium truncate max-w-[12rem]" title={p?.name || ''}>
        {p?.name || 'Member'}
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {p?.muted ? 'Muted' : p?.isSpeaking ? 'Speaking…' : 'Idle'}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500">
      {/* Header */}
      <div className="h-12 border-b border-gray-300 flex items-center gap-2 px-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
          <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5c-.55 0-1-.45-1-1V9c0-3.87 3.13-7 7-7s7 3.13 7 7v2c0 .55-.45 1-1 1h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
        </svg>
        <div className="font-semibold text-gray-800 truncate">{title}</div>
      </div>

      {/* Body: horizontally scrollable pages with snap */}
      <div className="flex-1 px-4 py-6">
        {/* Small screens (<= lg: hidden on lg) */}
        <div className="lg:hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {pagesSm.map((page, idx) => (
              <div key={idx} className="min-w-full snap-start">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {page.map((p) => (
                    <Tile key={p?.id || p?.email || Math.random()} p={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large screens (>= lg) - 4 tiles per page */}
        <div className="hidden lg:block">
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2">
            {pagesLg.map((page, idx) => (
              <div key={idx} className="min-w-full snap-start">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                  {page.map((p) => (
                    <Tile key={p?.id || p?.email || Math.random()} p={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-6">
        <div className="mx-auto w-[min(360px,90%)] bg-black/80 rounded-2xl flex items-center justify-center gap-6 py-3">
          <button
            onClick={onToggleMute}
            className={`w-28 h-12 rounded-lg flex items-center justify-center text-white transition-colors ${
              localMuted ? 'bg-gray-700' : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={localMuted ? 'Unmute' : 'Mute'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              {localMuted ? (
                <path d="M16.5 12c0-2.49-2.01-4.5-4.5-4.5v-3l-5 5h-3v6h3l5 5v-3c2.49 0 4.5-2.01 4.5-4.5zM19 12c0 3.87-3.13 7-7 7v3c5.52 0 10-4.48 10-10h-3zm-7-7v3c-3.87 0-7 3.13-7 7H2c0-5.52 4.48-10 10-10z" />
              ) : (
                <path d="M3 10v4h3l5 5V5L6 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06C17.39 6.64 20 9.91 20 13.5h-2c0-3.04-1.72-5.64-4-6.77z" />
              )}
            </svg>
          </button>
          <button
            onClick={onLeave}
            className="w-28 h-12 rounded-lg flex items-center justify-center text-white bg-red-600 hover:bg-red-700"
            title="Leave"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-4.97 0-9 2.69-9 6v3h6v-3H5.08c.74-1.77 3.52-3 6.92-3s6.18 1.23 6.92 3H15v3h6v-3c0-3.31-4.03-6-9-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRoom;

