import React, { useState, useEffect } from 'react'
import { Dashboard, Person, Payment, Timeline, EmojiEvents, Menu, Close } from '@mui/icons-material'
import StudentProfileCard from '../../components/student/StudentProfileCard'
import StudentDetailedInfo from '../../components/student/StudentDetailedInfo'
import PaymentTracker from '../../components/student/PaymentTracker'
import ProgressTracker from '../../components/student/ProgressTracker'
import Certificate from '../../components/student/Certificate'

import 'animate.css'
import { useAuth } from '../../context/AuthContext'
import SimpleLoader from '../../components/SimpleLoader'

export default function StudentDashboard() {
  const { studentData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Dashboard className="text-lg" /> },
    { id: 'profile', label: 'Profile Details', icon: <Person className="text-lg" /> },
    { id: 'payments', label: 'Payments', icon: <Payment className="text-lg" /> },
    { id: 'progress', label: 'Progress', icon: <Timeline className="text-lg" /> },
    // { id: 'certificate', label: 'Certificate', icon: <EmojiEvents className="text-lg" /> }
  ];
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome back, {studentData.firstName}! 👋
              </h2>
              <p className="text-[#e2e8f0] mb-6">
                Here's an overview of your learning journey at HighScore Tech.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 rounded-xl p-4 border border-[#2563eb]/30">
                  <h3 className="text-[#06b6d4] text-sm font-medium">Course Progress</h3>
                  <p className="text-2xl font-bold text-white">
                    {Math.round((studentData.progress.currentModule / studentData.progress.totalModules) * 100)}%
                  </p>
                </div>
                <div className="bg-gradient-to-r from-[#10b981]/20 to-[#059669]/20 rounded-xl p-4 border border-[#10b981]/30">
                  <h3 className="text-[#10b981] text-sm font-medium">Average Grade</h3>
                  <p className="text-2xl font-bold text-white">{studentData.progress.averageGrade}%</p>
                </div>
                <div className="bg-gradient-to-r from-[#f97316]/20 to-[#f59e0b]/20 rounded-xl p-4 border border-[#f97316]/30">
                  <h3 className="text-[#f97316] text-sm font-medium">Attendance</h3>
                  <p className="text-2xl font-bold text-white">{studentData.attendance}%</p>
                </div>
                <div className="bg-gradient-to-r from-[#ec4899]/20 to-[#f472b6]/20 rounded-xl p-4 border border-[#ec4899]/30">
                  <h3 className="text-[#ec4899] text-sm font-medium">Days Left</h3>
                  <p className="text-2xl font-bold text-white">
                    {Math.ceil((new Date(studentData.courseEndDate) - new Date()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Recent Activity Preview */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {studentData.progress.recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-white/5 rounded-xl">
                    <div className="w-2 h-2 bg-[#06b6d4] rounded-full mr-4"></div>
                    <div>
                      <p className="text-white font-medium text-sm">{activity.title}</p>
                      <p className="text-[#e2e8f0] text-xs">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'profile':
        return <StudentDetailedInfo studentData={studentData} />;
      case 'payments':
        return <PaymentTracker studentData={studentData} />;
      case 'progress':
        return <ProgressTracker studentData={studentData} />;
      case 'certificate':
        return <Certificate studentData={studentData} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
     <SimpleLoader />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <h1 className="text-xl font-bold text-white">Student Dashboard</h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {sidebarOpen ? <Close /> : <Menu />}
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Profile Card */}
            <div className="p-2 h-full overflow-y-auto">
              <StudentProfileCard studentData={studentData} />
            </div>
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {/* Navigation Tabs */}
            <div className="sticky top-0 z-30 bg-black/40 backdrop-blur-xl border-b border-white/10 p-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white shadow-lg'
                        : 'bg-white/10 text-[#e2e8f0] hover:bg-white/20'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
