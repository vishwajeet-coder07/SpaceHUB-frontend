import React, { useEffect, useState } from 'react';

const TopToast = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // info | success | error

  useEffect(() => {
    const handler = (e) => {
      const detail = e.detail || {};
      setMessage(detail.message || '');
      setType(detail.type || 'info');
      setVisible(true);
      window.clearTimeout(window.__top_toast_timer);
      window.__top_toast_timer = window.setTimeout(() => setVisible(false), 3000);
    };
    window.addEventListener('toast', handler);
    return () => {
      window.removeEventListener('toast', handler);
      window.clearTimeout(window.__top_toast_timer);
    };
  }, []);

  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800';

  return (
    <div className={`fixed top-0 left-0 right-0 pointer-events-none z-[1000] flex justify-center transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`mt-4 px-4 py-2 rounded-md text-white shadow-lg pointer-events-auto ${bg}`}>
        {message}
      </div>
    </div>
  );
};

export default TopToast;


