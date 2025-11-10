import React, { useState, useEffect } from 'react';
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
import MobileHamburgerMenu from '../components/MobileHamburgerMenu';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const selectedView = useSelector(selectSelectedView);
  const showCreate = useSelector(selectShowCreate);
  const showRightSidebar = useSelector(selectShowRightSidebar);
  const selectedFriend = useSelector(selectSelectedFriend);
  const showInbox = useSelector(selectShowInbox);


  useEffect(() => {
    const storedFriend = sessionStorage.getItem('selectedFriend');
    if (storedFriend) {
      try {
        const friend = JSON.parse(storedFriend);
        dispatch(setSelectedFriend(friend));
        dispatch(setSelectedView('dashboard'));
        sessionStorage.removeItem('selectedFriend');
      } catch (e) {
        console.error('Error parsing selected friend:', e);
      }
    }
  }, [dispatch]);

 
  useEffect(() => {
    const handleOpenInbox = () => {
      dispatch(setShowInbox(true));
    };
    window.addEventListener('openInbox', handleOpenInbox);
    return () => {
      window.removeEventListener('openInbox', handleOpenInbox);
    };
  }, [dispatch]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMobileNavigation = (view) => {
    if (view === 'direct-message') {
      navigate('/dashboard/direct-message');
    } else if (view === 'create-join') {
      navigate('/dashboard/create-join');
    } else if (view === 'discover') {
      dispatch(setSelectedView('discover'));
    } else if (view === 'dashboard') {
      dispatch(setSelectedView('dashboard'));
      dispatch(setSelectedFriend(null));
    } else {
      dispatch(setSelectedView('dashboard'));
    }
    setIsMobileMenuOpen(false);
  };


    return (
      <div className="h-screen flex flex-col overflow-x-hidden bg-[#E6E6E6] md:bg-gray-100">
        {/* Top Navbar */}
        <div className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300 h-14 flex items-center px-4 rounded-b-xl">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 mr-2"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2">
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
        <div className="flex flex-1 gap-2 p-2 relative min-h-0 overflow-hidden">
        <div className="hidden md:flex border border-gray-500 rounded-xl h-full flex-shrink-0">
          {/* Narrow Left Sidebar */}
          <div className="w-16 bg-white border-l-b-ts border-gray-400 flex flex-col items-center py-4 space-y-4 rounded-l-xl h-full">
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
        <div className="flex-1 flex gap-2 min-w-0">
        {selectedView === 'discover' ? (
            <Discover onOpenMenu={() => setIsMobileMenuOpen(true)} />
        ) : (
          <>
              {/* Dashboard Main Section - Show on both mobile and desktop */}
              <div className="flex-1 min-w-0 h-full">
            <DashboardMainSection 
              selectedFriend={selectedFriend} 
              onOpenAddFriends={() => dispatch(setShowRightSidebar(true))}
              showRightSidebar={showRightSidebar}
            />
              </div>
            {/* Right Sidebar - Desktop: In layout, Mobile/Tablet: Slide-in from right */}
            {showRightSidebar && (
              <>
                {/* Mobile/Tablet: Slide-in Panel from Right */}
                <div className="lg:hidden">
                  {/* Overlay */}
                  <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => dispatch(setShowRightSidebar(false))}
                  />
                  
                  {/* Slide-in Panel from Right with proper spacing */}
                  <div className="fixed right-0 top-0 bottom-0 z-50 flex items-center justify-end p-2">
                    <div className="w-[calc(100%-1rem)] sm:max-w-xs md:max-w-sm h-[calc(100%-1rem)] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                      <DashboardRightSidebar onClose={() => dispatch(setShowRightSidebar(false))} />
                    </div>
                  </div>
                </div>

                {/* Desktop: In normal layout (1024px and above) */}
                <div className="hidden lg:flex w-full max-w-xs flex-shrink-0 h-full">
                  <DashboardRightSidebar onClose={() => dispatch(setShowRightSidebar(false))} />
                </div>
              </>
            )}
          </>
        )}
        </div>
        <CreatePopup open={showCreate} onClose={() => dispatch(setShowCreate(false))} />
        <InboxModal isOpen={showInbox} onClose={() => dispatch(setShowInbox(false))} />
        
        {/* Mobile Hamburger Menu */}
        <MobileHamburgerMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNavigate={handleMobileNavigation}
        />
        </div>
    </div>
  );
};

export default Dashboard;
