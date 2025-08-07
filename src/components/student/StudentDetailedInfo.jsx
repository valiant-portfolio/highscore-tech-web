import React, { useState } from 'react'
import { Person, Email, Phone, LocationOn, Computer, School, Work, Home, ExpandMore, ExpandLess } from '@mui/icons-material'
import 'animate.css'

export default function StudentDetailedInfo({ studentData }) {
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: false,
    learning: false,
    preferences: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const InfoSection = ({ title, icon, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors duration-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#06b6d4] mr-4">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          {isExpanded ? (
            <ExpandLess className="text-[#60a5fa]" />
          ) : (
            <ExpandMore className="text-[#60a5fa]" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 animate__animated animate__fadeIn">
            {children}
          </div>
        )}
      </div>
    );
  };

  const InfoRow = ({ label, value, icon }) => (
    <div className="flex items-center py-3 border-b border-white/10 last:border-b-0">
      {icon && <div className="text-[#60a5fa] mr-3">{icon}</div>}
      <div className="flex-1">
        <p className="text-[#e2e8f0] text-sm">{label}</p>
        <p className="text-white font-medium">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate__animated animate__fadeInUp">
      {/* Personal Information */}
      <InfoSection 
        title="Personal Information" 
        icon={<Person className="text-white text-xl" />}
        sectionKey="personal"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0">
            <InfoRow label="First Name" value={studentData?.firstName} />
            <InfoRow label="Last Name" value={studentData?.lastName} />
            <InfoRow label="Gender" value={studentData?.gender} />
            <InfoRow label="Date of Birth" value={studentData?.dateOfBirth ? formatDate(studentData.dateOfBirth) : null} />
          </div>
          <div className="space-y-0">
            <InfoRow label="Student ID" value={studentData?.studentId} />
            <InfoRow label="Registration Date" value={studentData?.registrationDate ? formatDate(studentData.registrationDate) : null} />
            <InfoRow label="Course Start Date" value={studentData?.courseStartDate ? formatDate(studentData.courseStartDate) : null} />
            <InfoRow label="Expected Completion" value={studentData?.courseEndDate ? formatDate(studentData.courseEndDate) : null} />
          </div>
        </div>
      </InfoSection>

      {/* Contact Information */}
      <InfoSection 
        title="Contact & Location" 
        icon={<LocationOn className="text-white text-xl" />}
        sectionKey="contact"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0">
            <InfoRow 
              label="Email Address" 
              value={studentData?.email} 
              icon={<Email className="text-base" />}
            />
            <InfoRow 
              label="Phone Number" 
              value={studentData?.phoneNumber} 
              icon={<Phone className="text-base" />}
            />
            <InfoRow label="Address" value={studentData?.address} />
          </div>
          <div className="space-y-0">
            <InfoRow label="Country" value={studentData?.country} />
            <InfoRow label="State/Province" value={studentData?.state} />
            <InfoRow label="City" value={studentData?.city} />
          </div>
        </div>
      </InfoSection>

      {/* Learning Setup */}
      <InfoSection 
        title="Learning Setup & Equipment" 
        icon={<Computer className="text-white text-xl" />}
        sectionKey="learning"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0">
            <InfoRow label="Learning Mode" value={studentData?.learningMode === 'online' ? 'Online Learning' : 'Offline Learning'} />
            <InfoRow label="Has Laptop" value={studentData?.hasLaptop === 'yes' ? 'Yes' : 'No'} />
            {studentData?.hasLaptop === 'yes' && (
              <>
                <InfoRow label="Laptop Model" value={studentData?.laptopModel} />
                <InfoRow label="RAM Capacity" value={studentData?.laptopRam} />
              </>
            )}
          </div>
          <div className="space-y-0">
            <InfoRow label="Selected Course" value={studentData?.course?.name} />
            <InfoRow label="Course Duration" value={`${studentData?.course?.duration} months`} />
            <InfoRow label="Course Level" value={studentData?.course?.level} />
          </div>
        </div>
      </InfoSection>

      {/* Preferences & Interests */}
      <InfoSection 
        title="Preferences & Additional Info" 
        icon={<School className="text-white text-xl" />}
        sectionKey="preferences"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0">
            <InfoRow 
              label="Internship Interest" 
              value={studentData?.internshipInterest === 'yes' ? 'Interested in Internship' : 'Not Interested'} 
              icon={<Work className="text-base" />}
            />
            <InfoRow 
              label="Accommodation Needed" 
              value={studentData?.needAccommodation === 'yes' ? 'Accommodation Required' : 'No Accommodation Needed'} 
              icon={<Home className="text-base" />}
            />
            {studentData?.needAccommodation === 'yes' && (
              <InfoRow label="Room Type Preference" value={studentData?.roomType} />
            )}
          </div>
          <div className="space-y-0">
            <InfoRow label="T-shirt Required" value={studentData?.needTshirt === 'yes' ? 'Yes' : 'No'} />
            <InfoRow label="Terms Agreement" value={studentData?.agreeToTerms ? 'Agreed' : 'Not Agreed'} />
          </div>
        </div>

        {/* Emergency Contact Section */}
        {studentData?.emergencyContact && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[#ec4899]/10 to-[#f97316]/10 rounded-xl border border-[#ec4899]/30">
            <h4 className="text-[#ec4899] font-semibold mb-3 flex items-center">
              <Phone className="mr-2 text-base" />
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Contact Name" value={studentData.emergencyContact.name} />
              <InfoRow label="Relationship" value={studentData.emergencyContact.relationship} />
              <InfoRow label="Phone Number" value={studentData.emergencyContact.phone} />
              <InfoRow label="Email" value={studentData.emergencyContact.email} />
            </div>
          </div>
        )}

        {/* Student Notes */}
        {studentData?.notes && (
          <div className="mt-6 p-4 bg-gradient-to-r from-[#2563eb]/10 to-[#06b6d4]/10 rounded-xl border border-[#2563eb]/30">
            <h4 className="text-[#60a5fa] font-semibold mb-3">Additional Notes</h4>
            <p className="text-[#e2e8f0] leading-relaxed">{studentData.notes}</p>
          </div>
        )}
      </InfoSection>
    </div>
  )
}
