import React, { useState, useEffect } from 'react';
import { AccessTime, CalendarToday, Group } from '@mui/icons-material';
import 'animate.css';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const targetDate = new Date('2025-08-25T09:00:00').getTime();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const TimeUnit = ({ value, label, gradient }) => (
    <div className="relative group">
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-2xl transform group-hover:scale-105 transition-all duration-300 border border-white/20`}>
        <div className="text-center">
          <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 animate__animated animate__pulse animate__infinite">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-white/80 text-sm font-medium uppercase tracking-wider">
            {label}
          </div>
        </div>
        
        {/* Glowing effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}></div>
      </div>
    </div>
  );

  return (
    <div className="relative py-20 px-6 overflow-hidden">
      {/* Background Animations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <CalendarToday className="w-4 h-4 text-[#06b6d4] mr-3" />
            <span className="text-[#60a5fa] text-sm font-medium">Next Batch Starting Soon</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 animate__animated animate__fadeInUp">
            Enrollment Closes In
          </h2>
          
          <p className="text-lg text-[#e2e8f0] max-w-3xl mx-auto mb-8 animate__animated animate__fadeInUp animate__delay-1s">
            Don't miss your chance to join our next cohort starting on <span className="text-[#06b6d4] font-semibold">August 25th, 2025</span>. 
            Limited seats available for personalized attention and mentorship.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate__animated animate__fadeInUp animate__delay-2s">
          <TimeUnit 
            value={timeLeft.days} 
            label="Days" 
            gradient="from-[#2563eb] to-[#06b6d4]" 
          />
          <TimeUnit 
            value={timeLeft.hours} 
            label="Hours" 
            gradient="from-[#7c3aed] to-[#ec4899]" 
          />
          <TimeUnit 
            value={timeLeft.minutes} 
            label="Minutes" 
            gradient="from-[#f97316] to-[#f59e0b]" 
          />
          <TimeUnit 
            value={timeLeft.seconds} 
            label="Seconds" 
            gradient="from-[#10b981] to-[#06b6d4]" 
          />
        </div>

        {/* Batch Information */}
        <div className="bg-gradient-to-r from-[#2563eb]/10 via-[#06b6d4]/10 to-[#7c3aed]/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10 animate__animated animate__fadeInUp animate__delay-3s">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              August 2025 Batch Details
            </h3>
            <p className="text-[#e2e8f0] text-lg">Join hundreds of students in our most comprehensive tech training program</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarToday className="text-white text-2xl" />
              </div>
              <h4 className="text-white font-semibold mb-2">Start Date</h4>
              <p className="text-[#94a3b8]">August 25, 2025</p>
              <p className="text-[#94a3b8] text-sm">9:00 AM WAT</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Group className="text-white text-2xl" />
              </div>
              <h4 className="text-white font-semibold mb-2">Batch Size</h4>
              <p className="text-[#94a3b8]">30 Students Max</p>
              <p className="text-[#94a3b8] text-sm">Per Course</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#f97316] to-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AccessTime className="text-white text-2xl" />
              </div>
              <h4 className="text-white font-semibold mb-2">Duration</h4>
              <p className="text-[#94a3b8]">6-10 Months</p>
              <p className="text-[#94a3b8] text-sm">Depending on Course</p>
            </div>
          </div>

          {/* Early Bird Offer */}
          <div className="bg-gradient-to-r from-[#10b981]/20 to-[#06b6d4]/20 rounded-2xl p-6 border border-[#10b981]/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-2">🎉 Early Bird Special</h4>
                <p className="text-[#e2e8f0]">Register now and save <span className="text-[#10b981] font-semibold">20%</span> on all courses</p>
                <p className="text-[#94a3b8] text-sm mt-1">Offer valid until July 25, 2025</p>
              </div>
              <div className="text-right">
                <div className="text-[#10b981] text-2xl font-bold">20% OFF</div>
                <div className="text-[#94a3b8] text-sm">Limited Time</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Reserve Your Spot Now
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#06b6d4]/30 text-white font-semibold rounded-xl hover:bg-[#06b6d4]/10 transition-all duration-300 transform hover:scale-105">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
