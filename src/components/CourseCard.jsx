import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessTime, Star, TrendingUp, ArrowForward } from '@mui/icons-material';
import { formatPrice } from '../data/coursesData';
import 'animate.css';

const CourseCard = ({ course, index }) => {
  const navigate = useNavigate();

  const handleCourseClick = () => {
     window.location.href = `/course/${course.id}`;
  };

  return (
    <div 
      className={`relative group overflow-hidden rounded-3xl p-8 backdrop-blur-sm border border-white/10 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate__animated animate__fadeInUp bg-gradient-to-br ${course.bgGradient} cursor-pointer`}
      style={{ animationDelay: `${index * 0.2}s` }}
      onClick={handleCourseClick}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${course.gradient} rounded-3xl blur-xl`}></div>
      {index < 3 && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#f59e0b] to-[#f97316] rounded-full">
          <span className="text-white text-xs font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            Popular
          </span>
        </div>
      )}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
        <span className="text-white text-xs font-medium">{course.level}</span>
      </div>

      <div className="relative mt-8">
        {/* Icon */}
        <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${course.gradient} text-white mb-6 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-4xl`}>
          {course.icon}
        </div>
        <div className="mb-6">
          <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${course.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
            {course.name}
          </h3>
          
          <p className="text-[#e2e8f0] leading-relaxed text-sm group-hover:text-white transition-colors duration-300 mb-4">
            {course.shortDescription}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <AccessTime className="w-4 h-4 text-[#94a3b8]" />
              <span className="text-[#e2e8f0] text-sm">{course.duration} Months</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#94a3b8]" />
              <span className="text-[#e2e8f0] text-sm">{course.level}</span>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-white">{formatPrice(course.price)}</span>
              <span className="text-[#94a3b8] text-sm ml-2">Full Program</span>
            </div>
            <div className="text-right">
              <div className="text-[#10b981] text-sm font-medium">Payment Plans Available</div>
              <div className="text-[#94a3b8] text-xs">Starting from {formatPrice(course.price / 2)}/month</div>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="text-white font-medium text-sm mb-3">What You'll Learn:</h4>
          <div className="space-y-2">
            {course.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#10b981] rounded-full"></div>
                <span className="text-[#e2e8f0] text-sm">{feature}</span>
              </div>
            ))}
            {course.features.length > 3 && (
              <div className="text-[#94a3b8] text-xs">+{course.features.length - 3} more skills</div>
            )}
          </div>
        </div>
        <button 
          className={`w-full px-6 py-3 rounded-xl bg-gradient-to-r ${course.gradient} text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 group/btn`}
          onClick={(e) => {
            e.stopPropagation();
            handleCourseClick();
          }}
        >
          <span>Learn More</span>
          <ArrowForward className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </button>
        <div className="absolute bottom-6 right-6 w-16 h-16 opacity-10 pointer-events-none">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${course.gradient} blur-lg`}></div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default CourseCard;
