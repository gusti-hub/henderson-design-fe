import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, ArrowLeft, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';
import ChangePasswordModal from './ChangePasswordModal';

const DesignerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();

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

      // Only allow admin and designer roles
      console.log(data.role)
      if (data.role !== 'admin' && data.role !== 'designer' && data.role !== 'user') {
        throw new Error('Unauthorized access. This portal is for designers only.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('name', data.name);
      localStorage.setItem('role', data.role);

      navigate('/admin-panel');
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <button
          onClick={() => navigate('/')}
          className="text-white/90 hover:text-white flex items-center gap-2 text-sm tracking-wide transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-[#005670] text-3xl tracking-widest font-light mb-2">
              HENDERSON
            </div>
            <div className="text-[#005670] text-sm tracking-wider font-light mb-6">
              DESIGN GROUP
            </div>
            <h2 className="text-2xl font-light tracking-wide text-[#005670] mb-2">
              Designer Portal
            </h2>
            <p className="text-gray-600 text-sm">Sign in to access the admin panel</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg">
              <p className="text-sm font-medium">{errors.form}</p>
            </div>
          )}

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
                placeholder="designer@hendersondesign.com"
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

          <div className="mt-6">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full py-2.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Key className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>This portal is for Henderson Design Group designers and administrators only.</p>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
        </div>
      </div>

      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
    </div>
  );
};

export default DesignerLogin;
