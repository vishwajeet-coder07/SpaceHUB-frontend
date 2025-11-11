import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../../../assets/landing/logo-removebg-preview.svg';
import bgPattern from '../../../assets/landing/bg 1.svg';
import discoverSvg from '../../../assets/landing/discover.svg';
import card1 from '../../../assets/landing/card1.svg';
import card2 from '../../../assets/landing/card2.svg';
import card3 from '../../../assets/landing/card3.svg';
import line1 from '../../../assets/landing/line1.svg';
import line2 from '../../../assets/landing/line2.svg';
import line3 from '../../../assets/landing/line3.svg';

const RevealOnScroll = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const base = 'transition-all duration-700 ease-out will-change-transform';
  const hidden = 'opacity-0 translate-y-8';
  const shown = 'opacity-100 translate-y-0';

  return (
    <div ref={ref} className={`${base} ${visible ? shown : hidden} ${className}`}>
      {children}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = (section) => {
    setIsMenuOpen(false);
    if (section === 'login') {
      navigate('/login');
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (section === 'features') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-gray-900">

      {/* HEADER */}
      <header id="Home" className="w-full sticky top-0 left-0 px-4 sm:px-10 py-6 flex items-center justify-between bg-white rounded-b-lg shadow-sm z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
            <img src={logo} alt="SpaceHUB logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
          <span className="text-lg sm:text-xl font-bold text-gray-800">SPACEHUB</span>
        </div>
        
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-10">
          <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Features</Link>
          <a href="#Contact" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
          <a href="#About" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
        </nav>
        <Link to="/login" className="hidden md:block bg-gradient-to-r from-red-500 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-sm font-medium transition-all text-sm sm:text-base">
          Login
        </Link>
      </header>

      {/* Mobile Hamburger Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-[70%] max-w-sm bg-white z-50 md:hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="SpaceHub" className="w-8 h-8" />
                  <span className="text-lg font-semibold text-gray-800">SPACEHUB</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-4">
              <button
                onClick={() => handleMenuClick('features')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-300 rounded-md transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => handleMenuClick('About')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-300 rounded-md transition-colors font-medium"
              >
                About
              </button>
              <button
                onClick={() => handleMenuClick('Contact')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-300 rounded-md transition-colors font-medium"
              >
                Contact
              </button>
              <button
                onClick={() => handleMenuClick('login')}
                className="w-full text-left px-4 py-3 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                Login
              </button>
            </nav>
          </div>
        </>
      )}

      {/* HERO SECTION / FEATURES */}
      <section
        id="Features"
        className="w-full  min-h-[37rem] sm:min-h-screen py-8 sm:py-12 lg:py-16 relative px-4 sm:px-6"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
        }}
      >
        <RevealOnScroll className="text-center relative z-10 max-w-5xl mx-auto mt-10">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-600 rounded-md p-0.5">
              <div className="bg-red-100 rounded-md h-full w-full"></div>
            </div>

            <div className="relative bg-red-100 rounded-md px-4 sm:px-6 py-2 m-1">
              <p className="text-gray-800 font-medium text-sm sm:text-base">Connect your team and collaborate seamlessly</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-[500] text-gray-900 mb-4 sm:mb-6 leading-normal mt-10">
            A unified workspace for teams to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">
              chat, share, and build
            </span>{' '}
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
            className="inline-block bg-gradient-to-r from-red-500 to-blue-600 text-white px-3 sm:px-5 py-5 rounded-md font-semibold text-base sm:text-lg transition-all"
          >
            Get started
          </Link>
        </RevealOnScroll>
      </section>

      {/* DISCOVER SECTION */}
      <section id="About" className="max-w-screen relative mb-7 sm:mb-[13rem]">
        <RevealOnScroll>
          <img src={discoverSvg} alt="Discover SPACEHUB" className="w-full mx-auto h-auto" loading="lazy" />
        </RevealOnScroll>

        {/* LINE 1 DECORATION */}
        <img
          src={line1}
          alt="decorative line"
          className="absolute hidden sm:block left-1/2 transform -translate-x-1/2 bottom-[-19.8rem] sm:bottom-[-19.8rem] w-[85%] sm:w-[70%] max-w-5xl object-contain pointer-events-none"
          loading="lazy"
        />
      </section>

      {/* JOIN YOUR WORKSPACE SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <RevealOnScroll className="order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Join your workspace</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Step Into Your Workspace</p>
            <div className="bg-zinc-400 p-4 sm:p-6 rounded-lg shadow-md">
              <p className="text-gray-900 text-sm sm:text-base">
                SPACEHUB begins with your own workspace — a dedicated digital environment where you and your team can collaborate seamlessly. Create your SPACEHUB, invite your members, and shape how your team communicates, shares files, and achieves goals together.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="text-center order-1 lg:order-2">
            <img src={card1} alt="card1" className="w-full h-full object-cover rounded-md" loading="lazy" />
          </RevealOnScroll>
        </div>

        {/* LINE 2 DECORATION */}
        <img
          src={line2}
          alt="decorative line"
          className="absolute hidden sm:block left-1/2 transform -translate-x-1/2 bottom-[-6rem] sm:bottom-[-8rem] w-[85%] sm:w-[70%] max-w-5xl object-contain pointer-events-none"
          loading="lazy"
        />
      </section>

      {/* JOIN THE BUZZ SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <RevealOnScroll className="text-center order-1 lg:order-1">
            <img src={card2} alt="card2" className="w-full h-full object-cover rounded-md" loading="lazy" />
          </RevealOnScroll>

          <RevealOnScroll className="order-2 lg:order-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Join the buzz!</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Where Conversations Come Alive</p>
            <div className="bg-zinc-400 p-4 sm:p-6 rounded-lg shadow-md">
              <p className="text-gray-900 text-sm sm:text-base">
                Every great idea starts with a conversation. Inside SPACEHUB, chat rooms and direct messages let your team exchange thoughts instantly and organize discussions by projects or topics.
              </p>
            </div>
          </RevealOnScroll>
        </div>

        {/* LINE 3 DECORATION */}
        <img
          src={line3}
          alt="decorative line"
          className="absolute hidden sm:block left-1/2 transform -translate-x-1/2 bottom-[-6rem] sm:bottom-[-8rem] w-[85%] sm:w-[70%] max-w-5xl object-contain pointer-events-none"
          loading="lazy"
        />
      </section>

      {/* COLLABORATE & GROW SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <RevealOnScroll className="order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Collaborate & Grow</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">Share. Build. Create Together.</p>
            <div className="bg-zinc-400 p-4 sm:p-6 rounded-lg shadow-md">
              <p className="text-gray-900 text-sm sm:text-base">
                SPACEHUB empowers your team to collaborate effortlessly. Share files, voice ideas in real-time, and manage tasks — all within one connected platform. As your team contributes, your SPACEHUB expands — representing progress, innovation, and teamwork in motion.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="text-center order-1 lg:order-2">
            <img src={card3} alt="card3" className="w-full h-full object-cover rounded-md" loading="lazy" />
          </RevealOnScroll>
        </div>
      </section>
                    <hr/>
      {/* FOOTER */}
      <footer className="bg-gray-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <RevealOnScroll>
              <h3 className="sm:text-2xl text-5xl font-bold text-zinc-800 mb-3 sm:mb-4">Get the latest buzz!</h3>
              <p className="text-zinc-800 mb-4 sm:mb-6 sm:text-md text-lg">
                Stay updated with community stories, new features, and product updates.
              </p>
            </RevealOnScroll>

            <RevealOnScroll className="lg:absolute right-30">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick links</h3>
              <div className="space-y-2">
                <a href="#Home" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Home</a>
                <a href="#About" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">About</a>
                <Link to="/" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Features</Link>
                <a href="#Contact" className="block text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors">Contact</a>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll className="mt-8 pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="SpaceHUB logo" className="w-18 h-18 mb-2" loading="lazy" />
              <span className="text-3xl font-bold text-gray-700">SPACEHUB</span>
            </div>
          </RevealOnScroll>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
