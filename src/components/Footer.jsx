import React, { useState } from 'react'
import { 
  LocationOn, 
  Phone, 
  Email, 
  Instagram, 
  Facebook, 
  YouTube,
  Twitter
} from '@mui/icons-material'

// Import logo
import logoImage from '/assets/new-logo.png'

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
    { name: 'Events', href: '/events' },
    { name: 'Forum', href: '/forum' },
    { name: 'Contact', href: '/contact' }
  ]

  const socialMediaLinks = [
    { name: 'Instagram', icon: <Instagram />, href: '#' },
    { name: 'TikTok', icon: '🎵', href: '#' },
    { name: 'Facebook', icon: <Facebook />, href: '#' },
    { name: 'YouTube', icon: <YouTube />, href: '#' },
    { name: 'X', icon: <Twitter />, href: '#' },
  ]

  return (
    <footer className="bg-black py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Section 1: Logo & Contact Info */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="mb-6">
              <img 
                src={logoImage} 
                alt="LOGIC Church Logo" 
                className="h-12 w-auto"
              />
            </div>
            

            {/* Contact Information */}
            <div className="space-y-3">
              {/* Venue */}
              <div className="flex items-start gap-3 text-gray-300">
                <LocationOn className="text-red-500 mt-1 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  39A, Ayilara street, Ojuelegba, Surulere, Lagos
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="text-blue-400 flex-shrink-0" />
                <span className="text-sm">+2348112639073</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 text-gray-300">
                <Email className="text-green-400 flex-shrink-0" />
                <span className="text-sm">hello@highzcore.com</span>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Service Times */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Service Times</h3>
            <div className="space-y-3">
              <div className="text-gray-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sunday</span>
                  <span className="text-sm">9:00 AM</span>
                </div>
              </div>
              <div className="text-gray-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Wednesday</span>
                  <span className="text-sm">6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Stay Connected */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Stay Connected</h3>
            
            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Subscribe to our newsletter for updates and inspiration.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-3 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="w-full gradient-primary text-white py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>

            {/* Social Media Icons */}
            <div className="flex flex-wrap gap-3">
              {socialMediaLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-red-500 text-gray-300 hover:text-white flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110"
                  title={social.name}
                >
                  {typeof social.icon === 'string' ? (
                    <span className="text-lg">{social.icon}</span>
                  ) : (
                    <span className="text-lg">{social.icon}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-gray-700 my-8"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © 2025 . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
