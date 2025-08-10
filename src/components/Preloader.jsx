import React, { useState, useEffect } from 'react';

const Preloader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress for visual effect
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              backgroundColor: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899', '#f97316'][Math.floor(Math.random() * 5)],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: `floatParticles ${4 + Math.random() * 4}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Rotating Rings */}
      <div className="relative">
        {/* Outer Ring */}
        <div className="absolute inset-0 w-80 h-80 rounded-full border-2 border-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] opacity-30 animate-spin-slow">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#06b6d4] rounded-full shadow-lg animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#2563eb] rounded-full shadow-lg animate-pulse"></div>
          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#7c3aed] rounded-full shadow-lg animate-pulse"></div>
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#ec4899] rounded-full shadow-lg animate-pulse"></div>
        </div>

        {/* Middle Ring */}
        <div className="absolute inset-4 w-72 h-72 rounded-full border border-gradient-to-r from-[#ec4899] via-[#f97316] to-[#f59e0b] opacity-40 animate-spin-reverse">
          <div className="absolute top-4 right-4 w-2 h-2 bg-[#f97316] rounded-full shadow-lg animate-bounce"></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-[#f59e0b] rounded-full shadow-lg animate-bounce"></div>
          <div className="absolute top-4 left-4 w-1 h-1 bg-[#ec4899] rounded-full shadow-lg animate-bounce"></div>
          <div className="absolute bottom-4 right-4 w-1 h-1 bg-[#f97316] rounded-full shadow-lg animate-bounce"></div>
        </div>

        {/* Inner Ring */}
        <div className="absolute inset-8 w-64 h-64 rounded-full border border-[#06b6d4] opacity-50 animate-pulse">
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-[#2563eb]/20 via-[#06b6d4]/20 to-[#7c3aed]/20 backdrop-blur-sm"></div>
        </div>

        {/* Logo Container */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <div className="relative">
            {/* Glowing Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] rounded-full blur-3xl opacity-30 animate-pulse scale-150"></div>
            
            {/* Logo */}
            <div className="relative p-8 animate-float">
              <img 
                src="/assets/short-logo.png" 
                alt="HighScore Tech" 
                className="w-27 h-27 object-contain filter drop-shadow-2xl animate-logoGlow"
              />
            </div>

            {/* Orbiting Elements */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#2563eb] rounded-full shadow-lg animate-bounce"></div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#06b6d4] rounded-full shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#7c3aed] rounded-full shadow-lg animate-bounce" style={{animationDelay: '1s'}}></div>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#ec4899] rounded-full shadow-lg animate-bounce" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>
        </div>

        {/* Scanning Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent animate-scanLine"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#2563eb] to-transparent animate-scanLine" style={{animationDelay: '1s'}}></div>
          <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#7c3aed] to-transparent animate-scanLineVertical"></div>
          <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-[#ec4899] to-transparent animate-scanLineVertical" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute -top-8 -left-8 w-16 h-16 border-l-2 border-t-2 border-[#2563eb] opacity-60 animate-pulse"></div>
        <div className="absolute -top-8 -right-8 w-16 h-16 border-r-2 border-t-2 border-[#06b6d4] opacity-60 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 border-l-2 border-b-2 border-[#7c3aed] opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 -right-8 w-16 h-16 border-r-2 border-b-2 border-[#ec4899] opacity-60 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

    </div>
  );
};

export default Preloader;
