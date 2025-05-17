import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import ChangePasswordModal from './ChangePasswordModal';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
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
    // Clear error when user starts typing
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
  
      // Check for existing order before redirecting
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
              // Store relevant order data
              localStorage.setItem('currentStep', orderData.status === 'confirmed' ? '4' : orderData.step?.toString() || '1');
            }
          }
        } catch (orderError) {
          console.error('Error fetching order:', orderError);
        }
      }
  
      // Redirect based on role
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
      {/* Wider container */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex w-full max-w-screen-xl h-auto" style={{ minHeight: "80vh" }}>
        {/* Left Section - Image Carousel - adjusted width ratio */}
        <div className="w-2/3 relative overflow-hidden hidden md:block" style={{ minHeight: "700px" }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Image with object-fit */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              ></div>
              
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Content */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-white">
                <h2 className="text-4xl sm:text-5xl font-light tracking-wider mb-4">{slide.title}</h2>
                <p className="text-xl text-center font-light opacity-90">{slide.description}</p>
              </div>
            </div>
          ))}

          {/* Slide indicators */}
          <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
                onClick={() => setCurrentSlide(index)}
              ></button>
            ))}
          </div>
        </div>

        {/* Right Section - Login Form - wider panel */}
        <div className="w-full md:w-1/3 flex flex-col justify-between py-12 px-8 md:px-10" style={{ minHeight: "700px" }}>
          {/* Main content in the middle */}
          <div className="w-full max-w-md mx-auto mb-auto mt-auto">
            {/* Welcome message with enhanced styling */}
            <div className="text-center mb-8">
              <h2 
                className="text-3xl md:text-4xl font-light tracking-wide mb-3"
                style={{ color: '#005670' }}
              >
                Welcome Back
              </h2>
              <p className="text-neutral-600 text-base md:text-lg">Sign in to access your account</p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition-all bg-white shadow-sm"
                  style={{ focusRing: '#005670' }}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 ml-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition-all bg-white shadow-sm"
                  style={{ focusRing: '#005670' }}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600 ml-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-base md:text-lg font-medium shadow-md"
                style={{ backgroundColor: '#005670' }}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>

              <div className="flex items-center justify-center text-sm mt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  className="text-[#005670] hover:underline font-medium"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
          
          {/* Company name styled to match logo but with visible color */}
          <div className="text-center w-full mt-auto">
            <div className="inline-block text-center">
              <div className="text-[#005670] text-3xl md:text-4xl tracking-widest font-light">
                HENDERSON
              </div>
              <div className="text-[#005670] text-lg md:text-xl tracking-wider font-light mt-1">
                DESIGN GROUP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with copyright */}
      <div className="fixed bottom-0 left-0 right-0 text-center text-sm text-gray-500 py-2">
        <p>Alia Project by Henderson Design Group</p>
        <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
      </div>

      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
    </div>
  );
};

export default Login;