import React, { useState, useEffect } from 'react';
import login0 from '../../../assets/Auth.page/login0.png';
import login1 from '../../../assets/Auth.page/login1.png';
import login2 from '../../../assets/Auth.page/login2.png';

const AuthSlides = ({ 
  title = "Platform to build and grow communities.",
  autoSlide = true,
  slideInterval = 3000 
}) => {
  const images = [login0, login1, login2];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, slideInterval);

    return () => clearInterval(interval);
  }, [images.length, slideInterval, autoSlide]);

  return (
    <>

      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden h-full min-h-screen bg-[#FFFFFF]">
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

    
      <div className="lg:hidden w-full min-h-90 bg-accent flex flex-col justify-center items-center px-0 py-2">
        <div className="text-center px-2 w-full">
          <h1 className="text-lg font-bold text-blue-800 leading-tight text-heading">
            {title.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
        </div>
        
        <div className="w-full">
          <div className="relative w-full h-75 flex items-center justify-center">
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
    </>
  );
};

export default AuthSlides;
