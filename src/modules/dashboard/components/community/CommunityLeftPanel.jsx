import React, { useMemo, useState } from 'react';

const Section = ({ title, items, open, onToggle, onAdd, emptyHint }) => {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm text-gray-700">
        <button onClick={onToggle} className="flex items-center gap-2">
          <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
          <span>{title}</span>
        </button>
        <button onClick={onAdd} className="text-gray-500 hover:text-gray-800" title="Create channel">+</button>
      </div>
      {open && (
        <div className="mt-2 pl-5 space-y-1">
          {items && items.length ? (
            items.map((c) => (
              <button key={c} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-800"># {c}</button>
            ))
          ) : (
            <p className="text-xs text-gray-500">{emptyHint}</p>
          )}
        </div>
      )}
    </div>
  );
};

const CommunityLeftPanel = ({ community, onBack }) => {
  const title = community?.name || 'Community';

  const initial = useMemo(() => ({
    announcements: community?.announcements || [],
    voiceRooms: community?.voiceRooms || [],
    chatRooms: community?.chatRooms || [],
  }), [community]);

  const [announcements, setAnnouncements] = useState(initial.announcements);
  const [voiceRooms, setVoiceRooms] = useState(initial.voiceRooms);
  const [chatRooms, setChatRooms] = useState(initial.chatRooms);

  const [openAnn, setOpenAnn] = useState(true);
  const [openVoice, setOpenVoice] = useState(true);
  const [openChat, setOpenChat] = useState(true);

  const handleAdd = (kind) => {
    const name = window.prompt(`Create ${kind} name`);
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (kind === 'announcement') {
      setAnnouncements((prev) => [...prev, clean]);
    } else if (kind === 'voice room') {
      setVoiceRooms((prev) => [...prev, clean]);
    } else if (kind === 'chat room') {
      setChatRooms((prev) => [...prev, clean]);
    }
    try {
      window.dispatchEvent(new CustomEvent('community:add-channel', { detail: { community, kind, name: clean } }));
    } catch {}
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-56px)] flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-300 flex-shrink-0">
            {community?.imageUrl && (
              <img src={community.imageUrl} alt={title} className="w-full h-full object-cover" />
            )}
          </div>
          <span className="font-semibold text-gray-800 truncate">{title}</span>
        </div>
        <button onClick={onBack} title="Back" className="text-gray-600 hover:text-gray-900">←</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <Section
          title="Announcement"
          items={announcements}
          open={openAnn}
          onToggle={() => setOpenAnn((v) => !v)}
          onAdd={() => handleAdd('announcement')}
          emptyHint="No announcements yet. Click + to create one."
        />
        <Section
          title="Voice rooms"
          items={voiceRooms}
          open={openVoice}
          onToggle={() => setOpenVoice((v) => !v)}
          onAdd={() => handleAdd('voice room')}
          emptyHint="No voice rooms yet. Click + to create one."
        />
        <Section
          title="Chat rooms"
          items={chatRooms}
          open={openChat}
          onToggle={() => setOpenChat((v) => !v)}
          onAdd={() => handleAdd('chat room')}
          emptyHint="No chat rooms yet. Click + to create one."
        />
      </div>

      <div className="px-3 py-2 border-t border-gray-200">
        <button onClick={onBack} className="w-full text-left text-sm text-gray-600 hover:text-gray-900">Back to Dashboard</button>
      </div>
    </div>
  );
};

export default CommunityLeftPanel;
