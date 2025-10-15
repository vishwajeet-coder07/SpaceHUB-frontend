import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import login0 from '../assets/Auth.page/login0.png';
import login1 from '../assets/Auth.page/login1.png';
import login2 from '../assets/Auth.page/login2.png';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
    
    if (name === 'password') {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[#@!%&]).{6,}$/;
      if (value && !passwordRegex.test(value)) {
        setPasswordError(true);
      } else {
        setPasswordError(false);
      }
    }
  };

  const handleStepOneSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) {
      setStep(2);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup data:', formData);
  };

  const images = [login0, login1, login2];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-screen min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden lg:fixed lg:top-0 lg:left-0 overflow-x-hidden text-body">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-full min-h-screen bg-accent">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={image}
              alt={`Auth slide ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      <div className="lg:hidden w-full min-h-80 bg-accent flex flex-col justify-center items-center px-0 py-4">
        <div className="text-left mb-4 w-full px-6">
          <h1 className="text-2xl font-bold text-blue-800 leading-tight text-heading">
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
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
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
               <div className="mx-auto h-40 w-40 flex items-center justify-center pt-10 ">
                 <img src="/favicon.png" alt="Logo" className="h-15 w-22" />
               </div>
                <h3 className="text-[1.75rem] lg:text-[1.75rem] font-semibold text-default mb-1">Create your account</h3>
              <p className="text-muted text-[1.25rem] font-normal">
                Welcome! Please enter your details
              </p>
             
            </div>
            {step === 1 ? (
              <form className="space-y-6" onSubmit={handleStepOneSubmit}>
                <div>
                  <label htmlFor="firstName" className="block text-[1.25rem] font-medium text-default mb-2 text-left">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lgx ring-primary focus:border-blue-500 transition-colors bg-gray-50 placeholder-gray-500 h-[2.75rem] max-w-[30.875rem]"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-[1.25rem] font-medium text-default mb-2 text-left">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lgx ring-primary focus:border-blue-500 transition-colors bg-gray-50 placeholder-gray-500 h-[2.75rem] max-w-[30.875rem]"
                    placeholder="Last Name"
                  />
                </div>
                <div className="text-center mb-2">
                  <p className="text-sm text-black">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">
                      Login
                    </Link>
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lgx text-white btn-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-semibold text-base"
                >
                  Next
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-[1.25rem] font-medium text-default mb-2 text-left">
                    Enter email <p className='text-red-500 text-md font-thin'>{emailError && '(Invalid credential)'}</p>
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M22 7.53516V17.0002C22 17.7654 21.7077 18.5017 21.1827 19.0584C20.6578 19.6152 19.9399 19.9503 19.176 19.9952L19 20.0002H5C4.23479 20.0002 3.49849 19.7078 2.94174 19.1829C2.38499 18.6579 2.04989 17.9401 2.005 17.1762L2 17.0002V7.53516L11.445 13.8322L11.561 13.8982C11.6977 13.965 11.8478 13.9997 12 13.9997C12.1522 13.9997 12.3023 13.965 12.439 13.8982L12.555 13.8322L22 7.53516Z" fill="#ADADAD"/>
                         <path d="M19 4C20.08 4 21.027 4.57 21.555 5.427L12 11.797L2.44501 5.427C2.6958 5.01982 3.0403 4.6785 3.44978 4.43149C3.85926 4.18448 4.32186 4.03894 4.79901 4.007L5.00001 4H19Z" fill="#ADADAD"/>
                       </svg>
                     </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-lgx ring-primary transition-colors bg-gray-50 placeholder-gray-500 h-[2.75rem] max-w-[30.875rem] ${emailError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="flex items-center gap-2 text-[1.25rem] font-medium text-default mb-2 text-left">
                    Enter Password <p className='text-red-500 text-md font-thin'>{passwordError && '(Invalid credential)'}</p>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg width="20" height="20" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.616 18C1.17133 18 0.791 17.8417 0.475 17.525C0.159 17.2083 0.000666667 16.8287 0 16.386V7.616C0 7.172 0.158333 6.792 0.475 6.476C0.791667 6.16 1.17167 6.00133 1.615 6H3V4C3 2.886 3.38833 1.941 4.165 1.165C4.941 0.388333 5.886 0 7 0C8.114 0 9.05933 0.388333 9.836 1.165C10.6127 1.94167 11.0007 2.88667 11 4V6H12.385C12.829 6 13.209 6.15833 13.525 6.475C13.841 6.79167 13.9993 7.17167 14 7.615V16.385C14 16.829 13.8417 17.209 13.525 17.525C13.2083 17.841 12.8283 17.9993 12.385 18H1.616ZM7 13.5C7.422 13.5 7.77733 13.3553 8.066 13.066C8.35533 12.7773 8.5 12.422 8.5 12C8.5 11.578 8.35533 11.2227 8.066 10.934C7.77667 10.6453 7.42133 10.5007 7 10.5C6.57867 10.4993 6.22333 10.644 5.934 10.934C5.64467 11.2227 5.5 11.578 5.5 12C5.5 12.422 5.64467 12.7773 5.934 13.066C6.22267 13.3553 6.578 13.5 7 13.5ZM4 6H10V4C10 3.16667 9.70833 2.45833 9.125 1.875C8.54167 1.29167 7.83333 1 7 1C6.16667 1 5.45833 1.29167 4.875 1.875C4.29167 2.45833 4 3.16667 4 4V6Z" fill="#ADADAD"/>
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-3 text-base border-2 rounded-lgx ring-primary transition-colors bg-gray-50 placeholder-gray-500 h-[2.75rem] max-w-[30.875rem] ${passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showPassword ?  (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.442-4.362M6.634 6.634A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.132 5.255M3 3l18 18" />
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-[1.25rem] font-medium text-default mb-2 text-left">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lgx ring-primary focus:border-blue-500 transition-colors bg-gray-50 placeholder-gray-500 h-[2.75rem] max-w-[30.875rem]"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="text-center mb-2">
                  <p className="text-sm text-black">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">
                      Login
                    </Link>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lgx text-white btn-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-semibold text-base"
                >
                  Create Account
                </button>
              </form>
            )}
            
            {(emailError || passwordError) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium mb-2">Password Requirements:</p>
                <ul className="text-xs text-red-500 space-y-1">
                  <li>• Must be at least 6 characters long</li>
                  <li>• Must contain at least one uppercase letter</li>
                  <li>• Must contain at least one special character (#, @, !, %, &)</li>
                </ul>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;