import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import { getAllLocalGroups } from '../../../shared/services/API';
import { selectShowInbox, setShowInbox } from '../../../shared/store/slices/uiSlice';
import CommunityLeftPanel from '../components/community/CommunityLeftPanel';
import CommunityCenterPanel from '../components/community/CommunityCenterPanel';
import CommunityRightPanel from '../components/community/CommunityRightPanel';
import InboxModal from '../components/InboxModal';

const LocalGroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const [localGroup, setLocalGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showCenterPanel, setShowCenterPanel] = useState(false);
  const showInbox = useSelector(selectShowInbox);

  useEffect(() => {
    const fetchLocalGroup = async () => {
      setLoading(true);
      setError('');
      
      const storedEmail = JSON.parse(sessionStorage.getItem('userData') || '{}')?.email || '';
      const userEmail = user?.email || storedEmail;
      
      if (!userEmail) {
        setError('User email not found');
        setLoading(false);
        return;
      }
      
      try {
        const res = await getAllLocalGroups(userEmail);
        const list = res?.data?.groups || res?.groups || res?.data || res?.rooms || [];

        const found = list.find(
          (g) => 
            String(g.id) === String(id) || 
            String(g.groupId) === String(id) || 
            String(g.roomId) === String(id) ||
            g.id === Number(id) ||
            g.groupId === Number(id) ||
            g.roomId === Number(id)
        );
        if (found) {
          setLocalGroup(found);
        } else {
          console.log('Looking for ID:', id);
          console.log('Available local groups:', list.map(g => ({ id: g.id, groupId: g.groupId, roomId: g.roomId })));
          setError('Local-Group not found');
        }
      } catch (e) {
        setError(e.message || 'Failed to load local-group');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocalGroup();
    }
  }, [id, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const handleChannelSelect = () => {
      setShowCenterPanel(true);
    };
    window.addEventListener('community:channel-selected', handleChannelSelect);
    return () => {
      window.removeEventListener('community:channel-selected', handleChannelSelect);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#E6E6E6] md:bg-gray-100">
        {/* Top Navbar skeleton */}
        <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-xl">
          <div className="w-7 h-7 bg-gray-300 rounded mr-2 animate-pulse" />
          <div className="flex-1" />
          <div className="w-24 h-6 bg-gray-300 rounded animate-pulse" />
        </div>

        {/* Main 3-column skeleton layout */}
        <div className="flex flex-1 gap-2 p-2">
          {/* Left container */}
          <div className="flex border border-gray-500 rounded-xl overflow-hidden w-[calc(20rem)] max-w-full">
            {/* Narrow left bar */}
            <div className="w-16 bg-white flex flex-col items-center py-4 space-y-4">
              <div className="w-10 h-10 bg-gray-300 rounded-md animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
              <div className="flex-1" />
              <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
            </div>
            {/* Panel */}
            <div className="w-80 bg-gray-200 h-full p-4 space-y-4">
              <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Center panel */}
          <div className="flex-1 bg-white rounded-xl border border-gray-500 p-4 space-y-3">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="hidden lg:block w-90 bg-white rounded-xl border border-gray-500 p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !localGroup) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#E6E6E6] md:bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Local-Group not found'}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-x-hidden bg-[#E6E6E6] md:bg-gray-100">
      {/* Top Navbar */}
      <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-xl">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Local-Group</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => dispatch(setShowInbox(true))}
            title='Inbox'
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-300 rounded-md transition-colors">
            <img src="/avatars/inbox.png" alt="Inbox" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 gap-2 p-2 md:p-2 relative min-h-0 overflow-hidden">
        {/* Narrow Left Sidebar + Left Panel Group (no gap between them) */}
        <div className={`flex border border-gray-500 rounded-xl h-full ${showCenterPanel ? 'hidden md:flex' : 'flex'}`}>
          {/* Narrow Left Sidebar */}
          <div className="w-16 bg-white flex flex-col items-center py-4 space-y-4 rounded-l-xl h-full">
            {/* Profile Picture */}
            <button 
              onClick={() => navigate('/dashboard/settings')}
              title='Profile Settings'
              className="w-10 h-10 rounded-md bg-gray-300 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
              {(() => {
                const sessionUser = JSON.parse(sessionStorage.getItem('userData') || '{}');
                const avatarUrl = user?.avatarUrl || sessionUser?.avatarUrl;
                const displayName = user?.username || sessionUser?.username || 'U';
                return avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">
                    {String(displayName).charAt(0).toUpperCase()}
                  </span>
                );
              })()}
            </button>

            {/* Plus Icon */}
            <button
              onClick={() => navigate('/dashboard')}
              title='Create Community' 
              className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
              <img src="/avatars/plus.png" alt="Add" className="w-8 h-8" />
            </button>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Settings Icon */}
            <button 
              title='Settings'
              onClick={() => navigate('/dashboard/settings')}
              className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <img src="/avatars/setting.png" alt="Settings" className="w-5 h-5" />
            </button>

            {/* Logout Icon */}
            <button 
              title='Logout'
              onClick={handleLogout}
              className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5 hover:text-black text-bg-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Local-Group Left Panel */}
          <CommunityLeftPanel community={localGroup} onBack={handleBack} isLocalGroup={true} />
        </div>
        <>
          {showCenterPanel && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setShowCenterPanel(false)}
              />
              <div className="fixed inset-0 z-40 md:hidden">
                <CommunityCenterPanel 
                  community={localGroup} 
                  onToggleRightPanel={() => setShowRightPanel(true)}
                  onBack={() => setShowCenterPanel(false)}
                />
              </div>
            </>
          )}
          {/* Desktop: Always show center panel */}
          <div className="hidden md:block md:flex-1">
            <CommunityCenterPanel 
              community={localGroup} 
              onToggleRightPanel={() => setShowRightPanel(true)}
            />
          </div>
        </>

        {/* Local-Group Right Panel - Desktop only */}
        <div className="hidden md:block">
          <CommunityRightPanel 
            community={localGroup} 
            isLocalGroup={true}
            onClose={showRightPanel ? () => setShowRightPanel(false) : null}
          />
        </div>
      </div>
      <InboxModal isOpen={showInbox} onClose={() => dispatch(setShowInbox(false))} />
    </div>
  );
};

export default LocalGroupPage;

