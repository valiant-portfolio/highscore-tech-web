import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatPrice } from '../data/coursesData';

const CurriculumPDF = ({ course, onDownload }) => {
  const generatePDF = async () => {
    const content = document.getElementById('curriculum-content');
    
    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f0f23'
      });
      
      const imgData = canvas.getDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`${course.name.replace(/\s+/g, '_')}_Curriculum.pdf`);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>
      {/* Hidden curriculum content for PDF generation */}
      <div 
        id="curriculum-content" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          width: '794px', // A4 width in pixels at 96 DPI
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          padding: '40px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #2563eb', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 10px 0' }}>
            HighScore Tech
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: '0', fontStyle: 'italic' }}>
            Premier Software Development Training Academy
          </p>
        </div>

        {/* Course Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '24px', margin: '0 0 10px 0' }}>{course.icon}</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 10px 0' }}>
            {course.name}
          </h2>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
            Course Curriculum & Study Guide
          </p>
        </div>

        {/* Course Overview */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px', borderBottom: '2px solid #06b6d4', paddingBottom: '5px' }}>
            Course Overview
          </h3>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', lineHeight: '1.6', margin: '0', color: '#333' }}>
              {course.longDescription}
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 10px 0' }}>Course Details</h4>
              <ul style={{ fontSize: '12px', lineHeight: '1.8', margin: '0', paddingLeft: '20px', color: '#555' }}>
                <li><strong>Duration:</strong> {course.duration} months</li>
                <li><strong>Level:</strong> {course.level}</li>
                <li><strong>Price:</strong> {formatPrice(course.price)}</li>
                <li><strong>Monthly Payment:</strong> {formatPrice(course.price / course.duration)}/month</li>
                <li><strong>Instructor:</strong> {course.instructor}</li>
              </ul>
            </div>
            
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 10px 0' }}>What's Included</h4>
              <ul style={{ fontSize: '12px', lineHeight: '1.8', margin: '0', paddingLeft: '20px', color: '#555' }}>
                <li>1-Year Internship Program</li>
                <li>Portfolio Projects</li>
                <li>Job Placement Support</li>
                <li>Industry Certification</li>
                <li>24/7 Technical Support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px', borderBottom: '2px solid #06b6d4', paddingBottom: '5px' }}>
            Learning Objectives
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
            {course.features.map((feature, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '16px' }}>✓</span>
                <span style={{ fontSize: '12px', color: '#555' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Curriculum */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px', borderBottom: '2px solid #06b6d4', paddingBottom: '5px' }}>
            Detailed Curriculum
          </h3>
          {course.modules.map((module, index) => (
            <div key={index} style={{ marginBottom: '25px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', margin: '0' }}>
                    Module {index + 1}: {module.title}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#666', backgroundColor: '#e3f2fd', padding: '4px 8px', borderRadius: '12px' }}>
                    {module.duration}
                  </span>
                </div>
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {module.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#555' }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '8px' }}></span>
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prerequisites */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px', borderBottom: '2px solid #06b6d4', paddingBottom: '5px' }}>
            Prerequisites
          </h3>
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <ul style={{ fontSize: '12px', lineHeight: '1.8', margin: '0', paddingLeft: '20px', color: '#856404' }}>
              {course.requirements.map((requirement, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{requirement}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career Outcomes */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px', borderBottom: '2px solid #06b6d4', paddingBottom: '5px' }}>
            Career Outcomes
          </h3>
          <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
            <p style={{ fontSize: '12px', color: '#155724', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              Upon successful completion of this course, you will be able to:
            </p>
            <ul style={{ fontSize: '12px', lineHeight: '1.8', margin: '0', paddingLeft: '20px', color: '#155724' }}>
              {course.outcomes.map((outcome, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Study Schedule */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px', borderBottom: '2px solid #06b6d4', paddingBottom: '5px' }}>
            Recommended Study Schedule
          </h3>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 10px 0' }}>Weekly Commitment</h4>
                <ul style={{ fontSize: '12px', lineHeight: '1.6', margin: '0', paddingLeft: '20px', color: '#555' }}>
                  <li>15-20 hours per week</li>
                  <li>3-4 study sessions per week</li>
                  <li>2-3 practical projects per module</li>
                  <li>Weekly mentor sessions</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 10px 0' }}>Learning Format</h4>
                <ul style={{ fontSize: '12px', lineHeight: '1.6', margin: '0', paddingLeft: '20px', color: '#555' }}>
                  <li>Interactive video lectures</li>
                  <li>Hands-on coding exercises</li>
                  <li>Real-world project assignments</li>
                  <li>Peer collaboration sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #2563eb', textAlign: 'center' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', margin: '0 0 10px 0' }}>
            HighScore Tech Training Academy
          </h4>
          <p style={{ fontSize: '11px', color: '#666', margin: '0 0 10px 0' }}>
            Lagos, Nigeria | info@highscoretech.com | +234-XXX-XXX-XXXX
          </p>
          <p style={{ fontSize: '10px', color: '#999', margin: '0' }}>
            This curriculum is subject to updates and improvements. For the latest version, visit highscoretech.com
          </p>
          <div style={{ marginTop: '15px', fontSize: '10px', color: '#999' }}>
            Generated on: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button 
        onClick={generatePDF}
        className="w-full px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Download Curriculum PDF</span>
      </button>
    </div>
  );
};

export default CurriculumPDF;
