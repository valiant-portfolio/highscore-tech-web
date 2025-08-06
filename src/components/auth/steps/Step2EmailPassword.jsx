import React from 'react';

export default function Step2EmailPassword({ formData, handleChange, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Email & Password</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/30 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          placeholder="Enter your email"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/30 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          placeholder="Create a strong password"
        />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters with uppercase, lowercase, and number</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/30 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
      </div>
    </div>
  );
}
