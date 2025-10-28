import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContextContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-4">
      <header className="h-14 bg-white border rounded-xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="logo" className="w-8 h-8" />
          <span className="font-semibold">SpaceHUB</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/" className="text-indigo-600">Home</Link>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-red-600 text-white">Logout</button>
        </nav>
      </header>

      <div className="grid grid-cols-12 gap-4 mt-4">
        <aside className="col-span-2 bg-white border rounded-2xl p-3 flex flex-col gap-3">
          <div className="h-10 rounded-lg bg-gray-100 flex items-center px-3 gap-2 font-medium"><span>Dashboard</span></div>
          <div className="h-10 rounded-lg bg-gray-50 flex items-center px-3">Discover</div>
          <div className="h-10 rounded-lg bg-gray-50 flex items-center px-3">Create/Join</div>
          <div className="mt-2 text-sm text-gray-500">Direct message</div>
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">+</div>
        </aside>

        <main className="col-span-7 bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <button className="px-3 py-1.5 rounded-lg bg-gray-800 text-white">Community</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-200">Group</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-200">Friends</button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-200">Add friend</button>
          </div>
          <h2 className="text-2xl font-bold">No community joined</h2>
          <p className="text-gray-600 mt-2">You haven’t joined any communities yet. Explore and connect with others who share your interests — your next great conversation might be waiting!</p>

          <h3 className="mt-6 mb-3 text-xl font-semibold">Suggestions</h3>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl border flex items-end p-4">
                <button className="w-28 h-10 bg-indigo-600 text-white rounded-xl">Join</button>
              </div>
            ))}
          </div>
        </main>

        <aside className="col-span-3 bg-white border rounded-2xl p-4">
          <h3 className="font-semibold">ONLINE FRIENDS</h3>
          <p className="text-gray-600 mt-2">No friends yet. Start connecting with people who share your interests.</p>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
