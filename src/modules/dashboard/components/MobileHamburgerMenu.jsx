import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import logo from '../../../assets/landing/logo-removebg-preview.svg';

const MobileHamburgerMenu = ({ isOpen, onClose, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem('userData') || '{}');
  const displayUser = user || sessionUser;
  const username = displayUser?.username || displayUser?.email?.split('@')[0] || 'User';
  const avatarUrl = displayUser?.avatarUrl || '/avatars/avatar-1.png';

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const handleNavigation = (view) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      navigate(`/dashboard${view === 'dashboard' ? '' : `/${view}`}`);
    }
    onClose();
  };

  if (!isOpen) return null;
  const email = user?.email || JSON.parse(sessionStorage.getItem('userData') || '{}')?.email;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Menu Drawer */}
      <div className="fixed left-0 top-0 bottom-0 w-[70%] max-w-sm bg-white z-50 md:hidden flex flex-col shadow-2xl">
        {/* Header with Logo and App Name */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => { navigate('/'); onClose(); }} className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src={logo} alt="SpaceHub" className="w-8 h-8" />
            </button>
            <span className="text-lg font-semibold text-gray-800">SPACEHUB</span>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img 
                src={avatarUrl} 
                alt={username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/avatars/avatar-1.png';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 truncate">{username}</div>
              <div className="text-sm text-gray-500">{email}</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-2">
            <button
              onClick={() => handleNavigation('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-black hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('create-join');
                } else {
                  navigate('/dashboard/create-join');
                }
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-black hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Create/Join</span>
            </button>

            <button
              onClick={() => handleNavigation('discover')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-black hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">Discover</span>
            </button>

            <button
              onClick={() => handleNavigation('direct-message')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-black hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">Direct message</span>
            </button>
          </div>
        </div>

        {/* Settings and Logout */}
        <div className="border-t border-gray-200 py-2 px-2">
          <button
            onClick={() => {
              navigate('/dashboard/settings');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Profile settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-500 hover:bg-red-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileHamburgerMenu;

