import React from 'react'
import { School, Code, Work, Groups, VerifiedUser, Timeline, TrendingUp, Support } from '@mui/icons-material'
import 'animate.css'
import { useNavigate } from 'react-router'

export default function TechTrainingDetail() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#ec4899] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#f97316] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#ec4899]/20 to-[#f97316]/20 border border-[#ec4899]/30 backdrop-blur-sm mb-8 animate__animated animate__fadeInDown">
            <School className="text-[#ec4899] mr-3" />
            <span className="text-[#ec4899] text-sm font-medium">Tech Training Programs</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 animate__animated animate__fadeInUp">
            Launch Your Tech{' '}
            <span className="bg-gradient-to-r from-[#ec4899] to-[#f97316] bg-clip-text text-transparent">
              Career Today
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#e2e8f0] max-w-4xl mx-auto leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            Comprehensive software development training programs with hands-on internship opportunities. 
            Get guaranteed real-world experience and 1-year internship placement with industry projects.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 animate__animated animate__fadeInUp animate__delay-2s">
            <button onClick={()=> navigate("/register")} className="px-8 py-4 bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              Start Your Journey
            </button>
            <button onClick={()=> navigate("/courses")} className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#ec4899]/30 text-white font-semibold rounded-xl hover:bg-[#ec4899]/10 transition-all duration-300">
              View full Courses
            </button>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Complete Training Programs
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              Choose from our comprehensive training programs designed to take you from beginner 
              to industry-ready developer with guaranteed internship placement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="text-4xl" />,
                title: "Full-Stack Development",
                duration: "6 Months + 1 Year Internship",
                desc: "Master React, Node.js, databases, and deployment with real project experience",
                features: ["React & Next.js", "Node.js & Express", "Database Design", "Cloud Deployment"],
                color: "from-[#ec4899] to-[#f472b6]"
              },
              {
                icon: <Work className="text-4xl" />,
                title: "DevOps Engineering", 
                duration: "4 Months + 1 Year Internship",
                desc: "Learn CI/CD, containerization, cloud infrastructure, and automation",
                features: ["Docker & Kubernetes", "AWS/Azure/GCP", "CI/CD Pipelines", "Infrastructure as Code"],
                color: "from-[#f97316] to-[#f59e0b]"
              },
              {
                icon: <Groups className="text-4xl" />,
                title: "Product Management",
                duration: "3 Months + 1 Year Internship",
                desc: "Strategic product development, user research, and agile methodologies",
                features: ["Product Strategy", "User Research", "Agile/Scrum", "Analytics & KPIs"],
                color: "from-[#7c3aed] to-[#8b5cf6]"
              }
            ].map((program, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${program.color} inline-block mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {program.icon}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">{program.title}</h3>
                    <p className="text-[#ec4899] text-sm font-medium">{program.duration}</p>
                  </div>
                  <p className="text-[#e2e8f0] mb-6 leading-relaxed">{program.desc}</p>
                  <ul className="space-y-2">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-[#e2e8f0]">
                        <div className="w-2 h-2 bg-[#ec4899] rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={()=> navigate("/courses")} className={`w-full mt-6 px-6 py-3 rounded-xl bg-gradient-to-r ${program.color} text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Benefits */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#ec4899]/10 to-[#f97316]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose HighScore Tech Training?
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              We don't just teach - we guarantee your success with industry connections, 
              real projects, and comprehensive career support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <VerifiedUser className="text-4xl" />,
                title: "Guaranteed Internship",
                desc: "1-year paid internship with real companies and projects",
                highlight: "100% Placement"
              },
              {
                icon: <Timeline className="text-4xl" />,
                title: "Hands-on Projects",
                desc: "Build 5+ real-world projects for your portfolio",
                highlight: "Portfolio Ready"
              },
              {
                icon: <TrendingUp className="text-4xl" />,
                title: "Industry Mentorship",
                desc: "Personal mentoring from experienced tech professionals",
                highlight: "Expert Guidance"
              },
              {
                icon: <Support className="text-4xl" />,
                title: "Lifetime Support",
                desc: "Ongoing career support and alumni network access",
                highlight: "Continuous Growth"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f97316] inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {benefit.icon}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#ec4899]/20 border border-[#ec4899]/30 mb-3">
                      <span className="text-[#ec4899] text-xs font-bold">{benefit.highlight}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-[#e2e8f0] leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Learning Journey
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              From enrollment to career placement, we guide you through every step 
              of your tech career transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                phase: "Phase 1", 
                title: "Foundation Learning", 
                duration: "2-3 Months",
                desc: "Core programming concepts, frameworks, and tools" 
              },
              { 
                phase: "Phase 2", 
                title: "Advanced Skills", 
                duration: "2-3 Months",
                desc: "Specialized technologies and advanced project development" 
              },
              { 
                phase: "Phase 3", 
                title: "Capstone Projects", 
                duration: "1 Month",
                desc: "Build comprehensive portfolio projects with team collaboration" 
              },
              { 
                phase: "Phase 4", 
                title: "Industry Internship", 
                duration: "12 Months",
                desc: "Paid internship with real companies on production projects" 
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#ec4899] to-[#f97316] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm font-bold">{step.phase}</span>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-[#ec4899] to-[#f97316] opacity-30"></div>
                  )}
                </div>
                <div className="mb-3">
                  <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                  <p className="text-[#ec4899] text-sm font-medium">{step.duration}</p>
                </div>
                <p className="text-[#e2e8f0] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#ec4899]/10 to-[#f97316]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Student Success Stories
            </h2>
            <p className="text-[#e2e8f0] max-w-3xl mx-auto">
              Our graduates are now working at top tech companies worldwide, 
              building amazing products and advancing their careers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { metric: "98%", label: "Job Placement Rate", color: "#ec4899" },
              { metric: "$65K", label: "Average Starting Salary", color: "#f97316" },
              { metric: "20+", label: "Graduates Placed", color: "#7c3aed" },
              { metric: "10+", label: "Partner Companies", color: "#06b6d4" }
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
          <div className="bg-gradient-to-r from-[#ec4899]/10 via-[#f97316]/10 to-[#7c3aed]/10 rounded-3xl p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Tech Career?
            </h2>
            <p className="text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Join our next cohort and transform your career with guaranteed internship placement. 
              Applications are now open for our upcoming programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={()=> navigate("/register")} className="px-8 py-4 bg-gradient-to-r from-[#ec4899] to-[#f97316] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Apply Now
              </button>
              <button onClick={()=> navigate("/courses")} className="px-8 py-4 bg-white/10 backdrop-blur-md border border-[#ec4899]/30 text-white font-semibold rounded-xl hover:bg-[#ec4899]/10 transition-all duration-300">
                View courses
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
