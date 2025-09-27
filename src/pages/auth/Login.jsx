import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../api/axios";
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { setstudentData } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try { 
      const response = await api.post("/auth/login",formData )
      console.log(response)
        if(response?.success){
          toast.success(response?.message)
          setstudentData(response?.data?.user)
          Cookies.set('token', response?.data?.token);
          window.location.href = "/student"
        return
        }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message)
      // setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

    const closeModal = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899'][Math.floor(Math.random() * 4)],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: `floatParticles2 ${4 + Math.random() * 4}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">

        <button
          onClick={closeModal}
          className="absolute top-2 right-2 transition-transform hover:rotate-90 duration-300  z-10 w-10 h-10 text-white rounded-full flex items-center justify-center "
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] rounded-2xl blur-xl opacity-20 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-black/40 via-[#1a1a2e]/60 to-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gradient-primary mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your HighScore Tech account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black/30 border ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all backdrop-blur-sm`}
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-black/30 border ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 transition-all backdrop-blur-sm`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            {/* <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#06b6d4] hover:text-[#2563eb] transition-colors"
              >
                Forgot your password?
              </Link>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white font-medium py-3 px-6 rounded-lg hover:shadow-2xl hover:shadow-[#2563eb]/25 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
              
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/20 to-[#ec4899]/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-[#06b6d4] hover:text-[#2563eb] font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
