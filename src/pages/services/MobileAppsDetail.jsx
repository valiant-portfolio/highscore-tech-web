import React from 'react'
import { PhoneAndroid, Apple, Android, Code, Speed, Security, Cloud, Analytics } from '@mui/icons-material'
import 'animate.css'
import { useSEO } from '../../hooks/useSEO'

export default function MobileAppsDetail() {
  useSEO({
    title: "HighScore Tech Mobile App Development | React Native & Flutter Apps | Nigeria",
    description: "HighScore Tech develops high-performance mobile applications using React Native, Flutter, and native technologies. Premier mobile app development company in Nigeria delivering exceptional iOS and Android apps.",
    keywords: "HighScore Tech mobile development, React Native apps Nigeria, Flutter development Lagos, mobile app development company Nigeria, iOS app development, Android app development, cross-platform mobile apps",
    canonical: "https://www.highzcore.tech/services/mobile-apps",
    ogTitle: "HighScore Tech Mobile App Development | Cross-Platform Excellence",
    ogDescription: "Leading mobile app development company in Nigeria. We build native and cross-platform apps with React Native, Flutter for iOS and Android.",
    ogImage: "https://www.highzcore.tech/images/mobile-apps-og.jpg",
    ogUrl: "https://www.highzcore.tech/services/mobile-apps"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#10b981] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#10b981]/20 to-[#06b6d4]/20 border border-[#10b981]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <PhoneAndroid className="text-[#10b981] mr-3" />
            <span className="text-[#10b981] text-sm font-medium">Mobile Development</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 animate__animated animate__fadeInUp">
            Mobile Apps That{' '}
            <span className="bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">
              Scale & Perform
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#e2e8f0] max-w-4xl mx-auto leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            We develop native and cross-platform mobile applications using React Native, Flutter, and native technologies. 
            Our apps deliver exceptional user experiences with enterprise-grade performance and security.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 animate__animated animate__fadeInUp animate__delay-2s">
            <button className="px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Start Your Mobile Project
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#10b981]/30 text-white font-semibold rounded-xl hover:bg-[#10b981]/10 transition-all duration-300">
              View Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Cross-Platform Excellence
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              Build once, deploy everywhere. Our cross-platform approach ensures your app reaches maximum audience 
              while maintaining native performance and user experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Apple className="text-4xl" />,
                title: "iOS Development",
                desc: "Native iOS apps with Swift and Objective-C for optimal performance",
                color: "from-[#10b981] to-[#059669]"
              },
              {
                icon: <Android className="text-4xl" />,
                title: "Android Development", 
                desc: "Native Android apps with Kotlin and Java for Google Play Store",
                color: "from-[#06b6d4] to-[#0891b2]"
              },
              {
                icon: <Code className="text-4xl" />,
                title: "React Native",
                desc: "Cross-platform apps with single codebase and native performance",
                color: "from-[#8b5cf6] to-[#7c3aed]"
              },
              {
                icon: <Speed className="text-4xl" />,
                title: "Flutter",
                desc: "High-performance apps with Google's UI toolkit and Dart",
                color: "from-[#f59e0b] to-[#d97706]"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} inline-block mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-[#e2e8f0] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#10b981]/10 to-[#06b6d4]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Advanced Mobile Technologies
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              We leverage cutting-edge mobile technologies and frameworks to deliver powerful, 
              scalable, and secure mobile applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Security className="text-4xl" />,
                title: "Security First",
                desc: "End-to-end encryption, secure authentication, and data protection compliance",
                features: ["Biometric Authentication", "SSL/TLS Encryption", "OWASP Compliance", "Secure Data Storage"]
              },
              {
                icon: <Cloud className="text-4xl" />,
                title: "Cloud Integration",
                desc: "Seamless integration with cloud services for scalability and reliability",
                features: ["AWS/Azure/GCP", "Real-time Sync", "Offline Capabilities", "Auto Scaling"]
              },
              {
                icon: <Analytics className="text-4xl" />,
                title: "Analytics & Insights",
                desc: "Advanced analytics and monitoring for data-driven mobile experiences",
                features: ["User Behavior Tracking", "Performance Monitoring", "Crash Reporting", "A/B Testing"]
              }
            ].map((tech, index) => (
              <div key={index} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#06b6d4] inline-block mb-6">
                  <div className="text-white">
                    {tech.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4">{tech.title}</h3>
                <p className="text-[#e2e8f0] mb-6">{tech.desc}</p>
                <ul className="space-y-2">
                  {tech.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-[#e2e8f0]">
                      <div className="w-2 h-2 bg-[#10b981] rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Mobile Development Process
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              From concept to App Store, we follow a proven development process that ensures 
              your mobile app succeeds in the competitive mobile marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Strategy & Planning", desc: "Market research, user personas, and technical architecture planning" },
              { step: "02", title: "Design & Prototype", desc: "UI/UX design, wireframing, and interactive prototype creation" },
              { step: "03", title: "Development & Testing", desc: "Agile development with continuous testing and quality assurance" },
              { step: "04", title: "Launch & Support", desc: "App store submission, marketing support, and ongoing maintenance" }
            ].map((phase, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    {phase.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] opacity-30"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-4">{phase.title}</h3>
                <p className="text-[#e2e8f0] leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#10b981]/10 via-[#06b6d4]/10 to-[#8b5cf6]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build Your Mobile App?
            </h2>
            <p className="text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Transform your ideas into powerful mobile applications that engage users and drive business growth. 
              Let's discuss your mobile app project today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Your Project
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#10b981]/30 text-white font-semibold rounded-xl hover:bg-[#10b981]/10 transition-all duration-300">
                Get Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
