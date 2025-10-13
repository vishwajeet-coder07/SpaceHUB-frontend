import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import login0 from '../assets/Auth.page/login0.png';
import login1 from '../assets/Auth.page/login1.png';
import login2 from '../assets/Auth.page/login2.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  const images = [login0, login1, login2];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="w-screen h-screen min-h-screen min-w-screen flex overflow-hidden fixed top-0 left-0">

  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-full min-h-screen" style={{backgroundColor: '#B9DDFF'}}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Auth slide ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
    
      </div>


  <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white h-full min-h-screen overflow-hidden">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-6">
              <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Login to your account</h2>
            <p className="text-sm text-gray-500">
              Welcome back, Please enter your details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 text-left">
                Enter email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 text-left">
                Enter Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-gray-600 hover:text-blue-600 underline">
                  Forget password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium"
            >
              Login
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Not have any account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 underline">
                  Signup
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;