import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestForgotPassword, validateOtp, resendForgotOtp } from '../../../shared/services/API';
import login0 from '../../../assets/Auth.page/login0.png';
import login1 from '../../../assets/Auth.page/login1.png';
import login2 from '../../../assets/Auth.page/login2.png';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailError, setEmailError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [step, setStep] = useState('email');
  const [forgotToken, setForgotToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const images = [login0, login1, login2];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (step === 'email') {
      setLoading(true);
      requestForgotPassword(email)
        .then((res) => {
          const token = (res && res.data) ? res.data : '';
          setForgotToken(token);
          setStep('otp');
        })
        .catch((err) => {
          console.error('Failed to send OTP:', err.message);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    } else {
      if (!/^\d{6}$/.test(otp)) {
        setOtpError(true);
        return;
      }
      setOtpError(false);
      setLoading(true);
      validateOtp({ email, otp })
        .then((res) => {
          try {
            sessionStorage.setItem('resetEmail', email);
            const token = (res && res.data && res.data.accessToken) ? res.data.accessToken : (res && res.accessToken);
            if (token) sessionStorage.setItem('resetAccessToken', token);
          } catch {
            // error ke liye
          }
          return navigate('/reset');
        })
        .catch((err) => {
          console.error('Invalid OTP:', err.message);
          setError(err.message);
          if (err.message.includes('Invalid') || err.message.includes('invalid') || err.message.includes('OTP')) {
            setInvalidOtp(true);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const handleResendOtp = (e) => {
    e.preventDefault();
    if (!forgotToken) return;
    setLoading(true);
    setError('');
    resendForgotOtp(forgotToken)
       .catch((err) => {
        console.error('Failed to resend OTP:', err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  const handleBackToEmail = (e) => {
    e.preventDefault();
    setStep('email');
    setOtp('');
    setInvalidOtp(false);
    setOtpError(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  return (
      <div className="w-screen min-h-screen flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden lg:fixed lg:top-0 lg:left-0 overflow-x-hidden text-body">
        {error && (
          <div className="fixed z-50 text-red-600 bg-blue-100 max-w-sm" style={{ top: '4.5rem', right: '0', borderRadius: '0.75rem 0 0 0.75rem', minHeight: '3.875rem' }}>
            <div className="flex items-start p-4">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm leading-relaxed break-words">{error}</span>
            </div>
          </div>
        )}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-full min-h-screen bg-accent">
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

  <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white lg:h-full lg:min-h-screen lg:overflow-y-auto lg:rounded-l-3xl rounded-t-[2.25rem] rounded-l-3xl lg:-ml-4 -mt-4 lg:mt-0 relative z-10 lg:shadow-lg shadow-lg">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
             <div className="mx-auto h-40 w-40 flex items-center justify-center pt-10 ">
               <img src="/favicon.png" alt="Logo" className="h-15 w-22" />
             </div>
            {step === 'email' ? (
              <>
                <h3 className="text-[1.75rem] lg:text-[1.75rem] font-semibold text-default mb-1">Verify your email</h3>
                <p className="text-muted text-[1.25rem] font-normal">Verify your email to reset your password</p>
              </>
            ) : (
              <>
                <h3 className="text-[1.75rem] lg:text-[1.75rem] font-semibold text-default mb-1">Enter otp</h3>
                <p className="text-muted text-[1.25rem] font-normal">Verify your email to reset your password</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 'email' ? (
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
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-lgx ring-primary transition-colors bg-gray-50 placeholder-[#ADADAD] h-[2.75rem] max-w-[30.875rem] ${emailError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Enter your email"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600">Please enter a valid email address</p>
                  )}
                </div>
            ) : (
              <div>
                <label htmlFor="otp" className="block text-[1.25rem] font-medium text-default mb-2 text-left">
                  Enter otp {invalidOtp && <span className="text-red-500 font-normal">(Invalid otp)</span>}
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(onlyDigits);
                      setInvalidOtp(false);
                      if (onlyDigits && onlyDigits.length !== 6) {
                        setOtpError(true);
                      } else {
                        setOtpError(false);
                      }
                    }}
                    className={`w-full px-4 py-3 pr-12 text-base border-2 rounded-lgx ring-primary transition-colors bg-gray-50 placeholder-[#ADADAD] h-[2.75rem] max-w-[30.875rem] ${invalidOtp ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="Enter otp"
                  />
                  {invalidOtp && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right mt-2">
                  <a href="#" onClick={handleResendOtp} className={`text-default underline hover:text-blue-700 font-medium ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? 'Sending...' : 'Resend otp'}
                  </a>
                </div>
                {otpError && (
                  <p className="mt-2 text-xs text-red-600">Please enter a valid 6-digit OTP.</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lgx text-white btn-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-semibold text-base disabled:opacity-60"
            >
              {loading ? (step === 'email' ? 'Sending...' : 'Verifying...') : (step === 'email' ? 'Send OTP' : 'Verify')}
            </button>

            <div className="text-center">
              {step === 'email' ? (
                <p className="text-sm text-black">
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">Back</Link>
                </p>
              ) : (
                <p className="text-sm text-black">
                  <a href="#" onClick={handleBackToEmail} className="font-semibold text-blue-600 hover:text-blue-700 underline">Back</a>
                </p>
              )}
            </div>
          </form>
          
          {emailError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium mb-2">Email Requirements:</p>
              <ul className="text-xs text-red-500 space-y-1">
                <li>• Must be a valid email address</li>
                <li>• Must contain @ symbol</li>
                <li>• Must contain a domain name</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
