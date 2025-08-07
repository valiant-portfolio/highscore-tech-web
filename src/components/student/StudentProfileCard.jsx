import React from 'react'
import { Person, School, CalendarToday, CheckCircle, AccessTime } from '@mui/icons-material'
import 'animate.css'
import { Link, useNavigate } from 'react-router';

export default function StudentProfileCard({ studentData }) {
  const navigate = useNavigate()
  const getProgressPercentage = () => {
    if (!studentData?.progress) return 0;
    const { currentModule, totalModules } = studentData.progress;
    return Math.round((currentModule / totalModules) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!studentData?.courseEndDate) return 0;
    const endDate = new Date(studentData.courseEndDate);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className="sticky top-6">
      {/* Main Profile Card */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate__animated animate__fadeInRight">
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl blur-xl"></div>
        
        {/* Profile Header */}
        <div className="relative text-center mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-full flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
            <Person className="text-4xl text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {studentData?.firstName} {studentData?.lastName}
          </h2>
          <p className="text-[#60a5fa] text-sm font-medium">Student ID: {studentData?.studentId}</p>
        </div>

        {/* Course Info */}
        <div className="relative mb-6">
          <div className="flex items-center mb-3">
            <School className="text-[#06b6d4] mr-3" />
            <div>
              <h3 className="text-white font-semibold text-sm">{studentData?.course?.name}</h3>
              <p className="text-[#e2e8f0] text-xs">{studentData?.course?.duration} months program</p>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="flex items-center justify-between">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${getProgressPercentage() * 1.75} 175`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{getProgressPercentage()}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#06b6d4] text-xs font-medium">Course Progress</p>
              <p className="text-white text-sm font-semibold">
                Module {studentData?.progress?.currentModule} of {studentData?.progress?.totalModules}
              </p>
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="relative space-y-3">
          <div className="flex items-center text-sm">
            <CalendarToday className="text-[#ec4899] mr-3 text-base" />
            <div>
              <p className="text-[#e2e8f0] text-xs">Registration Date</p>
              <p className="text-white font-medium">{formatDate(studentData?.registrationDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <AccessTime className="text-[#f97316] mr-3 text-base" />
            <div>
              <p className="text-[#e2e8f0] text-xs">Course Started</p>
              <p className="text-white font-medium">{formatDate(studentData?.courseStartDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <CheckCircle className="text-[#10b981] mr-3 text-base" />
            <div>
              <p className="text-[#e2e8f0] text-xs">Expected Completion</p>
              <p className="text-white font-medium">{formatDate(studentData?.courseEndDate)}</p>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            studentData?.paymentStatus === 'current' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {studentData?.paymentStatus === 'current' ? 'Payment Current' : 'Payment Due'}
          </span>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            studentData?.attendance >= 80 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {studentData?.attendance}% Attendance
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3 text-sm">Quick Actions</h3>
        <div className="space-y-2">
          <Link to="https://t.me/valiant_joe" className="w-full px-4 py-2 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            Contact Instructor
          </Link>
        </div>
      </div>
    </div>
  )
}
