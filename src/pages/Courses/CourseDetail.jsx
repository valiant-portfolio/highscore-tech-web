import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  Schedule, 
  Star, 
  CheckCircle, 
  Person, 
  School, 
  TrendingUp,
  PlayCircleOutline,
  Assignment,
  EmojiEvents,
  Group
} from '@mui/icons-material';
import { getCourseById, formatPrice } from '../../data/coursesData';
import 'animate.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <button 
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#2563eb] to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#7c3aed] to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/courses')}
            className="flex items-center space-x-2 text-[#06b6d4] hover:text-white transition-colors duration-300 mb-8 animate__animated animate__fadeInLeft"
          >
            <ArrowBack className="w-5 h-5" />
            <span>Back to Courses</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div className="animate__animated animate__fadeInLeft">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#06b6d4]/20 border border-[#2563eb]/30 backdrop-blur-sm mb-6">
                <span className="text-4xl mr-3">{course.icon}</span>
                <span className="text-[#60a5fa] text-sm font-medium">{course.level}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                {course.name}
              </h1>

              <p className="text-lg md:text-xl text-[#e2e8f0] leading-relaxed mb-8">
                {course.longDescription}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <Schedule className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
                  <div className="text-white font-semibold">{course.duration}</div>
                  <div className="text-[#94a3b8] text-sm">Duration</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <TrendingUp className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
                  <div className="text-white font-semibold">{course.level}</div>
                  <div className="text-[#94a3b8] text-sm">Level</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <Group className="w-8 h-8 text-[#ec4899] mx-auto mb-2" />
                  <div className="text-white font-semibold">30 Max</div>
                  <div className="text-[#94a3b8] text-sm">Students</div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="animate__animated animate__fadeInRight">
              <div className={`bg-gradient-to-br ${course.bgGradient} rounded-3xl p-8 backdrop-blur-sm border border-white/10 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient} opacity-5 rounded-3xl`}></div>
                
                <div className="relative">
                  <div className="text-center mb-6">
                    <div className="text-3xl md:text-4xl font-black text-white mb-2">
                      {formatPrice(course.price)}
                    </div>
                    <div className="text-[#94a3b8]">Full Program</div>
                    <div className="text-[#10b981] text-sm font-medium mt-2">
                      Or {formatPrice(course.price / 6)}/month for 6 months
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#10b981]" />
                      <span className="text-[#e2e8f0]">1-Year Internship Included</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#10b981]" />
                      <span className="text-[#e2e8f0]">Portfolio Projects</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#10b981]" />
                      <span className="text-[#e2e8f0]">Job Placement Support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#10b981]" />
                      <span className="text-[#e2e8f0]">Industry Certification</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className={`w-full px-6 py-4 bg-gradient-to-r ${course.gradient} text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                      Enroll Now - 20% Off
                    </button>
                    <button className="w-full px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300">
                      Download Curriculum
                    </button>
                  </div>

                  <div className="text-center mt-6">
                    <div className="text-[#f59e0b] text-sm font-medium">⏰ Early Bird Offer Ends July 25</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Modules */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16 animate__animated animate__fadeInUp">
            Course <span className={`bg-gradient-to-r ${course.gradient} bg-clip-text text-transparent`}>Curriculum</span>
          </h2>

          <div className="grid gap-8">
            {course.modules.map((module, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 animate__animated animate__fadeInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${course.gradient} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{module.title}</h3>
                      <div className="flex items-center space-x-2 text-[#94a3b8]">
                        <Schedule className="w-4 h-4" />
                        <span className="text-sm">{module.duration}</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {module.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#10b981] rounded-full flex-shrink-0"></div>
                          <span className="text-[#e2e8f0] text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features & Outcomes */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* What You'll Learn */}
            <div className="animate__animated animate__fadeInLeft">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
                What You'll <span className="text-[#06b6d4]">Master</span>
              </h3>
              <div className="grid gap-4">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                    <span className="text-[#e2e8f0]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Outcomes */}
            <div className="animate__animated animate__fadeInRight">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Career <span className="text-[#ec4899]">Outcomes</span>
              </h3>
              <div className="space-y-6">
                {course.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <EmojiEvents className="w-6 h-6 text-[#f59e0b] flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-white font-medium">{outcome}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructor Info */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#2563eb]/10 to-[#06b6d4]/10 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-4 mb-4">
                  <Person className="w-8 h-8 text-[#06b6d4]" />
                  <div>
                    <h4 className="text-white font-semibold">Expert Instructor</h4>
                    <p className="text-[#94a3b8] text-sm">{course.instructor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 animate__animated animate__fadeInUp">
            Prerequisites
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {course.requirements.map((requirement, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 animate__animated animate__fadeInUp" style={{ animationDelay: `${index * 0.2}s` }}>
                <Assignment className="w-8 h-8 text-[#06b6d4] mx-auto mb-4" />
                <p className="text-[#e2e8f0]">{requirement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`bg-gradient-to-r ${course.bgGradient} rounded-3xl p-12 backdrop-blur-sm border border-white/10 animate__animated animate__fadeInUp`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-[#e2e8f0] mb-8 max-w-2xl mx-auto">
              Join thousands of successful graduates who transformed their careers with HighScore Tech. 
              Your future in tech starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className={`px-8 py-4 bg-gradient-to-r ${course.gradient} text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                Enroll Now - Save 20%
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
