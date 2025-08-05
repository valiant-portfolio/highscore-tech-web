import React from 'react';
import { 
  Code, 
  School, 
  LocationOn, 
  Star, 
  TrendingUp, 
  Group, 
  EmojiEvents,
  Psychology,
  CloudDone,
  Security,
  PhoneAndroid,
  Language,
  CurrencyBitcoin,
  SportsEsports,
  DataObject,
  SmartToy
} from '@mui/icons-material';
import 'animate.css';

const services = [
  {
    icon: <Language className="text-4xl" />,
    title: "Web Applications",
    description: "Full-stack web development with modern frameworks and technologies",
    gradient: "from-[#2563eb] to-[#06b6d4]"
  },
  {
    icon: <PhoneAndroid className="text-4xl" />,
    title: "Mobile Applications", 
    description: "Cross-platform mobile apps for iOS and Android using latest technologies",
    gradient: "from-[#7c3aed] to-[#ec4899]"
  },
  {
    icon: <SmartToy className="text-4xl" />,
    title: "Artificial Intelligence",
    description: "AI-powered solutions and machine learning implementations",
    gradient: "from-[#f97316] to-[#f59e0b]"
  },
  {
    icon: <CurrencyBitcoin className="text-4xl" />,
    title: "Blockchain Development",
    description: "Smart contracts, DeFi protocols, and blockchain applications",
    gradient: "from-[#10b981] to-[#06b6d4]"
  },
  {
    icon: <SportsEsports className="text-4xl" />,
    title: "Gaming & Casino Systems",
    description: "Interactive gaming platforms and casino management systems",
    gradient: "from-[#ec4899] to-[#f97316]"
  },
  {
    icon: <Code className="text-4xl" />,
    title: "Custom Software",
    description: "Tailored software solutions for enterprise and business needs",
    gradient: "from-[#4f46e5] to-[#7c3aed]"
  }
];

const courses = [
  { name: "Frontend Development", icon: "🎨", duration: "6 months" },
  { name: "Backend Development", icon: "⚙️", duration: "6 months" },
  { name: "Data Science", icon: "📊", duration: "8 months" },
  { name: "Artificial Intelligence", icon: "🤖", duration: "10 months" },
  { name: "Machine Learning", icon: "🧠", duration: "8 months" },
  { name: "Mobile App Development", icon: "📱", duration: "7 months" },
  { name: "Blockchain Development", icon: "⛓️", duration: "9 months" },
  { name: "Web Gaming Development", icon: "🎮", duration: "8 months" }
];

const stats = [
  { number: "500+", label: "Projects Completed", icon: <EmojiEvents className="text-2xl" /> },
  { number: "1000+", label: "Students Trained", icon: <School className="text-2xl" /> },
  { number: "50+", label: "Hired Graduates", icon: <Group className="text-2xl" /> },
  { number: "3+", label: "Years of Excellence", icon: <TrendingUp className="text-2xl" /> }
];

