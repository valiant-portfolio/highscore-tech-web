import React from 'react';
import jsPDF from 'jspdf';
import { formatPrice } from '../data/coursesData';

const SimpleCurriculumPDF = ({ course, onDownload }) => {
  const generateSimplePDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = 280;
    const lineHeight = 6;
    const margin = 20;

    // Helper function to add text with automatic page breaks
    const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
      if (yPosition > pageHeight) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      pdf.setTextColor(color[0], color[1], color[2]);
      
      const splitText = pdf.splitTextToSize(text, 170);
      pdf.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight;
    };

    const addLine = () => {
      pdf.setDrawColor(37, 99, 235);
      pdf.line(margin, yPosition, 190, yPosition);
      yPosition += 10;
    };

    // Header
    addText('HIGHSCORE TECH', 24, true, [37, 99, 235]);
    addText('Premier Software Development Training Academy', 12, false, [102, 102, 102]);
    yPosition += 10;
    addLine();

    // Course Title
    addText(`${course.icon} ${course.name}`, 20, true, [26, 26, 46]);
    addText('Course Curriculum & Study Guide', 12, false, [102, 102, 102]);
    yPosition += 15;

    // Course Overview
    addText('COURSE OVERVIEW', 16, true, [37, 99, 235]);
    yPosition += 5;
    addText(course.longDescription, 11);
    yPosition += 10;

    // Course Details
    addText('COURSE DETAILS', 14, true, [37, 99, 235]);
    yPosition += 5;
    addText(`Duration: ${course.duration} months`, 11);
    addText(`Level: ${course.level}`, 11);
    addText(`Price: ${formatPrice(course.price)}`, 11);
    addText(`Monthly Payment: ${formatPrice(course.price / course.duration)}/month`, 11);
    addText(`Instructor: ${course.instructor}`, 11);
    yPosition += 10;

    // What's Included
    addText("WHAT'S INCLUDED", 14, true, [37, 99, 235]);
    yPosition += 5;
    const included = [
      '• 1-Year Internship Program',
      '• Portfolio Projects',
      '• Job Placement Support', 
      '• Industry Certification',
      '• 24/7 Technical Support'
    ];
    included.forEach(item => addText(item, 11));
    yPosition += 10;

    // Learning Objectives
    addText('LEARNING OBJECTIVES', 14, true, [37, 99, 235]);
    yPosition += 5;
    course.features.forEach(feature => {
      addText(`✓ ${feature}`, 11);
    });
    yPosition += 10;

    // Detailed Curriculum
    addText('DETAILED CURRICULUM', 14, true, [37, 99, 235]);
    yPosition += 5;

    course.modules.forEach((module, index) => {
      addText(`Module ${index + 1}: ${module.title} (${module.duration})`, 12, true, [26, 26, 46]);
      yPosition += 2;
      
      module.topics.forEach(topic => {
        addText(`• ${topic}`, 10);
      });
      yPosition += 5;
    });

    // Prerequisites
    addText('PREREQUISITES', 14, true, [37, 99, 235]);
    yPosition += 5;
    course.requirements.forEach(requirement => {
      addText(`• ${requirement}`, 11);
    });
    yPosition += 10;

    // Career Outcomes
    addText('CAREER OUTCOMES', 14, true, [37, 99, 235]);
    yPosition += 5;
    addText('Upon successful completion of this course, you will be able to:', 11, true);
    course.outcomes.forEach(outcome => {
      addText(`• ${outcome}`, 10);
    });
    yPosition += 10;

    // Study Schedule
    addText('RECOMMENDED STUDY SCHEDULE', 14, true, [37, 99, 235]);
    yPosition += 5;
    const schedule = [
      'Weekly Commitment: 15-20 hours per week',
      'Study Sessions: 3-4 sessions per week',
      'Projects: 2-3 practical projects per module',
      'Support: Weekly mentor sessions',
      'Format: Interactive video lectures, hands-on coding, real-world projects'
    ];
    schedule.forEach(item => addText(`• ${item}`, 11));
    yPosition += 15;

    // Footer
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    addLine();
    addText('HighScore Tech Training Academy', 12, true, [37, 99, 235]);
    addText('Lagos, Nigeria | info@highzcore.tech | +234-811-2639073', 10, false, [102, 102, 102]);
    addText(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 9, false, [153, 153, 153]);

    // Save the PDF
    pdf.save(`${course.name.replace(/\s+/g, '_')}_Curriculum.pdf`);
    
    if (onDownload) onDownload();
  };

  return (
    <button 
      onClick={generateSimplePDF}
      className="w-full px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Download Curriculum PDF</span>
    </button>
  );
};

export default SimpleCurriculumPDF;
