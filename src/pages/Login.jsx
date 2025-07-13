import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Eye, EyeOff, UserPlus, Key, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import ChangePasswordModal from '../pages/ChangePasswordModal';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  // Improved image loading with retry mechanism and timeout
  useEffect(() => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;
    const LOADING_TIMEOUT = 15000; // 15 seconds timeout

    const loadImageWithRetry = (src, index, retryCount = 0) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        // Add cache busting for retry attempts
        const cacheBustSrc = retryCount > 0 ? `${src}?v=${Date.now()}` : src;
        
        const loadTimeout = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          reject(new Error(`Image loading timeout: ${src}`));
        }, 5000); // 5 second timeout per image

        img.onload = () => {
          clearTimeout(loadTimeout);
          setLoadedImages(prev => new Set([...prev, index]));
          resolve(index);
        };

        img.onerror = () => {
          clearTimeout(loadTimeout);
          console.warn(`Failed to load image ${src}, attempt ${retryCount + 1}`);
          
          if (retryCount < MAX_RETRIES) {
            // Retry with exponential backoff
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
      // Set overall loading timeout
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Image loading timeout reached, proceeding with fallback');
        setImagesLoaded(true);
      }, LOADING_TIMEOUT);

      const imagePromises = slides.map((slide, index) => {
        retryAttemptsRef.current.set(index, 0);
        return loadImageWithRetry(slide.image, index);
      });

      try {
        // Use Promise.allSettled to handle partial failures
        const results = await Promise.allSettled(imagePromises);
        
        // Check if at least one image loaded successfully
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
  }, []); // Remove slides dependency to prevent unnecessary re-renders

  // Start slideshow only after images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = prevSlide === slides.length - 1 ? 0 : prevSlide + 1;
        // Skip slides that failed to load
        if (imageLoadErrors.has(nextSlide)) {
          return (nextSlide + 1) % slides.length;
        }
        return nextSlide;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, imagesLoaded, imageLoadErrors]);

  // Form validation
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
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log('Making login request to:', `${backendServer}/api/auth/login`);
      
      const response = await fetch(`${backendServer}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal // Add timeout signal
      });

      clearTimeout(timeoutId);

      console.log('Login response status:', response.status, response.statusText);
      console.log('Login response headers:', [...response.headers.entries()]);

      // Check status BEFORE parsing JSON
      if (!response.ok) {
        // Try to get error message, fallback to statusText
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || response.statusText;
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON:', jsonError);
          errorMessage = response.statusText || 'Login failed';
        }
        throw new Error(errorMessage);
      }

      // Now safely parse JSON for successful responses
      let data;
      try {
        data = await response.json();
        console.log('Login successful, received data keys:', Object.keys(data));
      } catch (jsonError) {
        console.error('Failed to parse successful response as JSON:', jsonError);
        const textResponse = await response.text();
        console.log('Raw response text:', textResponse);
        throw new Error('Server returned invalid response format');
      }

      // Validate required fields
      if (!data.token || !data._id || !data.name || !data.role) {
        console.error('Missing required fields in response:', data);
        throw new Error('Invalid response from server');
      }

      // Store user data with error handling
      try {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('name', data.name);
        localStorage.setItem('role', data.role);
        console.log('User data stored successfully');
      } catch (storageError) {
        console.error('Failed to store user data:', storageError);
        // Continue anyway, don't block login
      }

      // Handle user role logic with proper error isolation
      if (data.role === 'user') {
        try {
          console.log('Fetching user order data...');
          const orderController = new AbortController();
          const orderTimeoutId = setTimeout(() => orderController.abort(), 15000); // 15 second timeout

          const orderResponse = await fetch(`${backendServer}/api/orders/user-order`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            },
            signal: orderController.signal
          });

          clearTimeout(orderTimeoutId);

          console.log('Order response status:', orderResponse.status);

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            console.log('Order data received:', orderData);
            
            if (orderData) {
              const currentStep = orderData.status === 'confirmed' ? '4' : orderData.step?.toString() || '1';
              try {
                localStorage.setItem('currentStep', currentStep);
                console.log('Current step stored:', currentStep);
              } catch (stepStorageError) {
                console.warn('Failed to store current step:', stepStorageError);
              }
            }
          } else {
            console.warn('Order fetch failed with status:', orderResponse.status);
          }
        } catch (orderError) {
          console.error('Error fetching order (non-blocking):', orderError);
          // Don't throw - this shouldn't block login
        }
      }

      // Navigate based on role
      console.log('Navigating user with role:', data.role);
      if (data.role === 'user') {
        navigate('/dashboard');
      } else {
        navigate('/admin-panel');
      }
      
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });

      // Provide user-friendly error messages
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

  // Improved slide indicator click handler
  const handleSlideChange = (index) => {
    if (!imageLoadErrors.has(index)) {
      setCurrentSlide(index);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 pb-16">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex w-full max-w-7xl h-auto" style={{ minHeight: "700px" }}>
        
        {/* Left Section - Image Carousel */}
        <div className="w-2/3 relative overflow-hidden hidden lg:block">
          {/* Improved loading state */}
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

          {/* Slides with improved error handling */}
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
                // Fallback for failed images
                <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8]"></div>
              )}
              
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
                <h2 className="text-5xl font-light tracking-wider mb-4">{slide.title}</h2>
                <p className="text-xl text-center font-light opacity-90">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Updated slide indicators */}
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

          {/* Enhanced fallback for all images failed */}
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

        {/* Right Section - Login Form (unchanged) */}
        <div className="w-full lg:w-1/3 flex flex-col justify-between p-8" style={{ minHeight: "700px" }}>
          <div></div>
          
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light tracking-wide mb-3 text-[#005670]">
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to access your account</p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{errors.form}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm"
                  placeholder="Enter your email"
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
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm"
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
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-lg text-white hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#005670]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>

              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full py-2.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                New to Henderson Design Group?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                >
                  Get started here
                </button>
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block">
              <div className="text-[#005670] text-2xl tracking-widest font-light">
                HENDERSON
              </div>
              <div className="text-[#005670] text-sm tracking-wider font-light mt-1">
                DESIGN GROUP
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-700 py-3 pointer-events-none">
        <p className="font-medium">Ālia Project by Henderson Design Group</p>
        <p className="text-gray-600">&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
      </div>

      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
    </div>
  );
};

export default Login;