import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-cards'
import 'animate.css'

// Custom styles for left-stacked cards
const customStyles = `
.swiper-cards-gallery {
  max-width: 100% !important;
  overflow: visible !important;
}

.swiper-cards-gallery .swiper-cards-container {
  left: 0 !important;
  transform-origin: left center !important;
  max-width: 100% !important;
}

.swiper-cards-gallery .swiper-slide {
  transform-origin: left center !important;
  left: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

.swiper-cards-gallery .swiper-slide:not(.swiper-slide-active) {
  transform-origin: left center !important;
}

.swiper-cards-gallery .swiper-slide-shadow-cards {
  background: linear-gradient(to right, rgba(0,0,0,0.5), transparent) !important;
}

.swiper-cards-gallery .swiper-wrapper {
  max-width: 100% !important;
}

.swiper-cards-gallery img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
}
`

// Import gallery images
import img1 from '/assets/gallery/img1.png'
import img2 from '/assets/gallery/img2.png'
import img3 from '/assets/gallery/img3.png'
import img4 from '/assets/gallery/img4.png'
import img5 from '/assets/gallery/img5.png'
import img6 from '/assets/gallery/img6.png'
import img7 from '/assets/gallery/img7.png'

import img8 from '/assets/gallery/img8.png'
import img9 from '/assets/gallery/img9.png'
import img10 from '/assets/gallery/img10.png'
import img11 from '/assets/gallery/phone1.jpg'
import img12 from '/assets/gallery/phone2.jpg'
import img13 from '/assets/gallery/phone3.jpg'
// import img11 from '/assets/DSC_7966.jpeg'
// import img12 from '/assets/DSC_7975.jpeg'
// import img13 from '/assets/DSC_9889.jpeg'
// import img14 from '/assets/DSC_9940.jpeg'


const galleryImages = [
  { 
    src: img13, 
    alt: "Enterprise Dashboard UI",
    title: "Real-time Analytics Platform",
    tech: "React, D3.js, Node.js"
  },
  { 
    src: img11, 
    alt: "Enterprise Dashboard UI",
    title: "Real-time Analytics Platform",
    tech: "React, D3.js, Node.js"
  },
    { 
    src: img12, 
    alt: "Enterprise Dashboard UI",
    title: "Real-time Analytics Platform",
    tech: "React, D3.js, Node.js"
  },

  { 
    src: img1, 
    alt: "Enterprise Dashboard UI",
    title: "Real-time Analytics Platform",
    tech: "React, D3.js, Node.js"
  },
  { 
    src: img2, 
    alt: "E-commerce Web Application",
    title: "Full-stack E-commerce Solution",
    tech: "Next.js, PostgreSQL, Stripe API"
  },
  { 
    src: img3, 
    alt: "Mobile Banking App Interface",
    title: "Fintech Mobile Application",
    tech: "React Native, Redux, Firebase"
  },
  { 
    src: img4, 
    alt: "Cloud Infrastructure Dashboard",
    title: "DevOps Monitoring System",
    tech: "Vue.js, Docker, Kubernetes"
  },
  { 
    src: img5, 
    alt: "AI-powered Chatbot Interface",
    title: "Machine Learning Chatbot",
    tech: "Python, TensorFlow, WebSocket"
  },
  { 
    src: img6, 
    alt: "CRM Management System",
    title: "Customer Relationship Platform",
    tech: "Angular, .NET Core, SQL Server"
  },
  { 
    src: img7, 
    alt: "Blockchain Wallet Application",
    title: "Cryptocurrency Trading Platform",
    tech: "Solidity, Web3.js, Express.js"
  },
  { 
    src: img8, 
    alt: "IoT Device Control Panel",
    title: "Smart Home Management System",
    tech: "React, MQTT, Raspberry Pi"
  },
  { 
    src: img9, 
    alt: "SaaS Project Management Tool",
    title: "Enterprise Project Dashboard",
    tech: "Svelte, GraphQL, MongoDB"
  },
  { 
    src: img10, 
    alt: "Healthcare Management System",
    title: "Medical Records Platform",
    tech: "Flutter, Laravel, MySQL"
  },
]

