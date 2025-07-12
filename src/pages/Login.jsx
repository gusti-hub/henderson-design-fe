import React, { useState, useEffect } from 'react';
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

  // Preload images dengan loading state yang lebih baik
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = slides.map((slide, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
            resolve(index);
          };
          img.onerror = reject;
          img.src = slide.image;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error loading images:', error);
        // Tetap set imagesLoaded ke true untuk menghindari loading forever
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, [slides]);

  // Mulai slide show hanya setelah gambar dimuat
  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, imagesLoaded]);

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
      const response = await fetch(`${backendServer}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }
  
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);
  
      if (data.role === 'user') {
        try {
          const orderResponse = await fetch(`${backendServer}/api/orders/user-order`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
  
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            if (orderData) {
              localStorage.setItem('currentStep', orderData.status === 'confirmed' ? '4' : orderData.step?.toString() || '1');
            }
          }
        } catch (orderError) {
          console.error('Error fetching order:', orderError);
        }
      }
  
      if (data.role === 'user') {
        navigate('/dashboard');
      } else {
        navigate('/admin-panel');
      }
      
    } catch (error) {
      setErrors({
        ...errors,
        form: error.message || 'Invalid credentials'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex w-full max-w-7xl h-auto" style={{ minHeight: "700px" }}>
        
        {/* Left Section - Image Carousel */}
        <div className="w-2/3 relative overflow-hidden hidden lg:block">
          {/* Loading state untuk gambar */}
          {!imagesLoaded && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#005670] mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading images...</p>
                <div className="mt-2 text-sm text-gray-500">
                  {loadedImages.size}/{slides.length} images loaded
                </div>
              </div>
            </div>
          )}

          {/* Slides */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                currentSlide === index && imagesLoaded ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
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
              
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-12 text-white">
                <h2 className="text-5xl font-light tracking-wider mb-4">{slide.title}</h2>
                <p className="text-xl text-center font-light opacity-90">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Slide indicators - hanya muncul setelah gambar dimuat */}
          {imagesLoaded && (
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-white w-8 shadow-lg' 
                      : 'bg-white/50 w-3 hover:bg-white/70'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          )}

          {/* Progress bar untuk loading */}
          {!imagesLoaded && (
            <div className="absolute bottom-8 left-8 right-8 z-30">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(loadedImages.size / slides.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/3 flex flex-col justify-between p-8" style={{ minHeight: "700px" }}>
          <div></div> {/* Spacer */}
          
          {/* Main Login Content */}
          <div className="w-full max-w-sm mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light tracking-wide mb-3 text-[#005670]">
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to access your account</p>
            </div>

            {/* Error Message */}
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
                <p className="text-sm font-medium">{errors.form}</p>
              </div>
            )}

            {/* Login Fields */}
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

              {/* Sign In Button */}
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

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {/* Create Account Button */}
              <button
                onClick={() => navigate('/register')}
                className="w-full py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>

              {/* Change Password Button */}
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full py-2.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Helper Text */}
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
          
          {/* Company Branding */}
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

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-center text-xs text-gray-500 py-2 border-t border-gray-200">
        <p>Ālia Project by Henderson Design Group</p>
        <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
    </div>
  );
};

export default Login;