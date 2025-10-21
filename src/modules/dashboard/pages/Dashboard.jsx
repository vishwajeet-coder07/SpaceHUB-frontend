import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="logo" className="w-10 h-10" />
            <h1 className="text-2xl font-semibold">SpaceHUB</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </nav>
        </header>

        <main className="bg-blue-50 rounded-lg p-8 shadow">
          <h2 className="text-3xl font-bold mb-4">
            Welcome to your dashboard{user?.name ? `, ${user.name}` : ''}!
          </h2>
          <p className="text-gray-700 mb-4">
            This is a placeholder dashboard. Replace this with real content (spaces, events, analytics).
          </p>
          {user && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">User Information</h3>
              <p><strong>Email:</strong> {user.email}</p>
              {user.name && <p><strong>Name:</strong> {user.name}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
