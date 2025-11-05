import React, { useEffect, useMemo, useRef, useState } from 'react';
const ChatRoom = ({
  title = '#general',
  currentUser = {},
  messages = [],
  onSend,
  onMessage,
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState([]); // [{file, url}]
  const [expandedMessageIds, setExpandedMessageIds] = useState({});

  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const emojis = useMemo(() => ['😊', '😂', '🎉', '🔥', '👍', '❤️'], []);

  const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const withUrls = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setAttachments((prev) => [...prev, ...withUrls]);
    e.target.value = '';
  };

  const onEmojiClick = (e) => {
    setMessage((prev) => prev + e);
    setShowEmoji(false);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  };

  const formatDateChip = (date) => {
    const d = new Date(date);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) return 'Today';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const shouldClampMessage = (text) => {
    if (!text) return false;
    const approxLineBreaks = (text.match(/\n/g) || []).length + 1;
    if (approxLineBreaks > 15) return true;
    return text.length > 900;
  };

  const toggleExpand = (id) => {
    setExpandedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed && attachments.length === 0) return;
    const selfAvatar = currentUser?.avatarUrl || '/avatars/avatar-1.png';
    const selfName = currentUser?.username || currentUser?.email || 'You';
    const newMsg = {
      id: `m-${Date.now()}`,
      author: selfName,
      email: currentUser?.email || 'me',
      text: trimmed,
      createdAt: new Date().toISOString(),
      avatar: selfAvatar,
      isSelf: true,
      images: attachments.map((a) => a.url),
    };
    setMessage('');
    try { attachments.forEach((a) => URL.revokeObjectURL(a.url)); } catch {}
    setAttachments([]);
    try {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    } catch {}
    onSend?.(newMsg);
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 min-w-0 bg-white h-[calc(100vh-56px)] flex flex-col rounded-xl border border-gray-500 overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-gray-500 flex items-center justify-between px-4">
        <div className="font-semibold text-gray-800 truncate">{title}</div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-3">
        {messages.length > 0 && (
          <>
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-xs">{formatDateChip(messages[0].createdAt)}</span>
            </div>
            {messages.map((m, idx) => {
              const prev = messages[idx - 1];
              const showDateChip = !!prev && formatDateChip(prev.createdAt) !== formatDateChip(m.createdAt);
              const isSelf = !!m.isSelf;
              return (
                <React.Fragment key={m.id}>
                  {showDateChip && (
                    <div className="flex justify-center mt-2">
                      <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-xs">{formatDateChip(m.createdAt)}</span>
                    </div>
                  )}
                  <div className={`${isSelf ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-200 border-gray-400'} border-l-8 rounded-md p-3 pl-3 flex gap-3 min-w-0`}>
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 self-start">
                      <img src={m.avatar || '/avatars/avatar-1.png'} alt={m.author} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <span className="font-semibold text-gray-900 truncate">{m.author}</span>
                        <span className="text-gray-500 flex-shrink-0">{formatTime(m.createdAt)}</span>
                      </div>
                      {(() => {
                        const expanded = !!expandedMessageIds[m.id];
                        const clamp = shouldClampMessage(m.text) && !expanded;
                        return (
                          <>
                            <div
                              className={`whitespace-pre-wrap break-words break-all text-gray-900 ${clamp ? 'line-clamp-15' : ''}`}
                              style={clamp ? { display: '-webkit-box', WebkitLineClamp: 15, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}
                            >
                              {m.text}
                            </div>
                            {shouldClampMessage(m.text) && (
                              <button
                                onClick={() => toggleExpand(m.id)}
                                className="mt-2 text-sm text-indigo-700 hover:text-indigo-900 font-medium"
                              >
                                {expanded ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </>
                        );
                      })()}
                      {Array.isArray(m.images) && m.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {m.images.map((img, i) => (
                            <div key={i} className="rounded-md overflow-hidden bg-black/5 border border-gray-300 w-[min(360px,100%)]">
                              <img src={img} alt="attachment" className="w-full h-auto object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>

      {/* Composer */}
      <div className="px-4 py-3">
        <div className={`relative bg-[#282828] text-white rounded-xl px-4 ${attachments.length > 0 ? 'py-3' : 'h-12'} flex flex-col gap-2`}>
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {attachments.map((a, idx) => (
                <div key={idx} className="relative rounded-md overflow-hidden bg-black/20 border border-gray-600">
                  <img src={a.url} alt="preview" className="w-full h-20 object-cover" />
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center mt-2 gap-3">
            <button onClick={() => setShowEmoji((v) => !v)} className="text-xl" title="Emoji">😊</button>
            <span>📊</span>
            <button onClick={onPickFiles} className="text-xl" title="Share files">🗃️</button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesSelected} />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={title}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
              ref={messageInputRef}
            />
            <button onClick={handleSend} className="ml-auto bg-gray-100 text-gray-900 rounded-md px-3 py-1">➤</button>
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
    </div>
  );
};

export default ChatRoom;

