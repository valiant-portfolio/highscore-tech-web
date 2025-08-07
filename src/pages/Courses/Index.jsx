import React from 'react';
import { School, TrendingUp, EmojiEvents, Group } from '@mui/icons-material';
import Countdown from '../../components/Countdown';
import CourseCard from '../../components/CourseCard';
import { coursesData } from '../../data/coursesData';
import 'animate.css';
import { NavLink, useNavigate } from 'react-router';


const stats = [
  { number: "20+", label: "Graduates", icon: <School className="text-2xl" />, color: "#2563eb" },
  { number: "95%", label: "Job Placement", icon: <TrendingUp className="text-2xl" />, color: "#10b981" },
  { number: "17", label: "Specialized Courses", icon: <EmojiEvents className="text-2xl" />, color: "#f59e0b" },
  { number: "30", label: "Max Class Size", icon: <Group className="text-2xl" />, color: "#ec4899" }
];

export default function Course() {
  const navigate = useNavigate()
  return (
    <div className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-5">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-3 animate-pulse"></span>
              <span className="text-[#60a5fa] text-sm font-medium">Professional Tech Training</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-white mb-8 animate__animated animate__fadeInUp">
              Master Technology
              <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent"> Skills</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#e2e8f0] max-w-4xl mx-auto leading-relaxed mb-12 animate__animated animate__fadeInUp animate__delay-1s">
              Transform your career with our comprehensive tech education programs. 
              Learn from industry experts, work on real projects, and get placed in top companies.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate__animated animate__fadeInUp animate__delay-2s">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:transform hover:scale-110 transition-all duration-300">
                  <div className="flex justify-center mb-2" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors duration-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <Countdown />

      {/* Courses Section */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
              Our <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Courses</span>
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto animate__animated animate__fadeInUp animate__delay-1s">
              Choose from our comprehensive range of technology courses designed to make you industry-ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesData.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
              Why Choose <span className="bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent">HighScore Institute</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Industry Experts",
                description: "Learn from professionals with years of real-world experience",
                icon: "👨‍💻",
                gradient: "from-[#2563eb] to-[#06b6d4]"
              },
              {
                title: "Hands-on Projects",
                description: "Build real applications and create an impressive portfolio",
                icon: "🛠️",
                gradient: "from-[#7c3aed] to-[#ec4899]"
              },
              {
                title: "1-Year Internship",
                description: "Get practical experience working on live projects",
                icon: "💼",
                gradient: "from-[#f97316] to-[#f59e0b]"
              },
              {
                title: "Job Placement",
                description: "95% of our graduates get placed in top tech companies",
                icon: "🎯",
                gradient: "from-[#10b981] to-[#06b6d4]"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-8 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 animate__animated animate__fadeInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                  {feature.title}
                </h3>
                <p className="text-[#e2e8f0] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#2563eb]/10 via-[#06b6d4]/10 to-[#7c3aed]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10 animate__animated animate__fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Join the next generation of tech professionals. Start your journey with HighScore Tech today 
              and unlock unlimited career opportunities in the technology industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={()=> navigate("/register")} className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Your Application
              </button>
              <NavLink to="https://t.me/valiant_joe" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#06b6d4]/30 text-white font-semibold rounded-xl hover:bg-[#06b6d4]/10 transition-all duration-300 transform hover:scale-105">
                Book a Consultation
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
