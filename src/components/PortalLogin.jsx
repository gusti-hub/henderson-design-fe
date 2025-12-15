import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Eye, EyeOff, ArrowLeft, Key, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import ChangePasswordModal from '../pages/ChangePasswordModal';

const PortalLogin = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const loadingTimeoutRef = useRef(null);
  const retryAttemptsRef = useRef(new Map());

  const navigate = useNavigate();

  const slides = [
    {
      image: "/images/SAS00201.jpg",
      title: "",
      description: ""
    },
    {
      image: "/images/SAS00274.jpg",
      title: "",
      description: ""
    },
    {
      image: "/images/SAS00286.jpg",
      title: "",
      description: ""
    },
    {
      image: "/images/SAS00319.jpg",
      title: "",
      description: ""
    }
  ];

  // Image loading with retry mechanism
  useEffect(() => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;
    const LOADING_TIMEOUT = 15000;

    const loadImageWithRetry = (src, index, retryCount = 0) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const cacheBustSrc = retryCount > 0 ? `${src}?v=${Date.now()}` : src;
        
        const loadTimeout = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          reject(new Error(`Image loading timeout: ${src}`));
        }, 5000);

        img.onload = () => {
          clearTimeout(loadTimeout);
          setLoadedImages(prev => new Set([...prev, index]));
          resolve(index);
        };

        img.onerror = () => {
          clearTimeout(loadTimeout);
          console.warn(`Failed to load image ${src}, attempt ${retryCount + 1}`);
          
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              loadImageWithRetry(src, index, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, RETRY_DELAY * Math.pow(2, retryCount));
          } else {
            setImageLoadErrors(prev => new Set([...prev, index]));
            reject(new Error(`Failed to load image after ${MAX_RETRIES + 1} attempts: ${src}`));
          }
        };

        img.src = cacheBustSrc;
      });
    };

    const loadImages = async () => {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Image loading timeout reached, proceeding with fallback');
        setImagesLoaded(true);
      }, LOADING_TIMEOUT);

      const imagePromises = slides.map((slide, index) => {
        retryAttemptsRef.current.set(index, 0);
        return loadImageWithRetry(slide.image, index);
      });

      try {
        const results = await Promise.allSettled(imagePromises);
        const successCount = results.filter(result => result.status === 'fulfilled').length;
        
        if (successCount > 0) {
          console.log(`Successfully loaded ${successCount}/${slides.length} images`);
        } else {
          console.warn('No images loaded successfully, using fallback');
        }
        
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error in image loading process:', error);
        setImagesLoaded(true);
      } finally {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    };

    loadImages();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Slideshow timer
  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = prevSlide === slides.length - 1 ? 0 : prevSlide + 1;
        if (imageLoadErrors.has(nextSlide)) {
          return (nextSlide + 1) % slides.length;
        }
        return nextSlide;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, imagesLoaded, imageLoadErrors]);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '', form: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${backendServer}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || response.statusText;
        } catch (jsonError) {
          errorMessage = response.statusText || 'Login failed';
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Server returned invalid response format');
      }

      if (!data.token || !data._id || !data.name || !data.role) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);

      if (data.role === 'admin' || data.role === 'designer') {
        navigate('/admin-panel');
      } else if (data.role === 'user') {
        try {
          const clientResponse = await fetch(`${backendServer}/api/clients/${data._id}`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });

          if (clientResponse.ok) {
            const clientData = await clientResponse.json();            
            console.log(clientData.data.paymentInfo.downPaymentStatus)
            
            if (clientData.data.paymentInfo) {
              navigate('/client-portal');
            } else {
              throw new Error('Access denied. Your account is pending payment confirmation. Please contact us for assistance.');
            }
          } else {
            throw new Error('Unable to verify account status. Please contact support.');
          }
        } catch (verifyError) {
          throw new Error(verifyError.message || 'Unable to verify payment status');
        }
      } else {
        throw new Error('Unauthorized access');
      }
      
    } catch (error) {
      let userMessage;
      if (error.name === 'AbortError') {
        userMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('fetch')) {
        userMessage = 'Connection failed. Please check your internet connection.';
      } else {
        userMessage = error.message || 'Login failed. Please try again.';
      }

      setErrors({
        ...errors,
        form: userMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = (index) => {
    if (!imageLoadErrors.has(index)) {
      setCurrentSlide(index);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-[#005670] shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <img 
                src="/images/HDG-Logo.png" 
                alt="Henderson Design Group" 
                className="h-12 w-auto brightness-0 invert"
              />
              <div className="hidden sm:block border-l border-white/30 pl-4">
                <p className="text-xs text-white/70 tracking-widest uppercase font-semibold">Ālia Collections</p>
                <p className="text-sm text-white font-semibold">Portal Login</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex w-full max-w-7xl h-auto" style={{ minHeight: "700px" }}>
        
        {/* Left Section - Image Carousel */}
        <div className="w-2/3 relative overflow-hidden hidden lg:block">
          {/* Loading State */}
          {!imagesLoaded && (
            <div className="absolute inset-0 z-20">
              <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8]"></div>
              
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-pulse"></div>
              </div>
              
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="text-white text-4xl tracking-widest font-light mb-2">
                      HENDERSON
                    </div>
                    <div className="text-white/80 text-lg tracking-wider font-light">
                      DESIGN GROUP
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
                  </div>
                  
                  <p className="text-white/90 text-lg mb-2">Loading gallery</p>
                  <div className="text-sm text-white/70">
                    {loadedImages.size}/{slides.length} images loaded
                    {imageLoadErrors.size > 0 && (
                      <div className="text-yellow-300 text-xs mt-1">
                        {imageLoadErrors.size} image(s) failed to load
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 w-64 mx-auto">
                    <div className="bg-white/20 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-white h-full transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${Math.min(((loadedImages.size + imageLoadErrors.size) / slides.length) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Slides */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                currentSlide === index && imagesLoaded && !imageLoadErrors.has(index) 
                  ? 'opacity-100 z-10' 
                  : 'opacity-0 z-0'
              }`}
            >
              {!imageLoadErrors.has(index) ? (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform scale-105"
                    style={{ 
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      willChange: 'opacity'
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8]"></div>
              )}
              
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
                <h2 className="text-5xl font-light tracking-wider mb-4">{slide.title}</h2>
                <p className="text-xl text-center font-light opacity-90">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Slide Indicators */}
          {imagesLoaded && (
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    imageLoadErrors.has(index)
                      ? 'bg-red-400/50 w-3 cursor-not-allowed'
                      : currentSlide === index 
                        ? 'bg-white w-8 shadow-lg' 
                        : 'bg-white/50 w-3 hover:bg-white/70'
                  }`}
                  onClick={() => handleSlideChange(index)}
                  disabled={imageLoadErrors.has(index)}
                  title={imageLoadErrors.has(index) ? 'Image failed to load' : `Slide ${index + 1}`}
                ></button>
              ))}
            </div>
          )}

          {/* Fallback for all images failed */}
          {imagesLoaded && loadedImages.size === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] z-5">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
                <div className="text-center">
                  <div className="text-white text-5xl tracking-widest font-light mb-4">
                    HENDERSON
                  </div>
                  <div className="text-white/90 text-xl tracking-wider font-light">
                    DESIGN GROUP
                  </div>
                  <p className="text-white/80 text-lg mt-8">Crafting Exceptional Experiences</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/3 flex flex-col justify-between p-8" style={{ minHeight: "700px" }}>
          <div></div>
          
          <div className="w-full max-w-sm mx-auto">
            {/* Logo */}
            <div className="text-center mb-8">
              <img
                src="/images/HDG-Logo.png"
                alt="Henderson Design Group"
                className="h-16 md:h-20 w-auto mx-auto object-contain mb-4"
                style={{
                  filter: "brightness(0) saturate(100%) invert(21%) sepia(98%) saturate(1160%) hue-rotate(160deg) brightness(92%) contrast(90%)"
                }}
              />

              <h2 className="text-2xl font-light tracking-wide text-[#005670] mb-2">
                Portal Login
              </h2>
              <p className="text-gray-600 text-sm">Access your account</p>
            </div>

            {/* Portal Type Info */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="bg-[#005670]/5 rounded-lg p-3 text-center border border-[#005670]/10">
                <Shield className="w-5 h-5 text-[#005670] mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">Admin/Designer</p>
              </div>
              <div className="bg-[#005670]/5 rounded-lg p-3 text-center border border-[#005670]/10">
                <Users className="w-5 h-5 text-[#005670] mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">Client Portal</p>
              </div>
            </div>

            {/* Error Message */}
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{errors.form}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all bg-white shadow-sm"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all bg-white shadow-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white bg-[#005670] hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Change Password Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full py-2.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Client Info Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Clients:</strong> You'll receive login credentials after your down payment is confirmed. Contact us if you need assistance.
              </p>
            </div>
          </div>
          
          {/* Brand Footer */}
          <div className="text-center">
          </div>
        </div>
      </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#005670] border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-xs text-white/70">
              &copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.
            </p>
            <p className="text-xs text-white/60 mt-1">
              Crafting Exceptional Experiences
            </p>
          </div>
        </div>
      </footer>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
    </div>
  );
};

export default PortalLogin;