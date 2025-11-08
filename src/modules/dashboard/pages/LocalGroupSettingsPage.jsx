import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLocalGroupSettings } from '../../../shared/services/API';
import InboxModal from '../components/InboxModal';
import { selectShowInbox, setShowInbox } from '../../../shared/store/slices/uiSlice';

const LocalGroupSettingsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showInbox = useSelector(selectShowInbox);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  // Listen for openInbox event
  useEffect(() => {
    const handleOpenInbox = () => {
      dispatch(setShowInbox(true));
    };
    window.addEventListener('openInbox', handleOpenInbox);
    return () => {
      window.removeEventListener('openInbox', handleOpenInbox);
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await getLocalGroupSettings(id);
        const data = res?.data || res || {};
        setSettings(data);
      } catch (e) {
        setError(e.message || 'Failed to load local-group settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-lg px-6">
          <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-x-hidden">
      <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-xl">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-300" title="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Local-Group Settings</h1>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => dispatch(setShowInbox(true))}
            title='Inbox'
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-300 rounded-md transition-colors">
            <img src="/avatars/inbox.png" alt="Inbox" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-300 p-6">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Group ID</div>
              <div className="text-sm text-gray-800 break-all">{id}</div>
            </div>
            {settings?.name && (
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="text-sm text-gray-800">{settings.name}</div>
              </div>
            )}
            {settings?.description && (
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Description</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">{settings.description}</div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Raw settings</h3>
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-80">{JSON.stringify(settings, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Inbox Modal */}
      <InboxModal isOpen={showInbox} onClose={() => dispatch(setShowInbox(false))} />
    </div>
  );
};

export default LocalGroupSettingsPage;