export default function About() {
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-3 animate-pulse"></span>
              <span className="text-[#60a5fa] text-sm font-medium">About HighScore Tech</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-white mb-8 animate__animated animate__fadeInUp">
              Transforming Ideas Into 
              <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent"> Digital Reality</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#e2e8f0] max-w-4xl mx-auto leading-relaxed mb-12 animate__animated animate__fadeInUp animate__delay-1s">
              Since 2022, HighScore Tech has been at the forefront of software innovation, 
              delivering cutting-edge solutions and nurturing the next generation of tech talents.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate__animated animate__fadeInUp animate__delay-2s">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:transform hover:scale-110 transition-all duration-300">
                  <div className="flex justify-center mb-2 text-[#06b6d4]">
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

      {/* Founder Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate__animated animate__fadeInLeft">
              <div className="bg-gradient-to-br from-[#2563eb]/10 to-[#06b6d4]/10 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-full blur-sm opacity-75"></div>
                  <img 
                    src="/assets/gallery/ceo.jpg" 
                    alt="Victor Otung - CEO" 
                    className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl relative z-10"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Victor Joseph Otung  <span className="text-[#06b6d4] text-sm font-medium mb-2">( Valiant Joe )</span></h3>
                 
                  <p className="text-[#94a3b8] text-sm">Founder & CEO</p>
                  <div className="mt-4 space-y-2 text-sm text-[#e2e8f0]">
                    <p>🎓 University of Uyo Graduate</p>
                    <p>📐 Faculty of Mathematics</p>
                    <p>Akwa Ibom State, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate__animated animate__fadeInRight">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Meet Our <span className="bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent">Visionary Leader</span>
              </h2>
              
              <p className="text-lg text-[#e2e8f0] leading-relaxed mb-6">
                Founded in 2022 by Victor Otung, a passionate mathematician turned tech entrepreneur, 
                HighScore Tech emerged from a vision to bridge the gap between academic excellence and 
                real-world software development.
              </p>
              
              <p className="text-lg text-[#e2e8f0] leading-relaxed mb-8">
                Known in the tech community as "Valiant Joe," Victor's mathematical background brings 
                a unique analytical approach to software development, ensuring our solutions are not 
                just functional, but optimally efficient and scalable.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <Star className="text-[#f59e0b] mb-2" />
                  <div className="text-white font-medium text-sm">Mathematical Precision</div>
                  <div className="text-[#94a3b8] text-xs">Algorithm Optimization</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <Psychology className="text-[#ec4899] mb-2" />
                  <div className="text-white font-medium text-sm">Innovation Mindset</div>
                  <div className="text-[#94a3b8] text-xs">Creative Problem Solving</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
              Our <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Core Services</span>
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto animate__animated animate__fadeInUp animate__delay-1s">
              From web applications to blockchain solutions, we deliver comprehensive software development services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`relative group overflow-hidden rounded-3xl p-8 backdrop-blur-sm border border-white/10 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate__animated animate__fadeInUp bg-gradient-to-br from-white/5 to-white/10`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${service.gradient} rounded-3xl blur-xl`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.gradient} text-white mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {service.icon}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                    {service.title}
                  </h3>
                  
                  <p className="text-[#e2e8f0] leading-relaxed group-hover:text-white transition-colors duration-300">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institute Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate__animated animate__fadeInLeft">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                HighScore <span className="bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">Institute</span>
              </h2>
              
              <p className="text-lg text-[#e2e8f0] leading-relaxed mb-8">
                Our institute goes beyond traditional education. We provide hands-on experience through 
                a comprehensive 1-year internship program where students work on real projects alongside 
                our experienced developers.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-[#e2e8f0]">1-Year Intensive Internship Program</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-[#e2e8f0]">Real Project Experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-[#e2e8f0]">Industry-Ready Skills</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#10b981] to-[#06b6d4] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-[#e2e8f0]">Job Placement Assistance</span>
                </div>
              </div>

              <button className="px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Explore Our Programs
              </button>
            </div>

            <div className="animate__animated animate__fadeInRight">
              <h3 className="text-2xl font-bold text-white mb-8">Available Courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 animate__animated animate__fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{course.icon}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{course.name}</div>
                        <div className="text-[#94a3b8] text-xs">{course.duration}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
              Visit Our <span className="bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent">Lagos Office</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate__animated animate__fadeInLeft">
              <div className="bg-gradient-to-br from-[#ec4899]/10 to-[#f97316]/10 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <LocationOn className="text-[#ec4899] text-4xl mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Our Headquarters</h3>
                <div className="space-y-3 text-[#e2e8f0]">
                  <p className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-[#ec4899] rounded-full"></span>
                    <span>39A, Ayilara Street</span>
                  </p>
                  <p className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-[#f97316] rounded-full"></span>
                    <span>Surulere, Lagos</span>
                  </p>
                  <p className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-[#ec4899] rounded-full"></span>
                    <span>Nigeria</span>
                  </p>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#ec4899] to-[#f97316] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">📞</span>
                    </div>
                    <span className="text-[#e2e8f0]">+234 (0) 123 456 7890</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#ec4899] to-[#f97316] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✉️</span>
                    </div>
                    <span className="text-[#e2e8f0]">info@highscoretech.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate__animated animate__fadeInRight">
              <h3 className="text-2xl font-bold text-white mb-6">Why Lagos?</h3>
              <p className="text-lg text-[#e2e8f0] leading-relaxed mb-8">
                Located in the heart of Nigeria's tech ecosystem, our Lagos office puts us at the 
                center of West Africa's rapidly growing digital economy. Surulere provides the 
                perfect blend of accessibility and innovation hub proximity.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-[#06b6d4] text-2xl mb-2">🌍</div>
                  <div className="text-white font-medium text-sm">Global Connectivity</div>
                  <div className="text-[#94a3b8] text-xs">International Market Access</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-[#10b981] text-2xl mb-2">🚀</div>
                  <div className="text-white font-medium text-sm">Tech Hub</div>
                  <div className="text-[#94a3b8] text-xs">Innovation Ecosystem</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-[#ec4899] text-2xl mb-2">👥</div>
                  <div className="text-white font-medium text-sm">Talent Pool</div>
                  <div className="text-[#94a3b8] text-xs">Skilled Developers</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-[#f97316] text-2xl mb-2">⚡</div>
                  <div className="text-white font-medium text-sm">Fast Growth</div>
                  <div className="text-[#94a3b8] text-xs">Expanding Market</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-[#2563eb]/10 to-[#06b6d4]/10 rounded-3xl p-8 backdrop-blur-sm border border-white/10 animate__animated animate__fadeInLeft">
              <div className="w-16 h-16 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-[#e2e8f0] leading-relaxed">
                To democratize technology by creating innovative software solutions and nurturing 
                the next generation of tech talents through comprehensive education and hands-on experience, 
                making advanced technology accessible to businesses of all sizes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#ec4899]/10 rounded-3xl p-8 backdrop-blur-sm border border-white/10 animate__animated animate__fadeInRight">
              <div className="w-16 h-16 bg-gradient-to-r from-[#7c3aed] to-[#ec4899] rounded-2xl flex items-center justify-center mb-6">
                <span className="text-white text-2xl">🔮</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-[#e2e8f0] leading-relaxed">
                To become Africa's leading software development company and tech education institute, 
                recognized globally for innovation, quality, and the ability to transform digital 
                dreams into reality while empowering the next generation of tech leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#2563eb]/10 via-[#06b6d4]/10 to-[#7c3aed]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10 animate__animated animate__fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Tech Journey?
            </h2>
            <p className="text-lg text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Whether you're looking for cutting-edge software solutions or want to advance your tech skills, 
              HighScore Tech is your gateway to the future of technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Your Project
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#06b6d4]/30 text-white font-semibold rounded-xl hover:bg-[#06b6d4]/10 transition-all duration-300 transform hover:scale-105">
                Join Our Institute
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
