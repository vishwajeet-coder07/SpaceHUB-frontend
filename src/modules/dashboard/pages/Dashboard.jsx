import React, { useState } from 'react';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContextContext';
import DashboardMainSection from '../components/DashboardMainSection';
import DashboardRightSidebar from '../components/DashboardRightSidebar';
import Discover from '../components/Discover';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('dashboard');

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
            <button className="w-7 h-7 flex items-center justify-center">
              <img src="/avatars/inbox.png" alt="Inbox" className="w-5 h-5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center">
              <img src="/avatars/setting.png" alt="Settings" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 3-column layout */}
        <div className="flex flex-1">
        {/* Narrow Left Sidebar */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
          {/* Profile Picture */}
          <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Plus Icon */}
          <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <img src="/avatars/plus.png" alt="Add" className="w-5 h-5" />
          </button>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Logout Icon */}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Left Sidebar Navigation */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
          {/* Navigation Section */}
          <div className="space-y-2 mb-6">
            {/* Dashboard Button */}
            <button
              onClick={() => setSelectedView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                selectedView === 'dashboard'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>

            {/* Other Navigation Items */}
            <div className="space-y-2">
              <button
                onClick={() => setSelectedView('discover')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  selectedView === 'discover'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Discover</span>
              </button>
              

              
              <div className="flex items-center justify-between px-4 py-3 text-gray-700">
                <span className="font-medium">Direct message</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Rendering: Discover or Main + Right Sidebar */}
        {selectedView === 'discover' ? (
          <Discover />
        ) : (
          <>
            <DashboardMainSection />
            <DashboardRightSidebar />
          </>
        )}
        </div>
    </div>
  );
};

export default Dashboard;
