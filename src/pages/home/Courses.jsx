import React from 'react'
import { coursesData } from '../../data/coursesData'
import CourseCard from '../../components/CourseCard'

export default function Courses() {
  return (
       <section className="py-10 px-6">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
               Our <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Courses</span>
             </h2>
             <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto animate__animated animate__fadeInUp animate__delay-1s">
               Choose from our comprehensive range of technology courses designed to make you industry-ready
             </p>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {coursesData.map((course, index) => (
               <CourseCard key={course.id} course={course} index={index} />
             ))}
           </div>
         </div>
    </section>
  )
}
