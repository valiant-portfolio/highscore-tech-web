import React, { useState } from 'react'
import { 
  LocationOn, 
  Phone, 
  Email, 
  Instagram, 
  Facebook, 
  YouTube,
  Twitter,
  LinkedIn,
  GitHub,
  Code,
  School,
  Business,
  Send
} from '@mui/icons-material'

// Import logo
import logoImage from '/assets/ori-logo.png'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Subscribing email:', email)
    setEmail('')
  }

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Courses', href: '/courses' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' }
  ]

  const services = [
    { name: 'Web Development', href: '/services/web' },
    { name: 'Mobile Apps', href: '/services/mobile' },
    { name: 'AI Solutions', href: '/services/ai' },
    { name: 'Blockchain', href: '/services/blockchain' },
    { name: 'Gaming Systems', href: '/services/gaming' }
  ]

  const courses = [
    { name: 'Frontend Development', href: '/course/frontend-development' },
    { name: 'Backend Development', href: '/course/backend-development' },
    { name: 'Data Science', href: '/course/data-science' },
    { name: 'AI & Machine Learning', href: '/course/artificial-intelligence' },
    { name: 'Mobile Development', href: '/course/mobile-development' }
  ]

  const socialMediaLinks = [
    { name: 'Instagram', icon: <Instagram />, href: '#' },
    { name: 'LinkedIn', icon: <LinkedIn />, href: '#' },
    { name: 'Facebook', icon: <Facebook />, href: '#' },
    { name: 'YouTube', icon: <YouTube />, href: '#' },
    { name: 'GitHub', icon: <GitHub />, href: '#' },
    { name: 'Twitter', icon: <Twitter />, href: '#' },
  ]

  return (
    <footer className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Section 1: Logo & Company Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Logo */}
              <div className="mb-6">
                <img 
                  src={logoImage} 
                  alt="HighScore Tech Logo" 
                  className="h-16 w-auto filter drop-shadow-lg"
                />
              </div>
              
              {/* Company Description */}
              <div className="space-y-4">
                <p className="text-[#e2e8f0] text-sm leading-relaxed max-w-md">
                  Transforming ideas into digital reality since 2022. We specialize in cutting-edge software development 
                  and comprehensive tech education, empowering businesses and individuals to thrive in the digital age.
                </p>
                
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-[#06b6d4] text-2xl font-bold">20+</div>
                    <div className="text-[#94a3b8] text-xs">Projects</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="text-[#10b981] text-2xl font-bold">40+</div>
                    <div className="text-[#94a3b8] text-xs">Students</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-[#e2e8f0]">
                  <LocationOn className="text-[#ec4899] mt-1 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">
                    39A, Ayilara Street, Surulere, Lagos, Nigeria
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[#e2e8f0]">
                  <Phone className="text-[#06b6d4] flex-shrink-0" />
                  <span className="text-sm">+234 811 263 9073</span>
                </div>

                <div className="flex items-center gap-3 text-[#e2e8f0]">
                  <Email className="text-[#10b981] flex-shrink-0" />
                  <span className="text-sm">info@highzcore.tech</span>
                </div>
              </div>
            </div>

            {/* Section 2: Services */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Code className="text-[#2563eb]" />
                <h3 className="text-lg font-bold text-white">Services</h3>
              </div>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a 
                      href={service.href}
                      className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Courses */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <School className="text-[#7c3aed]" />
                <h3 className="text-lg font-bold text-white">Courses</h3>
              </div>
              <ul className="space-y-3">
                {courses.map((course, index) => (
                  <li key={index}>
                    <a 
                      href={course.href}
                      className="text-[#94a3b8] hover:text-[#7c3aed] transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                    >
                      {course.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Quick Links & Newsletter */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Business className="text-[#ec4899]" />
                <h3 className="text-lg font-bold text-white">Quick Links</h3>
              </div>
              <ul className="space-y-3 mb-8">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-[#94a3b8] hover:text-[#ec4899] transition-colors duration-300 text-sm hover:translate-x-1 transform inline-block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-r from-[#2563eb]/10 to-[#06b6d4]/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                <h4 className="text-white font-semibold mb-3">Stay Updated</h4>
                <p className="text-[#94a3b8] text-sm mb-4 leading-relaxed">
                  Get the latest tech insights and course updates.
                </p>

                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent placeholder-[#94a3b8] backdrop-blur-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Subscribe</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Social Media & Bottom Section */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              {/* Social Media Links */}
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium text-sm">Follow Us:</span>
                <div className="flex space-x-3">
                  {socialMediaLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-gradient-to-r from-white/10 to-white/5 hover:from-[#2563eb] hover:to-[#06b6d4] text-[#94a3b8] hover:text-white flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-white/10"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Copyright & Links */}
              <div className="text-center md:text-right">
                <p className="text-[#94a3b8] text-sm mb-2">
                  © 2025 HighScore Tech. All rights reserved.
                </p>
                <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-xs">
                  <a href="/privacy" className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-300">Privacy Policy</a>
                  <a href="/terms" className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-300">Terms of Service</a>
                  <a href="/careers" className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors duration-300">Careers</a>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Statement */}
          <div className="mt-8 text-center">
            <p className="text-[#60a5fa] text-sm font-medium">
              Transforming Ideas Into Digital Reality
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
