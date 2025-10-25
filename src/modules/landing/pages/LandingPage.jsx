import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import bgPattern from '../../../assets/landing/bg 1.svg';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            {/* Header */}
            <header className="w-full px-4 sm:px-6 py-6 flex items-center justify-between bg-white rounded-b-lg shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                    <img
                        src={logo}
                        alt="SpaceHUB logo"
                        className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                    <span className="text-lg sm:text-xl font-bold text-gray-800">SPACEHUB</span>
                </div>
                <nav className="hidden md:flex items-center space-x-4 lg:space-x-10">
                    <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Features</Link>
                    <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</Link>
                    <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">About</Link>
                </nav>
                <Link to="/login" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all text-sm sm:text-base">
                    Login
                </Link>
            </header>

            {/* Hero Section */}
            <section 
                className="w-full py-8 sm:py-12 lg:py-16 relative px-4 sm:px-6"
                style={{
                    backgroundImage: `url(${bgPattern})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: 'auto'
                }}
            >
                <div className="text-center relative z-10 max-w-6xl mx-auto">
                    {/* Callout Box */}
                    <div className="inline-block bg-purple-100 border border-purple-200 rounded-lg px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                        <p className="text-gray-800 font-medium text-sm sm:text-base">Connect your team and collaborate seamlessly</p>
                    </div>
                    
                    {/* Main Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                        A unified workspace for teams to{' '}
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                            chat, share, and build together
                        </span>
                    </h1>
                    
                    {/* Description */}
                    <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                        Work smarter together with organized chat rooms, voice spaces, and shared workspaces. 
                        Bring your team, projects, and files together under one connected platform.
                    </p>
                    
                    {/* CTA Button */}
                    <Link 
                        to="/signup" 
                        className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                    >
                        Get started
                    </Link>
                </div>
            </section>

            {/* Discover SpaceHub Section */}
            <section className="bg-black text-white py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-block bg-white border border-white rounded-lg px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6">
                        <h2 className="text-gray-900 font-bold text-lg sm:text-xl">Discover spacehub</h2>
                    </div>
                    <p className="text-lg sm:text-xl text-white max-w-2xl mx-auto">
                        A collaborative space built to connect teams, spark conversations, and grow ideas.
                    </p>
                </div>
            </section>

            {/* Join Workspace & Collaborate Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side - Join Workspace */}
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Join your workspace</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Step Into Your Workspace</p>
                        <div className="bg-yellow-400 p-4 sm:p-6 rounded-lg">
                            <p className="text-gray-900 text-sm sm:text-base">
                                SPACEHUB begins with your own workspace a dedicated digital environment where you and your team can collaborate seamlessly. Create your SPACEHUB, invite your members, and shape how your team communicates, shares files, and achieves goals together.
                            </p>
                        </div>
                    </div>
                    
                    {/* Right Side - Collaborate Card */}
                    <div className="text-center order-1 lg:order-2">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg mx-auto mb-4 sm:mb-6"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Collaborate</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Build your space, invite members, and keep every discussion, file, and idea connected in one organized platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* Join the Buzz & Workspace Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side - Join Workspace Card */}
                    <div className="text-center order-1 lg:order-1">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg mx-auto mb-4 sm:mb-6"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Join workspace</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Step into a thriving community where creators, teams, and innovators connect. Build your workspace, share ideas, and make real connections.
                        </p>
                    </div>
                    
                    {/* Right Side - Join the Buzz */}
                    <div className="order-2 lg:order-2">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Join the buzz!</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Where Conversations Come Alive</p>
                        <div className="bg-yellow-400 p-4 sm:p-6 rounded-lg">
                            <p className="text-gray-900 text-sm sm:text-base">
                                Every great idea starts with a conversation. Inside HIVE, chat rooms and direct messages let your team exchange thoughts instantly and organize discussions by projects or topics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Collaborate & Grow Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side - Collaborate & Grow */}
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Collaborate & Grow</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Share. Build. Create Together.</p>
                        <div className="bg-yellow-400 p-4 sm:p-6 rounded-lg">
                            <p className="text-gray-900 text-sm sm:text-base">
                                HIVE empowers your team to collaborate effortlessly. Share files, voice ideas in real-time, and manage tasks — all within one connected platform. As your team contributes, your hive expands — representing progress, innovation, and teamwork in motion.
                            </p>
                        </div>
                    </div>
                    
                    {/* Right Side - Grow Together Card */}
                    <div className="text-center order-1 lg:order-2">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg mx-auto mb-4 sm:mb-6"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Grow together</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Track your milestones, unlock new levels, and celebrate team wins. Your growth is the heartbeat of the SPACEHUB.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Side - Newsletter */}
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Get the latest buzz!</h3>
                            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                                Stay updated with community stories, new features, and product updates.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                                />
                                <button className="bg-gray-800 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base">
                                    →
                                </button>
                            </div>
                        </div>
                        
                        {/* Right Side - Quick Links */}
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick links</h3>
                            <div className="space-y-2">
                                <Link to="/" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Home</Link>
                                <Link to="/" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">About</Link>
                                <Link to="/" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Features</Link>
                                <Link to="/" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Contact</Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Logo */}
                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <img
                                src={logo}
                                alt="SpaceHUB logo"
                                className="w-6 h-6 sm:w-8 sm:h-8"
                            />
                            <span className="text-base sm:text-lg font-semibold text-gray-800">SPACEHUB</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;