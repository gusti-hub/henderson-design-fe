import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigate = useNavigate();

  const slides = [
    {
      image: "./public/images/pict_1.jpg", // Using placeholder as required
      title: "LUXURY LIVING",
      description: "Creating spaces that inspire and elevate your lifestyle"
    },
    {
      image: "./public/images/pict_2.jpg",
      title: "THOUGHTFUL DESIGN",
      description: "Every detail carefully curated for your perfect home"
    },
    {
      image: "./public/images/pict_3.png",
      title: "EXPERT CRAFTSMANSHIP",
      description: "Bringing luxury and comfort to every corner"
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="min-h-screen flex bg-white">
      {/* Left Section - Image Carousel */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Dark overlay
            <div className="absolute inset-0 bg-[#005670] opacity-60 z-10"></div> */}
            
            {/* Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            ></div>
            
            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-12 text-white">
              <h2 className="text-4xl font-light tracking-wider mb-4">{slide.title}</h2>
              <p className="text-lg text-center font-light opacity-90">{slide.description}</p>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? 'bg-white w-6' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-light tracking-wide mb-2"
              style={{ color: '#005670' }}
            >
              Welcome Back
            </h2>
            <p className="text-neutral-600">Sign in to access your account</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition-all bg-white"
                style={{ focusRing: '#005670' }}
                placeholder="Email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-opacity-50 outline-none transition-all bg-white"
                style={{ focusRing: '#005670' }}
                placeholder="Password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 border-neutral-300 rounded focus:ring-2 focus:ring-opacity-50"
                  style={{ color: '#005670' }}
                />
                <span className="ml-2 text-sm text-neutral-600">Remember Me</span>
              </label>
              <button 
                type="button" 
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: '#005670' }}
              >
                Forgot Password?
              </button>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: '#005670' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;