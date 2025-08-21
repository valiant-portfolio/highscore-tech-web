import React from 'react'
import { ShoppingCart, Store, Payment, Inventory, TrendingUp, Security, Devices, Analytics } from '@mui/icons-material'
import 'animate.css'
import { useSEO } from '../../hooks/useSEO'

export default function EcommerceDetail() {
  useSEO({
    title: "HighScore Tech E-commerce Development | Online Store Solutions | Nigeria",
    description: "HighScore Tech builds powerful e-commerce platforms with payment integration, inventory management, and scalable architecture. Leading e-commerce development company in Nigeria for online business success.",
    keywords: "HighScore Tech e-commerce development, online store Nigeria, e-commerce platform Lagos, shopping website development, payment gateway integration Nigeria, inventory management system, premier e-commerce company Nigeria",
    canonical: "https://www.highzcore.tech/services/ecommerce",
    ogTitle: "HighScore Tech E-commerce Development | Complete Online Store Solutions",
    ogDescription: "Premier e-commerce development company in Nigeria. We build complete online stores with payment integration, inventory management, and modern features.",
    ogImage: "https://www.highzcore.tech/images/ecommerce-og.jpg",
    ogUrl: "https://www.highzcore.tech/services/ecommerce"
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#4f46e5] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#4f46e5]/20 to-[#7c3aed]/20 border border-[#4f46e5]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <ShoppingCart className="text-[#4f46e5] mr-3" />
            <span className="text-[#4f46e5] text-sm font-medium">E-commerce Solutions</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 animate__animated animate__fadeInUp">
            E-commerce Platforms{' '}
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              That Convert
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#e2e8f0] max-w-4xl mx-auto leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            We build complete e-commerce platforms with modern features, payment integrations, inventory management, 
            and scalable architecture designed to maximize sales and customer satisfaction.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 animate__animated animate__fadeInUp animate__delay-2s">
            <button className="px-8 py-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Launch Your Store
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#4f46e5]/30 text-white font-semibold rounded-xl hover:bg-[#4f46e5]/10 transition-all duration-300">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Complete E-commerce Solution
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              From product catalog to payment processing, our e-commerce platforms include everything 
              you need to succeed in the digital marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Store className="text-4xl" />,
                title: "Multi-Store Management",
                desc: "Manage multiple stores from a single dashboard with centralized control",
                color: "from-[#4f46e5] to-[#6366f1]"
              },
              {
                icon: <Payment className="text-4xl" />,
                title: "Payment Integration", 
                desc: "Support for all major payment gateways and cryptocurrency payments",
                color: "from-[#7c3aed] to-[#8b5cf6]"
              },
              {
                icon: <Inventory className="text-4xl" />,
                title: "Inventory Management",
                desc: "Real-time inventory tracking with automated reorder alerts",
                color: "from-[#ec4899] to-[#f472b6]"
              },
              {
                icon: <TrendingUp className="text-4xl" />,
                title: "Sales Analytics",
                desc: "Advanced analytics and reporting for data-driven decisions",
                color: "from-[#06b6d4] to-[#0891b2]"
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

      {/* Platform Features */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#4f46e5]/10 to-[#7c3aed]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Enterprise E-commerce Features
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              Our e-commerce platforms come packed with enterprise-grade features designed 
              to scale with your business and enhance customer experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Security className="text-4xl" />,
                title: "Security & Compliance",
                desc: "PCI DSS compliance, SSL encryption, and fraud protection for secure transactions",
                features: ["PCI DSS Compliance", "SSL Encryption", "Fraud Detection", "GDPR Ready"]
              },
              {
                icon: <Devices className="text-4xl" />,
                title: "Mobile Responsive",
                desc: "Fully responsive design optimized for mobile commerce and PWA support",
                features: ["Mobile Optimized", "PWA Support", "Touch Friendly", "App-like Experience"]
              },
              {
                icon: <Analytics className="text-4xl" />,
                title: "Marketing Tools",
                desc: "Built-in marketing tools including SEO optimization and email campaigns",
                features: ["SEO Optimization", "Email Marketing", "Discount Codes", "Customer Segmentation"]
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] inline-block mb-6">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-[#e2e8f0] mb-6">{feature.desc}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-[#e2e8f0]">
                      <div className="w-2 h-2 bg-[#4f46e5] rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Modern E-commerce Technology Stack
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              We use cutting-edge technologies to build fast, scalable, and secure e-commerce platforms 
              that deliver exceptional performance and user experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { name: "React/Next.js", category: "Frontend" },
              { name: "Node.js", category: "Backend" },
              { name: "PostgreSQL", category: "Database" },
              { name: "Stripe/PayPal", category: "Payments" },
              { name: "AWS/GCP", category: "Cloud" },
              { name: "Docker", category: "DevOps" }
            ].map((tech, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold">{tech.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{tech.name}</h3>
                  <p className="text-xs text-[#e2e8f0]">{tech.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#4f46e5]/10 to-[#7c3aed]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Proven E-commerce Success
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              Our e-commerce platforms deliver measurable results that drive business growth 
              and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { metric: "40%", label: "Average Conversion Increase", color: "#4f46e5" },
              { metric: "60%", label: "Faster Page Load Times", color: "#7c3aed" },
              { metric: "99.9%", label: "Platform Uptime", color: "#ec4899" },
              { metric: "50+", label: "Stores Launched", color: "#06b6d4" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color})`}}>
                  {stat.metric}
                </div>
                <div className="text-sm text-[#e2e8f0]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#4f46e5]/10 via-[#7c3aed]/10 to-[#ec4899]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Launch Your E-commerce Store?
            </h2>
            <p className="text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Transform your business with a powerful e-commerce platform that drives sales and delights customers. 
              Let's build your online store together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Start Your Store
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#4f46e5]/30 text-white font-semibold rounded-xl hover:bg-[#4f46e5]/10 transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
