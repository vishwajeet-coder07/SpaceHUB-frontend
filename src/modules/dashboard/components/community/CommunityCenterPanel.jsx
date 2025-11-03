import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../shared/contexts/AuthContextContext';
import { getCommunityMembers } from '../../../../shared/services/API';

const CommunityCenterPanel = ({ community }) => {
  const channelName = '#general';
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const { user } = useAuth();

  const communityId = useMemo(() => community?.id || community?.communityId || community?.community_id, [community]);
  const storageKey = useMemo(() => (communityId ? `welcomeShown:community:${communityId}:channel:general` : ''), [communityId]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const emojis = ['😊', '😂', '🎉', '🔥', '👍', '❤️'];

    const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    try {
      window.dispatchEvent(new CustomEvent('community:share-files', { detail: { files, community } }));
    } catch (error) {
      console.error('Error dispatching share-files event:', error);
    }
    e.target.value = '';
  };

  const onEmojiClick = (e) => {
    setMessage((prev) => prev + e);
    setShowEmoji(false);
  };

  useEffect(() => {
    const checkAdminAndMaybeShow = async () => {
      if (!communityId || !user?.email) return;

      try {
        const seen = localStorage.getItem(storageKey);
        if (seen === '1') return;

        const data = await getCommunityMembers(communityId);

        const members = data?.data?.members || data?.members || [];
        const me = members.find((m) => (m.email || m.username) === user.email);
        const myRole = me?.role || '';

        if ((myRole || '').toUpperCase() === 'ADMIN') {
          setShowWelcomeModal(true);
        }
      } catch (e) {
        console.error('Failed to decide welcome modal visibility:', e);
      }
    };

    checkAdminAndMaybeShow();
  }, [communityId, user?.email, storageKey]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    try {
      if (storageKey) localStorage.setItem(storageKey, '1');
    } catch {}
  };

  const openInviteModal = () => {
    closeWelcomeModal();
    try {
      window.dispatchEvent(new Event('community:open-invite'));
    } catch (e) {
      console.error('Failed to open invite modal:', e);
    }
  };

  const startConversation = () => {
    closeWelcomeModal();
    setMessage('hey');
    try {
      requestAnimationFrame(() => messageInputRef.current?.focus());
    } catch {}
  };

  return (
    <div className="flex-1 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500">
      {/* Header */}
      <div className="h-12 border-b border-gray-500 flex items-center justify-between px-4">
        <div className="font-semibold text-gray-800 truncate">{channelName}</div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">👥</span>
        </div>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center">
     

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
            ref={messageInputRef}
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

      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-[#282828] text-white rounded-xl p-6 w-[min(90%,560px)] shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">Welcome</h3>
              <button onClick={closeWelcomeModal} className="text-white/80 hover:text-white" title="Close">✕</button>
            </div>
            <h2 className="text-2xl font-bold text-center">Welcome to</h2>
            <p className="mt-1 text-lg font-semibold text-center">{channelName}</p>
            <div className="mt-6 space-y-3 text-gray-900">
              <button onClick={openInviteModal} className="w-full bg-white rounded-md px-4 py-3 flex items-center justify-between">
                <span>Invite your friends</span>
                <span>›</span>
              </button>
              <button onClick={startConversation} className="w-full bg-white rounded-md px-4 py-3 flex items-center justify-between">
                <span>Send hey to start the convo!</span>
                <span>›</span>
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeWelcomeModal} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityCenterPanel;
