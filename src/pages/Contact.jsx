import React from 'react';
import { 
  LocationOn, 
  Phone, 
  Email, 
  Facebook, 
  Instagram,  
  Public
} from '@mui/icons-material';


import logoImage from '/assets/full-logo.png';

export default function Contact() {
  const contactInfo = [
    { 
      icon: <LocationOn className="text-[#ec4899] mt-1 flex-shrink-0" />, 
      label: 'Address', 
      text: '39 Ayilara Street, Ojuelegba, Surulere, Lagos, Nigeria' 
    },
    { 
      icon: <Phone className="text-[#06b6d4] flex-shrink-0" />, 
      label: 'Phone', 
      text: '+234 811 263 9073' 
    },
    { 
      icon: <Email className="text-[#10b981] flex-shrink-0" />, 
      label: 'Email', 
      text: 'info@highzcore.tech' 
    }
  ];

  const socialMediaLinks = [
    { name: 'Website', icon: <Public />, href: 'https://highzcore.tech' },
    { name: 'Facebook', icon: <Facebook />, href: 'https://www.facebook.com/your-profile' },
    { name: 'Instagram', icon: <Instagram />, href: 'https://www.instagram.com/your-profile' },
,
  ];

  return (
    <div className="bg-[#0f0f23] text-[#e2e8f0] py-16 px-6 sm:px-10 lg:px-20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <img 
            src={logoImage} 
            alt="Highzcore Logo" 
            className="h-20 w-auto mx-auto mb-4 filter drop-shadow-lg"
          />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Contact Highzcore
          </h1>
          <p className="mt-4 text-[#94a3b8] max-w-2xl mx-auto">
            Powering the Future of Innovation. We're here to help you with your software and tech education needs.
          </p>
        </div>

        <section className="space-y-8 leading-relaxed">
          {/* Contact Information Section */}
          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#06b6d4] mb-4">
              Get in Touch
            </h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-[#e2e8f0]">
                  {item.icon}
                  <div>
                    <strong className="block text-white">{item.label}</strong>
                    <a 
                      href={item.label === 'Email' ? `mailto:${item.text}` : (item.label === 'Phone' ? `tel:${item.text}` : '#')} 
                      className="text-sm text-[#94a3b8] hover:text-[#06b6d4] transition-colors"
                    >
                      {item.text}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Hours Section */}
          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#7c3aed] mb-4">
              Business Hours
            </h2>
            <p className="text-sm text-[#e2e8f0]">
              Our team is available to assist you during the following hours:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#94a3b8]">
              <li><strong className="text-white">Monday - Friday:</strong> 9:00 AM – 6:00 PM (WAT)</li>
              <li><strong className="text-white">Weekends & Public Holidays:</strong> Closed</li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="bg-[#1a1a2e] p-8 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-bold text-[#ec4899] mb-4">
              Connect with Us
            </h2>
            <p className="text-sm text-[#e2e8f0]">
              Stay updated with our latest news, projects, and educational content by following us on social media.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {socialMediaLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-12 h-12 bg-gradient-to-r from-white/10 to-white/5 hover:from-[#2563eb] hover:to-[#06b6d4] text-[#94a3b8] hover:text-white flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-white/10"
                  title={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}