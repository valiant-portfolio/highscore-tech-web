import React from 'react'

export default function SimpleLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Simple animated logo */}
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-transparent border-t-[#2563eb] border-r-[#06b6d4] rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-b-[#7c3aed] border-l-[#ec4899] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        
        {/* Company name */}
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent mb-2">
          HighScore Tech
        </h2>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#06b6d4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
