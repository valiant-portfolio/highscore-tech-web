import React from 'react';
import { coursesData, formatPrice } from '../../../data/coursesData';

export default function Step5CourseSelection({ formData, handleChange, errors }) {
  const accommodationOptions = [
    { value: '25000', label: 'Premium Room - ₦25,000/month', description: 'Single room with private bathroom and AC' },
    { value: '20000', label: 'Standard Room - ₦20,000/month', description: 'Shared room with private bathroom' },
    { value: '15000', label: 'Basic Room - ₦15,000/month', description: 'Shared room with shared facilities' }
  ];

  const selectedCourseDetails = coursesData.find(course => course.name === formData.selectedCourse);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Course Selection</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Which course are you interested in?</label>
        <select
          name="selectedCourse"
          value={formData.selectedCourse}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/30 border ${errors.selectedCourse ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
        >
          <option value="">Select a course</option>
          {coursesData.map(course => (
            <option key={course.id} value={course.name} className="bg-gray-800">
              {course.name}
            </option>
          ))}
        </select>
        {errors.selectedCourse && <p className="text-red-400 text-xs mt-1">{errors.selectedCourse}</p>}
      </div>

      {selectedCourseDetails && (
        <div className="bg-gradient-to-r from-[#2563eb]/20 to-[#7c3aed]/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{selectedCourseDetails.icon}</span>
            <h4 className="font-semibold text-white">{selectedCourseDetails.name}</h4>
          </div>
          <p className="text-gray-300 text-sm mb-3">{selectedCourseDetails.shortDescription}</p>
          <div className="flex space-x-4 text-sm">
            <span className="text-green-400">Price: {formatPrice(selectedCourseDetails.price)}</span>
            <span className="text-blue-400">Duration: {selectedCourseDetails.duration} months</span>
            <span className="text-purple-400">Level: {selectedCourseDetails.level}</span>
          </div>
        </div>
      )}

      {formData.needAccommodation === 'yes' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select your accommodation type</label>
          <div className="space-y-3">
            {accommodationOptions.map(option => (
              <label key={option.value} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg border border-white/10 hover:border-[#06b6d4]/30 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="roomType"
                  value={option.value}
                  checked={formData.roomType === option.value}
                  onChange={handleChange}
                  className="text-[#06b6d4] focus:ring-[#06b6d4] mt-1"
                />
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.roomType && <p className="text-red-400 text-xs mt-1">{errors.roomType}</p>}
        </div>
      )}
    </div>
  );
}
