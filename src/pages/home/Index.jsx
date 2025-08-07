import React from 'react';
import WelcomeHome from './WelcomeHome';
import Gallary from '../../components/Gallary';
import { useNavigate } from 'react-router';
import { useSEO } from '../../hooks/useSEO';

export default function HomePage() {
  const navigate = useNavigate()
  
  // SEO Configuration
  useSEO({
    title: "HighScore Tech - Leading Software Development Company in Nigeria | iGaming, Crypto Exchange, AI Solutions",
    description: "HighScore Tech is Nigeria's premier software development company specializing in iGaming platforms (Crash Games, Slots, Blackjack, Plinko, Mines), crypto exchanges, AI solutions, mobile apps, e-commerce, and tech training with guaranteed internships in Lagos.",
    keywords: "software development Nigeria, iGaming development Lagos, crypto exchange development, AI platform development, mobile app development Nigeria, web development Lagos, tech training Nigeria, coding bootcamp Lagos, software internships Nigeria, crash game development, blockchain development Nigeria",
    canonical: "https://highzcore.tech/"
  });
  
  return (
    <>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section with Animated Wire Background */}
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center py-20" aria-label="HighScore Tech Hero Section">
        {/* Animated Wire Background */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            {/* Animated Circuit Lines */}
            <defs>
              <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite"/>
                </stop>
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="1">
                  <animate attributeName="stop-opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
                </stop>
              </linearGradient>
              <linearGradient id="wireGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7">
                  <animate attributeName="stop-opacity" values="0.2;0.9;0.2" dur="4s" repeatCount="indefinite"/>
                </stop>
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0.8;0.2;0.8" dur="3s" repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6">
                  <animate attributeName="stop-opacity" values="0.2;0.8;0.2" dur="3.5s" repeatCount="indefinite"/>
                </stop>
              </linearGradient>
            </defs>
            
            {/* Horizontal flowing lines */}
            <path d="M0 100 Q300 80 600 100 T1200 100" stroke="url(#wireGrad)" strokeWidth="2" fill="none">
              <animateTransform attributeName="transform" type="translate" values="0,0;50,0;0,0" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M0 200 Q400 180 800 200 T1200 200" stroke="url(#wireGrad2)" strokeWidth="1.5" fill="none">
              <animateTransform attributeName="transform" type="translate" values="0,0;-30,0;0,0" dur="5s" repeatCount="indefinite"/>
            </path>
            <path d="M0 300 Q200 280 600 300 T1200 300" stroke="url(#wireGrad)" strokeWidth="1" fill="none">
              <animateTransform attributeName="transform" type="translate" values="0,0;40,0;0,0" dur="3.5s" repeatCount="indefinite"/>
            </path>
            <path d="M0 400 Q500 380 900 400 T1200 400" stroke="url(#wireGrad2)" strokeWidth="1.2" fill="none">
              <animateTransform attributeName="transform" type="translate" values="0,0;-25,0;0,0" dur="4.5s" repeatCount="indefinite"/>
            </path>
            
            {/* Vertical connection lines */}
            <path d="M200 0 L200 800" stroke="#2563eb" strokeWidth="1" opacity="0.4">
              <animate attributeName="opacity" values="0.1;0.8;0.1" dur="3s" repeatCount="indefinite"/>
            </path>
            <path d="M600 0 L600 800" stroke="#06b6d4" strokeWidth="1" opacity="0.4">
              <animate attributeName="opacity" values="0.1;0.8;0.1" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M1000 0 L1000 800" stroke="#7c3aed" strokeWidth="1" opacity="0.4">
              <animate attributeName="opacity" values="0.1;0.8;0.1" dur="2s" repeatCount="indefinite"/>
            </path>
            
            {/* Circuit nodes */}
            <circle cx="200" cy="100" r="4" fill="#2563eb">
              <animate attributeName="r" values="3;8;3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="600" cy="200" r="3" fill="#06b6d4">
              <animate attributeName="r" values="2;6;2" dur="3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="1000" cy="300" r="5" fill="#7c3aed">
              <animate attributeName="r" values="4;9;4" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="400" cy="400" r="3" fill="#ec4899">
              <animate attributeName="r" values="2;7;2" dur="3.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="800" cy="150" r="4" fill="#f97316">
              <animate attributeName="r" values="3;8;3" dur="2.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-70"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899', '#f97316'][Math.floor(Math.random() * 5)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`
              }}
            />
          ))}
        </div>

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#06b6d4] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10 pt-[20px]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 lg:pr-8">
              {/* Badge */}
              {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm">
                <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-2 animate-pulse"></span>
                <span className="text-[#60a5fa] text-sm font-medium">Innovation at Its Core</span>
              </div> */}

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-[#ffffff] to-[#2563eb] bg-clip-text text-transparent">
                    Premier Software Development
                  </span>
                  <br />
                  <span className="text-[#ffffff]">Company in</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent">
                    Nigeria
                  </span>
                </h1>
              </div>

              {/* Subtitle */}
              <div className="text-xl lg:text-xl text-[#e2e8f0] leading-relaxed max-w-2xl space-y-4">
                <p>
                  HighScore Tech specializes in <span className="bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent font-semibold">iGaming platform development</span>, 
                  crypto exchange applications, AI-powered solutions, and comprehensive tech training in Lagos, Nigeria.
                </p>
                <p>
                  We build cutting-edge <strong className="text-[#06b6d4]">Crash Games, Slots, Blackjack, Plinko, Mines, Dice games</strong>, 
                  blockchain applications, mobile apps, and provide hands-on internship opportunities for aspiring developers.
                </p>
              </div>


              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {/* Gradient Button */}
                <button className="group relative px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 overflow-hidden shadow-lg hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4] to-[#ec4899] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Hire Us</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#7c3aed] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                </button>

                {/* Glass/Blur Button */}
                <button onClick={()=> navigate("/courses")} className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-[#06b6d4]/30 rounded-xl font-semibold text-white transition-all duration-300 hover:border-[#06b6d4] hover:bg-[#06b6d4]/10 hover:scale-105 hover:shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/5 to-[#2563eb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Enroll on a Course</span>
                    <span className="group-hover:rotate-12 transition-transform duration-300">📚</span>
                  </span>
                </button>
              </div>

            </div>

            {/* Right Side - Slanted Image */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#2563eb]/30 to-[#06b6d4]/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#7c3aed]/30 to-[#ec4899]/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 -right-5 w-24 h-24 bg-gradient-to-br from-[#f97316]/40 to-[#f59e0b]/40 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
              
              {/* Main Image Container */}
              <div className="relative transform -rotate-6 hover:rotate-0 transition-transform duration-700 group">
                {/* Glowing Border */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-pulse"></div>
                
                {/* Image Frame */}
                <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f23] p-6 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-sm">
                  <img 
                    src="/assets/office.jpg" 
                    alt="Modern Tech Office" 
                    className="w-full h-[400px] object-cover rounded-2xl shadow-xl hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay Tech Elements */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                    <span className="text-white text-sm font-medium">Live Workspace</span>
                  </div>
                  
                  {/* Bottom Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 bg-black/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <div className="text-white font-semibold">Innovation Hub</div>
                    <div className="bg-gradient-to-r from-[#06b6d4] to-[#2563eb] bg-clip-text text-transparent text-sm font-medium">Where Ideas Come to Life</div>
                  </div>
                </div>

                {/* Floating Code Elements */}
                <div className="absolute top-1/4 -left-8 bg-[#0f0f23]/95 backdrop-blur-sm border border-[#2563eb]/50 rounded-lg p-3 transform rotate-12 animate-bounce shadow-lg" style={{animationDelay: '2s', animationDuration: '3s'}}>
                  <code className="text-[#06b6d4] text-xs font-mono">{'<Tech/>'}</code>
                </div>
                
                <div className="absolute bottom-1/4 -right-8 bg-[#0f0f23]/95 backdrop-blur-sm border border-[#7c3aed]/50 rounded-lg p-3 transform -rotate-12 animate-bounce shadow-lg" style={{animationDelay: '1s', animationDuration: '4s'}}>
                  <code className="text-[#ec4899] text-xs font-mono">console.log('Hello World')</code>
                </div>

                <div className="absolute top-3/4 left-1/4 bg-[#0f0f23]/95 backdrop-blur-sm border border-[#f97316]/50 rounded-lg p-2 transform rotate-6 animate-bounce shadow-lg" style={{animationDelay: '3s', animationDuration: '5s'}}>
                  <code className="text-[#f59e0b] text-xs font-mono">AI++</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f23] to-transparent"></div>
      </section>

      {/* Services Overview Section - SEO Content */}
      <section className="py-20 bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e]" aria-label="Our Software Development Services">
        <div className="container mx-auto px-6 lg:px-12">
          <header className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Leading Software Development Services in 
              <span className="bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent"> Nigeria</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              HighScore Tech is Nigeria's premier software development company, specializing in innovative technology solutions 
              and comprehensive training programs. Based in Lagos, we serve clients globally with cutting-edge software development services.
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* iGaming Development */}
            <article className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-white mb-4">iGaming Platform Development</h3>
              <p className="text-gray-300 mb-4">
                Custom development of online gaming platforms including <strong className="text-blue-400">Crash Games, Slots, Blackjack, Plinko, Mines, Dice, Lottery, Keno, Wheel Games, Limbo, and HiLo</strong> with provably fair systems and secure wallet integration.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Provably Fair Gaming Systems</li>
                <li>• Crypto Wallet Integration</li>
                <li>• Real-time Multiplayer Features</li>
                <li>• Advanced Security Protocols</li>
              </ul>
            </article>

            {/* Crypto Exchange */}
            <article className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300">
              <div className="text-4xl mb-4">₿</div>
              <h3 className="text-2xl font-bold text-white mb-4">Crypto Exchange Development</h3>
              <p className="text-gray-300 mb-4">
                Secure and scalable cryptocurrency exchange platforms with advanced trading features, multi-currency support, and enterprise-grade security for the Nigerian and global markets.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Multi-Currency Trading</li>
                <li>• Advanced Security Features</li>
                <li>• Real-time Market Data</li>
                <li>• Regulatory Compliance</li>
              </ul>
            </article>

            {/* AI Solutions */}
            <article className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Platform Development</h3>
              <p className="text-gray-300 mb-4">
                Artificial Intelligence and Machine Learning powered applications and platforms that leverage cutting-edge technology to solve complex business problems and automate processes.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Machine Learning Models</li>
                <li>• Natural Language Processing</li>
                <li>• Predictive Analytics</li>
                <li>• Computer Vision Solutions</li>
              </ul>
            </article>

            {/* Mobile App Development */}
            <article className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-pink-500/30 transition-all duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-white mb-4">Mobile App Development</h3>
              <p className="text-gray-300 mb-4">
                Native and cross-platform mobile applications for iOS and Android using React Native, Flutter, and native technologies to deliver exceptional user experiences.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• iOS & Android Development</li>
                <li>• Cross-platform Solutions</li>
                <li>• UI/UX Design</li>
                <li>• App Store Optimization</li>
              </ul>
            </article>

            {/* E-commerce Solutions */}
            <article className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-orange-500/30 transition-all duration-300">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-2xl font-bold text-white mb-4">E-commerce Solutions</h3>
              <p className="text-gray-300 mb-4">
                Complete e-commerce platforms with modern features, payment integrations, inventory management, and scalable architecture for businesses of all sizes in Nigeria and beyond.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Payment Gateway Integration</li>
                <li>• Inventory Management</li>
                <li>• Mobile-First Design</li>
                <li>• Analytics & Reporting</li>
              </ul>
            </article>

            {/* Tech Training */}
            <article className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-white mb-4">Tech Training & Internships</h3>
              <p className="text-gray-300 mb-4">
                Comprehensive software development training programs in Lagos with hands-on internship opportunities. Learn React, Node.js, mobile development, blockchain, and more with guaranteed real-world experience.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Full-Stack Web Development</li>
                <li>• Mobile App Development</li>
                <li>• Blockchain & Crypto</li>
                <li>• Guaranteed Internships</li>
              </ul>
            </article>
          </div>

          {/* Why Choose HighScore Tech */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose HighScore Tech?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">Industry Expertise</h3>
                <p className="text-gray-300 text-sm">Years of experience in software development across various industries including gaming, fintech, and e-commerce.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-white mb-2">Cutting-Edge Technology</h3>
                <p className="text-gray-300 text-sm">We use the latest technologies and frameworks to ensure your applications are future-proof and scalable.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-white mb-2">Skilled Developers</h3>
                <p className="text-gray-300 text-sm">Our team of experienced developers and our training programs produce top-tier software engineers.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-white mb-2">Global Reach</h3>
                <p className="text-gray-300 text-sm">Based in Lagos, Nigeria, we serve clients worldwide with 24/7 support and international quality standards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact SEO Section */}
      <section className="py-16 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f23]" aria-label="HighScore Tech Location and Contact">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Leading Software Development Company in Lagos, Nigeria
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              HighScore Tech is strategically located in Lagos, Nigeria's tech hub, serving as the gateway to Africa's largest economy. 
              Our location enables us to provide world-class software development services to both local and international clients.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Lagos, Nigeria</h3>
              <p className="text-gray-300">Africa's largest tech ecosystem and financial center</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold text-white mb-2">Global Services</h3>
              <p className="text-gray-300">Serving clients worldwide with local expertise</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Local Impact</h3>
              <p className="text-gray-300">Training the next generation of Nigerian developers</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 1;
          }
        }
      `}</style>

      <WelcomeHome />
      <Gallary />
      </main>
    </>
  );
}
