import React from 'react';

export default function Step4AdditionalInfo({ formData, handleChange, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Additional Information</h3>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
        <p className="text-blue-300 text-sm">
          Studying with HighScore Tech means you will have a year internship with HighScore.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Are you interested in undergoing internship with us?</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="internshipInterest"
              value="yes"
              checked={formData.internshipInterest === 'yes'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">Yes, I'm interested</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="internshipInterest"
              value="no"
              checked={formData.internshipInterest === 'no'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">No, I'm not interested</span>
          </label>
        </div>
        {errors.internshipInterest && <p className="text-red-400 text-xs mt-1">{errors.internshipInterest}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Will you need accommodation from us?</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="needAccommodation"
              value="yes"
              checked={formData.needAccommodation === 'yes'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">Yes, I need accommodation</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="needAccommodation"
              value="no"
              checked={formData.needAccommodation === 'no'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">No, I have my own accommodation</span>
          </label>
        </div>
        {errors.needAccommodation && <p className="text-red-400 text-xs mt-1">{errors.needAccommodation}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Will you need our T-shirt?</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="needTshirt"
              value="yes"
              checked={formData.needTshirt === 'yes'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">Yes, I want a T-shirt</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="needTshirt"
              value="no"
              checked={formData.needTshirt === 'no'}
              onChange={handleChange}
              className="text-[#06b6d4] focus:ring-[#06b6d4]"
            />
            <span className="text-white">No, I don't need a T-shirt</span>
          </label>
        </div>
        {errors.needTshirt && <p className="text-red-400 text-xs mt-1">{errors.needTshirt}</p>}
      </div>
    </div>
  );
}
