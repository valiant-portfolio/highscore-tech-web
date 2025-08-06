import React from 'react';

export default function Step1PersonalInfo({ formData, handleChange, errors, countries, states, cities }) {

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.firstName ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
            placeholder="Enter first name"
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.lastName ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
            placeholder="Enter last name"
          />
          {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/30 border ${errors.phoneNumber ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          placeholder="Enter phone number"
        />
        {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.country ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.isoCode} value={country.isoCode} className="bg-gray-800">
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            disabled={!formData.country}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.state ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20 disabled:opacity-50`}
          >
            <option value="">Select State</option>
            {states.map(state => (
              <option key={state.isoCode} value={state.isoCode} className="bg-gray-800">
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={!formData.state}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.city ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20 disabled:opacity-50`}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city.name} value={city.name} className="bg-gray-800">
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="2"
          className={`w-full px-3 py-2 bg-black/30 border ${errors.address ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          placeholder="Enter your address"
        />
        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.gender ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          >
            <option value="">Select Gender</option>
            <option value="male" className="bg-gray-800">Male</option>
            <option value="female" className="bg-gray-800">Female</option>
            <option value="other" className="bg-gray-800">Other</option>
          </select>
          {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-black/30 border ${errors.dateOfBirth ? 'border-red-500' : 'border-white/10'} rounded-lg text-white focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/20`}
          />
          {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>
      </div>
    </div>
  );
}
