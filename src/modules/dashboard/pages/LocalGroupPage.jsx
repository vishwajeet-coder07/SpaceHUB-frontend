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
  const showInbox = useSelector(selectShowInbox);

  useEffect(() => {
    const fetchLocalGroup = async () => {
      setLoading(true);
      setError('');
      
      // Get user email from context or sessionStorage
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
        // Convert id to string for comparison, and also check if API returns numbers
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

  if (loading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error || !localGroup) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="h-screen bg-gray-100 flex flex-col overflow-x-hidden">
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
          <button 
            title='Settings'
            className="w-7 h-7 flex items-center justify-center">
            <img src="/avatars/setting.png" alt="Settings" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 gap-2 p-2">
        {/* Narrow Left Sidebar + Left Panel Group (no gap between them) */}
        <div className="flex">
          {/* Narrow Left Sidebar */}
          <div className="w-16 bg-white border-r border-gray-500 flex flex-col items-center py-4 space-y-4 rounded-l-xl">
            {/* Profile Picture */}
            <div 
              title='profile'
              className="w-10 h-10 rounded-md bg-gray-300 flex items-center justify-center overflow-hidden">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Plus Icon */}
            <button
              onClick={() => navigate('/dashboard')}
              title='Create Community' 
              className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
              <img src="/avatars/plus.png" alt="Add" className="w-8 h-8" />
            </button>

            {/* Spacer */}
            <div className="flex-1"></div>

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
          <CommunityLeftPanel community={localGroup} onBack={handleBack} />
        </div>

        {/* Local-Group Center Panel */}
        <CommunityCenterPanel community={localGroup} />

        {/* Local-Group Right Panel */}
        <CommunityRightPanel community={localGroup} />
      </div>
      <InboxModal isOpen={showInbox} onClose={() => dispatch(setShowInbox(false))} />
    </div>
  );
};

export default LocalGroupPage;

