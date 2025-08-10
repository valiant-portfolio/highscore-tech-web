import React from 'react'
import 'animate.css'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 animate-bounce"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899'][Math.floor(Math.random() * 4)],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center animate__animated animate__fadeIn">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Company Name */}
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent">
              HighScore Tech
            </span>
          </h1>
          <p className="text-[#e2e8f0] text-sm">Loading your experience...</p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#06b6d4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-gray-700 rounded-full h-1 mb-4">
            <div className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] h-1 rounded-full animate-pulse"></div>
          </div>
          <p className="text-[#e2e8f0] text-xs">Initializing components...</p>
        </div>

        {/* Rotating Ring */}
        <div className="mt-8">
          <div className="w-16 h-16 mx-auto border-4 border-transparent border-t-[#2563eb] border-r-[#06b6d4] rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gradient-to-t from-[#2563eb] to-transparent rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.8;
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
