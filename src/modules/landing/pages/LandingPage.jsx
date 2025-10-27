import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/landing/logo-removebg-preview.svg';
import bgPattern from '../../../assets/landing/bg 1.svg';
import discoverSvg from '../../../assets/landing/discover.svg';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            {/* Header */}
            <header id="Home" className="w-full sticky t-0 l-0 px-4 sm:px-10 py-6 flex items-center justify-between bg-white rounded-b-lg shadow-sm">
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
                    <a href="#Contact" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
                    <a href="#About" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
                        </nav>
                <Link to="/login" className="bg-gradient-to-r from-red-500 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-sm font-medium transition-all text-sm sm:text-base">
                    Login
                </Link>
            </header>
            
            {/* Hero Section */}
            <section 
                className="w-full min-h-screen py-8 sm:py-12 lg:py-16 relative px-4 sm:px-6"
                style={{
                    backgroundImage: `url(${bgPattern})`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: 'auto'
                }}
            >
                <div className="text-center relative z-10 max-w-5xl mx-auto mt-10">

                    <div className="inline-block relative">

                        <div className="absolute inset-0 bg-gradient-to-r from-red-500  to-blue-600 rounded-md p-0.5">
                            <div className="bg-red-100 rounded-md h-full w-full"></div>
                        </div>

                        <div className="relative bg-red-100 rounded-md px-4 sm:px-6 py-2 m-1">
                            <p className="text-gray-800 font-medium text-sm sm:text-base">Connect your team and collaborate seamlessly</p>
                        </div>

                        </div>


                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-[500] text-gray-900 mb-4 sm:mb-6 leading-normal mt-10">
                        A unified workspace for teams to{' '}
                        <span className="bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
                            chat, share, and build <sub> </sub>
                        </span>
                         together
                        </h1>
                    
              
                    <p className="text-base font-[500] sm:text-lg text-gray-700 max-w-4xl mx-auto px-4">
                        Work smarter together with organized chat rooms, voice spaces, and shared workspaces.
                    </p>
                    <p className="text-base font-[500] sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-4xl mx-auto px-4">
                        Bring your team, projects, and files together under one connected platform.
                    </p>
                    
                    
                    <Link 
                        to="/signup" 
                        className="inline-block bg-gradient-to-r from-red-500 to-blue-600 text-white px-3 sm:px-5 py-1 rounded-md font-semibold text-base sm:text-lg transition-all"
                    >
                        Get started
                    </Link>
                </div>
                </section>


            <section id='About' className=" max-w-screen">
                    <div className="m-6 sm:mb-8">
                        <img 
                            src={discoverSvg} 
                            alt="Discover SPACEHUB" 
                            className="w-full mx-auto h-auto"
                        />
                    </div>
            </section>

            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Join your workspace</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Step Into Your Workspace</p>
                        <div className="bg-yellow-400 p-4 sm:p-6 rounded-lg">
                            <p className="text-gray-900 text-sm sm:text-base">
                                SPACEHUB begins with your own workspace a dedicated digital environment where you and your team can collaborate seamlessly. Create your SPACEHUB, invite your members, and shape how your team communicates, shares files, and achieves goals together.
                            </p>
                        </div>
                    </div>
                    
                    
                    <div className="text-center order-1 lg:order-2">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg mx-auto mb-4 sm:mb-6"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Collaborate</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Build your space, invite members, and keep every discussion, file, and idea connected in one organized platform.
                        </p>
                    </div>
                </div>
            </section>

            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    <div className="text-center order-1 lg:order-1">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg mx-auto mb-4 sm:mb-6"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Join workspace</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Step into a thriving community where creators, teams, and innovators connect. Build your workspace, share ideas, and make real connections.
                        </p>
                    </div>
                    
                    
                    <div className="order-2 lg:order-2">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Join the buzz!</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Where Conversations Come Alive</p>
                        <div className="bg-yellow-400 p-4 sm:p-6 rounded-lg">
                            <p className="text-gray-900 text-sm sm:text-base">
                                Every great idea starts with a conversation. Inside SPACEHUB, chat rooms and direct messages let your team exchange thoughts instantly and organize discussions by projects or topics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    <div className="order-2 lg:order-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Collaborate & Grow</h2>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Share. Build. Create Together.</p>
                        <div className="bg-yellow-400 p-4 sm:p-6 rounded-lg">
                            <p className="text-gray-900 text-sm sm:text-base">
                                SPACEHUB empowers your team to collaborate effortlessly. Share files, voice ideas in real-time, and manage tasks — all within one connected platform. As your team contributes, your SPACEHUB expands — representing progress, innovation, and teamwork in motion.
                            </p>
                        </div>
                        </div>

                    
                    <div className="text-center order-1 lg:order-2">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg mx-auto mb-4 sm:mb-6"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Grow together</h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Track your milestones, unlock new levels, and celebrate team wins. Your growth is the heartbeat of the SPACEHUB.
                        </p>
                    </div>
                </div>
                </section>

            
            <footer className="bg-gray-100 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        
                        <div>
                            <h3 className="sm:text-2xl text-5xl font-bold text-zinc-800 mb-3 sm:mb-4">Get the latest buzz!</h3>
                            <p className="text-zinc-800 mb-4 sm:mb-6 sm:text-md text-lg">
                                Stay updated with community stories, new features, and product updates.
                            </p>
                            <div id='Contact' className="flex flex-col sm:flex-row gap-2">
                                <input 
                                    type="email" 
                                    placeholder="Email"
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base placeholder:text-zinc-800"
                                />
                                <button className="bg-gray-800 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base">
                                    →
                                </button>
                            </div>
                        </div>
                        
                        
                        <div className='lg:absolute right-30'>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick links</h3>
                            <div className="space-y-2">
                                <a href="#Home" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Home</a>
                                <a href="#About" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">About</a>
                                <Link to="/" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Features</Link>
                                <a href="#Contact" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Contact</a>
                                
                            </div>
                        </div>
                </div>
                    
                    
                    <div className="mt-8 pt-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <img
                                src={logo}
                                alt="SpaceHUB logo"
                                className="w-18 h-18 mb-2"
                            />
                            <span className="text-3xl font-bold text-gray-700">SPACEHUB</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;