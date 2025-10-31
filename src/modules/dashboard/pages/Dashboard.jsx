import React, { useState } from 'react';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import DashboardMainSection from '../components/DashboardMainSection';
import DashboardRightSidebar from '../components/DashboardRightSidebar';
import Discover from '../components/Discover';
import CreatePopup from '../components/CreatePopup';
import DashboardLeftSidebar from '../components/DashboardLeftSidebar';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('dashboard');
  const [showCreate, setShowCreate] = useState(false);

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
              title='Inbox'
              className="w-7 h-7 flex items-center justify-center">
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
        <div className="flex flex-1">
        {/* Narrow Left Sidebar */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
          {/* Profile Picture */}
          <div 
          title='profile'
          className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Plus Icon */}
          <button
          onClick={() => setShowCreate(true)}
          title='Create Community' 
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <img src="/avatars/plus.png" alt="Add" className="w-8 h-8" />
          </button>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Logout Icon */}
          <button 
            title='Logout'
            onClick={handleLogout}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 hover:text-black text-bg-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Left Sidebar Navigation */}
        <DashboardLeftSidebar selectedView={selectedView} setSelectedView={setSelectedView} />

        {/* Conditional Rendering: Discover or Main + Right Sidebar */}
        {selectedView === 'discover' ? (
          <Discover />
        ) : (
          <>
            <DashboardMainSection />
            <DashboardRightSidebar />
          </>
        )}
        <CreatePopup open={showCreate} onClose={() => setShowCreate(false)} />
        </div>
    </div>
  );
};

export default Dashboard;
