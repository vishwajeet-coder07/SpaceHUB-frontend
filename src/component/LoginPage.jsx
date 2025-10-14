import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import login0 from '../assets/Auth.page/login0.png';
import login1 from '../assets/Auth.page/login1.png';
import login2 from '../assets/Auth.page/login2.png';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="w-screen min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden lg:fixed lg:top-0 lg:left-0 overflow-x-hidden">

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

      {/* Mobile Image Section */}
      <div className="lg:hidden w-full min-h-80 bg-blue-100 flex flex-col justify-center items-center px-0 py-4">
        <div className="text-left mb-4 w-full px-6">
          <h1 className="text-2xl font-bold text-blue-800 leading-tight">
            Platform to build and<br />
            grow communities.
          </h1>
        </div>
        
        <div className="w-full">
          <div className="relative w-full h-80 flex items-center justify-center">
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
        </div>
      </div>

  <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white lg:h-full lg:min-h-screen lg:overflow-y-auto lg:rounded-l-3xl rounded-t-3xl rounded-l-3xl lg:-ml-4 -mt-4 lg:mt-0 relative z-10 lg:shadow-lg shadow-lg">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto h-40 w-40 flex items-center justify-center ">
              <img src="/favicon.png" alt="Logo" className="h-22 w-28" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-3">Login to your account</h2>
            <p className="text-base text-gray-600 font-normal">
              Welcome back, Please enter your details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left">
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
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-left">
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Eye button clicked, current showPassword:', showPassword);
                      setShowPassword(!showPassword);
                    }}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ?  (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end mb-2">
              <div className="text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forget password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-semibold text-base"
            >
              Login
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Not have any account?{' '}
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
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