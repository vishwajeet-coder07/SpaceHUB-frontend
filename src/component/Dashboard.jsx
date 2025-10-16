import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="logo" className="w-10 h-10" />
            <h1 className="text-2xl font-semibold">SpaceHUB</h1>
          </div>
          <nav>
            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          </nav>
        </header>

        <main className="bg-blue-50 rounded-lg p-8 shadow">
          <h2 className="text-3xl font-bold mb-4">Welcome to your dashboard</h2>
          <p className="text-gray-700">This is a placeholder dashboard. Replace this with real content (spaces, events, analytics).</p>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
