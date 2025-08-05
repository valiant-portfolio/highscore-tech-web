import React from 'react'
import { Code, Rocket, Security, AutoGraph, CloudDone, Psychology } from '@mui/icons-material'
import 'animate.css'

const welcomeData = [
  {
    title: "Innovation",
    desc: "We craft cutting-edge solutions using the latest technologies to propel your business into the future.",
    icon: <Rocket className="text-6xl" />,
    gradient: "from-[#2563eb] to-[#06b6d4]",
    bgGradient: "from-[#2563eb]/10 to-[#06b6d4]/10",
    borderGradient: "from-[#2563eb]/30 to-[#06b6d4]/30",
    stats: "500+ Projects"
  },
  {
    title: "Excellence", 
    desc: "Every line of code is written with precision, scalability, and performance in mind for enterprise-grade applications.",
    icon: <Code className="text-6xl" />,
    gradient: "from-[#7c3aed] to-[#ec4899]",
    bgGradient: "from-[#7c3aed]/10 to-[#ec4899]/10",
    borderGradient: "from-[#7c3aed]/30 to-[#ec4899]/30",
    stats: "99.9% Uptime"
  },
  {
    title: "Security",
    desc: "We implement robust security measures and best practices to protect your data and ensure compliance.",
    icon: <Security className="text-6xl" />,
    gradient: "from-[#f97316] to-[#f59e0b]",
    bgGradient: "from-[#f97316]/10 to-[#f59e0b]/10",
    borderGradient: "from-[#f97316]/30 to-[#f59e0b]/30",
    stats: "Bank-level Security"
  },
  {
    title: "Analytics",
    desc: "Transform your data into actionable insights with our advanced analytics and machine learning solutions.",
    icon: <AutoGraph className="text-6xl" />,
    gradient: "from-[#10b981] to-[#06b6d4]",
    bgGradient: "from-[#10b981]/10 to-[#06b6d4]/10",
    borderGradient: "from-[#10b981]/30 to-[#06b6d4]/30",
    stats: "Real-time Insights"
  },
  {
    title: "Cloud Native",
    desc: "Leverage the power of cloud computing with our scalable, distributed, and highly available architectures.",
    icon: <CloudDone className="text-6xl" />,
    gradient: "from-[#4f46e5] to-[#7c3aed]",
    bgGradient: "from-[#4f46e5]/10 to-[#7c3aed]/10",
    borderGradient: "from-[#4f46e5]/30 to-[#7c3aed]/30",
    stats: "Auto-scaling"
  },
  {
    title: "AI Powered",
    desc: "Integrate artificial intelligence and machine learning to automate processes and enhance user experiences.",
    icon: <Psychology className="text-6xl" />,
    gradient: "from-[#ec4899] to-[#f97316]",
    bgGradient: "from-[#ec4899]/10 to-[#f97316]/10",
    borderGradient: "from-[#ec4899]/30 to-[#f97316]/30",
    stats: "Smart Solutions"
  }
]

export default function WelcomeHome() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-3 animate-pulse"></span>
            <span className="text-[#60a5fa] text-sm font-medium">Enterprise Solutions</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-8 animate__animated animate__fadeInUp text-white">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent">
             HighScore Tech
            </span>?
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-[#e2e8f0] max-w-4xl mx-auto leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            We are a cutting-edge technology company specializing in enterprise software development, 
            cloud solutions, and digital transformation. Our expert team delivers scalable, secure, 
            and innovative solutions that drive business growth and operational excellence.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 animate__animated animate__fadeInUp animate__delay-2s">
            {[
              { number: "500+", label: "Projects Delivered", color: "#2563eb" },
              { number: "98%", label: "Client Satisfaction", color: "#06b6d4" },
              { number: "24/7", label: "Support Available", color: "#7c3aed" },
              { number: "10+", label: "Years Experience", color: "#ec4899" }
            ].map((stat, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-110 transition-all duration-300">
                <div className="text-2xl lg:text-3xl font-bold mb-2" style={{color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color})`}}>
                  {stat.number}
                </div>
                <div className="text-sm text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          {welcomeData.map((item, index) => (
            <div
              key={item.title}
              className={`relative group overflow-hidden rounded-3xl p-8 backdrop-blur-sm border transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate__animated animate__fadeInUp bg-gradient-to-br ${item.bgGradient} border-gradient-to-r ${item.borderGradient} hover:shadow-2xl border-white/10`}
              style={{
                animationDelay: `${(index + 3) * 0.2}s`
              }}
            >
              {/* Glowing effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${item.gradient} rounded-3xl blur-xl`}></div>
              
              {/* Stats Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
                <span className="text-xs text-white font-medium">{item.stats}</span>
              </div>
              
              {/* Icon */}
              <div className="relative flex justify-center mb-8">
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
              </div>
              
              {/* Title */}
              <h3 className={`text-2xl font-bold text-center mb-4 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                {item.title}
              </h3>
              
              {/* Description */}
              <p className="text-[#e2e8f0] text-center leading-relaxed text-sm group-hover:text-white transition-colors duration-300 mb-6">
                {item.desc}
              </p>

              {/* Learn More Button */}
              <div className="flex justify-center">
                <button className={`px-6 py-2 rounded-xl bg-gradient-to-r ${item.gradient} text-white font-medium text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                  Learn More
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-6 left-6 w-16 h-16 opacity-10">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.gradient} blur-lg`}></div>
              </div>
              <div className="absolute bottom-6 right-6 w-12 h-12 opacity-10">
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.gradient} blur-lg`}></div>
              </div>

              {/* Tech Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`
                }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 animate__animated animate__fadeInUp animate__delay-3s">
          <div className="bg-gradient-to-r from-[#2563eb]/10 via-[#06b6d4]/10 to-[#7c3aed]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Join hundreds of companies that trust HighScore Tech to deliver exceptional software solutions and drive digital innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Your Project
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#06b6d4]/30 text-white font-semibold rounded-xl hover:bg-[#06b6d4]/10 transition-all duration-300 transform hover:scale-105">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
