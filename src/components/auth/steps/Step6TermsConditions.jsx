import React from 'react';

export default function Step6TermsConditions({ formData, handleChange, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Terms and Conditions</h3>
      
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-yellow-400 mb-3">Please read and acknowledge the following:</h4>
        
        <div className="space-y-3 text-gray-300">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>If you fail any test during the course, you will be required to go back home.</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Fighting is strictly prohibited and will result in immediate expulsion.</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Neat and professional dressing is required at all times.</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>You must be respectful to everyone including staff, instructors, and fellow students.</p>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="text-[#06b6d4] focus:ring-[#06b6d4] mt-1"
        />
        <label className="text-white">
          I have read and agree to all the terms and conditions stated above.
        </label>
      </div>
      {errors.agreeToTerms && <p className="text-red-400 text-xs mt-1">{errors.agreeToTerms}</p>}
    </div>
  );
}