export default function Gallary() {
  const [swiper, setSwiper] = useState(null)

  return (
    <>
      {/* Inject custom styles */}
      <style>{customStyles}</style>
      
      <section className="py-20 px-6 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
              <span className="w-2 h-2 bg-[#06b6d4] rounded-full mr-3 animate-pulse"></span>
              <span className="text-[#60a5fa] text-sm font-medium">Portfolio Showcase</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight animate__animated animate__fadeInUp text-white mb-6">
              <span className="bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] bg-clip-text text-transparent">
                PROJECT GALLERY
              </span>
            </h2>
            
            <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto animate__animated animate__fadeInUp animate__delay-1s">
              Explore our latest software development projects and enterprise solutions
            </p>
          </div>

          {/* Main Content - Text Left, Images Right */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            {/* Description Text - Left Side */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center lg:justify-start space-y-8">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-relaxed animate__animated animate__fadeInUp animate__delay-1s mb-6">
                  Screenshots of Our
                  <span className="bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent"> Latest Projects</span>
                </h3>
                
                <p className="text-lg text-[#e2e8f0] leading-relaxed mb-8">
                  From enterprise dashboards to mobile applications, each screenshot represents hours of precision coding, 
                  innovative problem-solving, and cutting-edge technology implementation.
                </p>

                {/* Tech Stack Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: "⚛️", label: "Frontend Frameworks", desc: "React, Vue, Angular" },
                    { icon: "🚀", label: "Backend Technologies", desc: "Node.js, Python, .NET" },
                    { icon: "☁️", label: "Cloud Platforms", desc: "AWS, Azure, GCP" },
                    { icon: "📱", label: "Mobile Development", desc: "React Native, Flutter" }
                  ].map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{item.label}</div>
                          <div className="text-[#94a3b8] text-xs">{item.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="px-8 py-4 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate__animated animate__fadeInUp animate__delay-2s">
                  View All Projects
                </button>
              </div>
            </div>

          {/* Gallery Container - Right Side */}
          <div className="lg:w-1/2 relative max-w-full">
            {/* Overflow container to show stacked cards */}
            <div className="relative w-full" style={{ paddingRight: '43px' }}>
              {/* Custom Navigation Arrows */}
              <div className="hidden md:block">
                <button
                  onClick={() => swiper?.slidePrev()}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-[#2563eb]/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-[#2563eb] transition-all duration-300 hover:scale-110 border border-white/20"
                >
                  <ChevronLeft className="text-white text-2xl" />
                </button>
                <button
                  onClick={() => swiper?.slideNext()}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-[#2563eb]/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-[#2563eb] transition-all duration-300 hover:scale-110 border border-white/20"
                >
                  <ChevronRight className="text-white text-2xl" />
                </button>
              </div>

              {/* Project Info Display */}
              <div className="mb-6 text-center">
                <div className="bg-gradient-to-r from-[#2563eb]/10 to-[#06b6d4]/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-2">Featured Project</h4>
                  <p className="text-[#94a3b8] text-sm">Swipe through our portfolio to see the technologies and solutions we've built</p>
                </div>
              </div>

              {/* Swiper Container with Stacked Cards Effect */}
              <div className="w-full max-w-md h-90 md:h-80 lg:h-96" style={{ overflow: 'visible' }}>
                <Swiper
                  effect="cards"
                  grabCursor={true}
                  modules={[EffectCards, Navigation, Pagination]}
                  className="w-full h-full swiper-cards-gallery"
                  onSwiper={setSwiper}
                  cardsEffect={{
                    perSlideOffset: 8,
                    perSlideRotate: 3,
                    rotate: true,
                    slideShadows: true,
                  }}
                  style={{
                    '--swiper-navigation-color': '#fff',
                    '--swiper-pagination-color': '#fff',
                    overflow: 'visible'
                  }}
                >
                  {galleryImages.map((image, index) => (
                    <SwiperSlide key={index} className="rounded-2xl overflow-hidden shadow-2xl">
                      <div className="w-full h-full relative group">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay with project info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h5 className="text-lg font-bold mb-2">{image.title}</h5>
                            <p className="text-sm text-gray-300 mb-3">{image.alt}</p>
                            <div className="flex flex-wrap gap-2">
                              {image.tech.split(', ').map((tech, techIndex) => (
                                <span key={techIndex} className="px-2 py-1 bg-[#2563eb]/80 rounded-lg text-xs font-medium backdrop-blur-sm">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Project type badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] rounded-full">
                          <span className="text-white text-xs font-medium">Live Project</span>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Mobile Swipe Indicator & Stats */}
              <div className="text-center mt-6">
                <div className="md:hidden mb-4">
                  <p className="text-sm text-[#94a3b8]">Swipe to navigate projects</p>
                </div>
                
                {/* Project stats */}
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  <div className="text-center">
                    <div className="text-[#06b6d4] font-bold text-lg">10+</div>
                    <div className="text-[#94a3b8] text-xs">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#7c3aed] font-bold text-lg">5+</div>
                    <div className="text-[#94a3b8] text-xs">Technologies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#ec4899] font-bold text-lg">100%</div>
                    <div className="text-[#94a3b8] text-xs">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  )
}
