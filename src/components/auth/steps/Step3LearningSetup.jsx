import React from 'react';

export default function Step3LearningSetup({ formData, handleChange, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Learning Setup</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Learning Mode</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="learningMode"
              value="online"
              checked={formData.learningMode === 'online'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">Online Learning</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="learningMode"
              value="offline"
              checked={formData.learningMode === 'offline'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">Offline Learning</span>
          </label>
        </div>
        {errors.learningMode && <p className="text-red-400 text-xs mt-1">{errors.learningMode}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Do you have a working laptop?</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="hasLaptop"
              value="yes"
              checked={formData.hasLaptop === 'yes'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">Yes, I have a laptop</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="hasLaptop"
              value="no"
              checked={formData.hasLaptop === 'no'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">No, I don't have a laptop</span>
          </label>
        </div>
        {errors.hasLaptop && <p className="text-red-400 text-xs mt-1">{errors.hasLaptop}</p>}
      </div>

      {formData.hasLaptop === 'yes' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Laptop Model</label>
            <input
              type="text"
              name="laptopModel"
              value={formData.laptopModel}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-black/30 border ${errors.laptopModel ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
              placeholder="e.g., MacBook Pro, Dell XPS, HP Pavilion"
            />
            {errors.laptopModel && <p className="text-red-400 text-xs mt-1">{errors.laptopModel}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">RAM Size</label>
            <select
              name="laptopRam"
              value={formData.laptopRam}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-black/30 border ${errors.laptopRam ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
            >
              <option value="">Select RAM Size</option>
              <option value="4GB" className="bg-gray-800">4GB</option>
              <option value="8GB" className="bg-gray-800">8GB</option>
              <option value="16GB" className="bg-gray-800">16GB</option>
              <option value="32GB" className="bg-gray-800">32GB or more</option>
            </select>
            {errors.laptopRam && <p className="text-red-400 text-xs mt-1">{errors.laptopRam}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
