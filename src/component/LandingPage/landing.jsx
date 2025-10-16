import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-gray-900">
            <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/favicon.png"
                                alt="SpaceHUB logo"
                                className="w-10 h-10"
                            />
                            <span className="text-xl font-semibold">SpaceHUB</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-4">
                            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                            <Link to="/signup" className="text-gray-700 hover:text-blue-600">Signup</Link>
                        </nav>
                        <div className="md:hidden">
                            <Link to="/login" className="text-sm text-blue-600">Sign in</Link>
                        </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                <div className="flex flex-col-reverse lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
                    <section className="w-full lg:flex-1">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 sm:mb-6">
                            Build and grow your community with SpaceHUB
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 mb-6">A simple platform to create engaging spaces, events, and discussions for your users.</p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <Link to="/signup" className="w-full sm:w-auto inline-block bg-blue-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-blue-700 text-center">Get Started</Link>
                            <Link to="/login" className="w-full sm:w-auto inline-block border border-blue-600 text-blue-600 px-5 py-3 rounded-md font-semibold hover:bg-blue-50 text-center">Sign in</Link>
                        </div>

                        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <li className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold">Events & Meetups</h3>
                            <p className="text-sm text-gray-600 mt-1">Host and manage events built for your community.</p>
                        </li>
                        <li className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold">Discussion Spaces</h3>
                            <p className="text-sm text-gray-600 mt-1">Create topic-based spaces where users can connect.</p>
                        </li>
                        <li className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold">Moderation Tools</h3>
                            <p className="text-sm text-gray-600 mt-1">Keep your community safe and organized.</p>
                        </li>
                        <li className="p-4 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold">Analytics</h3>
                            <p className="text-sm text-gray-600 mt-1">Understand engagement with simple analytics.</p>
                        </li>
                    </ul>
                </section>

                </div>
                <aside className="w-full lg:w-1/2 flex items-center justify-center mt-6 lg:mt-0">
                    <div className="w-full max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-8 ">
                        <img
                            src="/favicon.png"
                            alt="SpaceHUB illustration"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </aside>
            </main>

            <footer className="border-t mt-12 py-6">
                <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} SpaceHUB. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;