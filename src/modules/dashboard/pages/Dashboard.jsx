import React from 'react';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import {
  selectSelectedView,
  selectShowCreate,
  selectShowRightSidebar,
  selectSelectedFriend,
  selectShowInbox,
  setSelectedView,
  setShowCreate,
  setShowRightSidebar,
  setSelectedFriend,
  setShowInbox,
} from '../../../shared/store/slices/uiSlice';
import DashboardMainSection from '../components/DashboardMainSection';
import DashboardRightSidebar from '../components/DashboardRightSidebar';
import Discover from '../components/Discover';
import CreatePopup from '../components/CreatePopup';
import DashboardLeftSidebar from '../components/DashboardLeftSidebar';
import InboxModal from '../components/InboxModal';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const selectedView = useSelector(selectSelectedView);
  const showCreate = useSelector(selectShowCreate);
  const showRightSidebar = useSelector(selectShowRightSidebar);
  const selectedFriend = useSelector(selectSelectedFriend);
  const showInbox = useSelector(selectShowInbox);

  const handleLogout = () => {
    logout();
    navigate('/');
  };


    return (
      <div className="h-screen bg-gray-100 flex flex-col overflow-x-hidden">
        {/* Top Navbar */}
        <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-xl">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-800">
              {selectedView === 'discover' ? 'Discover' : 'Dashboard'}
            </h1>
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
        <div className="flex flex-1 gap-2 p-2">
        <div className="flex border border-gray-500 rounded-xl">
          {/* Narrow Left Sidebar */}
          <div className="w-16 bg-white border-l-b-ts border-gray-400 flex flex-col items-center py-4 space-y-4 rounded-l-xl">
            {/* Profile Picture */}
            <div 
              title='profile'
              className="w-10 h-10 rounded-md bg-gray-300 flex items-center justify-center overflow-hidden">
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
            </div>

            {/* Plus Icon */}
            <button
            onClick={() => dispatch(setShowCreate(true))}
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

          {/* Left Sidebar Navigation */}
          <DashboardLeftSidebar 
            selectedView={selectedView} 
            setSelectedView={(view) => dispatch(setSelectedView(view))}
            selectedFriend={selectedFriend}
            setSelectedFriend={(friend) => dispatch(setSelectedFriend(friend))}
          />
        </div>

        {/* Conditional Rendering: Discover or Main + Right Sidebar */}
        {selectedView === 'discover' ? (
          <Discover />
        ) : (
          <>
            <DashboardMainSection 
              selectedFriend={selectedFriend} 
              onOpenAddFriends={() => dispatch(setShowRightSidebar(true))}
              showRightSidebar={showRightSidebar}
            />
            {showRightSidebar && (
              <DashboardRightSidebar onClose={() => dispatch(setShowRightSidebar(false))} />
            )}
          </>
        )}
        <CreatePopup open={showCreate} onClose={() => dispatch(setShowCreate(false))} />
        <InboxModal isOpen={showInbox} onClose={() => dispatch(setShowInbox(false))} />
        </div>
    </div>
  );
};

export default Dashboard;
