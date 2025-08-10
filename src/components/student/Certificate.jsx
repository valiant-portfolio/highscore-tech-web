import React, { useRef, useState } from 'react'
import { Download, EmojiEvents, Verified, GetApp } from '@mui/icons-material'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import 'animate.css'

export default function Certificate({ studentData }) {
  const certificateRef = useRef();
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  const isEligibleForCertificate = () => {
    const progress = studentData?.progress;
    if (!progress) return false;
    // Check if course is completed (100% progress and all modules completed)
    // const overallProgress = getOverallProgress();
    // const hasPassingGrade = (progress.averageGrade || 0) >= 70;

    const overallProgress = 100;
    const hasPassingGrade =  70;
    
    return overallProgress >= 100 && hasPassingGrade;
  };

  const getOverallProgress = () => {
    if (!studentData?.course?.modules || !studentData?.progress?.modules) return 0;
    
    const totalModules = studentData.course.modules.length;
    let completedModules = 0;
    
    studentData.course.modules.forEach((_, index) => {
      const moduleProgress = studentData.progress.modules[index];
      if (moduleProgress && moduleProgress.completed) {
        completedModules++;
      }
    });
    
    return Math.round((completedModules / totalModules) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletionDate = () => {
    return studentData?.courseEndDate || new Date().toISOString().split('T')[0];
  };

  const downloadCertificate = async (format) => {
    if (!certificateRef.current) return;

    try {
      // Create canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        width: 1400,
        height: 1000,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true
      });

      const imgData = canvas.toDataURL('image/png');
      const fileName = `HighScore_Tech_Certificate_${studentData?.firstName}_${studentData?.lastName}`;

      if (format === 'jpg') {
        // Download as JPG
        const jpgCanvas = document.createElement('canvas');
        const jpgCtx = jpgCanvas.getContext('2d');
        jpgCanvas.width = canvas.width;
        jpgCanvas.height = canvas.height;
        
        // Fill white background
        jpgCtx.fillStyle = '#ffffff';
        jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
        
        // Draw the certificate
        const img = new Image();
        img.onload = () => {
          jpgCtx.drawImage(img, 0, 0);
          
          // Create download link
          jpgCanvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.jpg`;
            link.click();
            URL.revokeObjectURL(link.href);
          }, 'image/jpeg', 0.95);
        };
        img.src = imgData;
      } else {
        // Download as PDF
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 297; // A4 landscape width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const yOffset = (210 - imgHeight) / 2; // Center vertically

        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error generating certificate. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeInUp animate__delay-3s">
      {/* Certificate Status */}
      <div className={`bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 ${
        isEligibleForCertificate() ? 'border-green-500/50 bg-green-500/5' : ''
      }`}>
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-xl mr-4 ${
            isEligibleForCertificate() 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <EmojiEvents className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isEligibleForCertificate() ? 'Certificate Available!' : 'Certificate Not Available'}
            </h3>
            <p className="text-[#e2e8f0]">
              {isEligibleForCertificate() 
                ? 'Congratulations! You have completed the course and earned your certificate.'
                : 'Complete the course with a passing grade to earn your certificate.'
              }
            </p>
          </div>
        </div>

        {!isEligibleForCertificate() && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-yellow-400 font-semibold mb-2">Requirements for Certificate:</h4>
            <ul className="space-y-1 text-[#e2e8f0] text-sm">
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  getOverallProgress() >= 100 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                Complete all course modules (Currently: {getOverallProgress()}%)
              </li>
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  (studentData?.progress?.averageGrade || 0) >= 70 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                Maintain minimum 70% average grade (Currently: {studentData?.progress?.averageGrade || 0}%)
              </li>
              <li className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  (studentData?.attendance || 0) >= 80 ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                Maintain minimum 80% attendance (Currently: {studentData?.attendance || 0}%)
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Certificate Preview */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center">
          <Verified className="mr-3 text-[#f97316]" />
          Certificate Preview
        </h3>

        {/* Certificate Display */}
        <div className="relative">
          <div 
            ref={certificateRef}
            className={`mx-auto transition-all duration-500 ${
              isEligibleForCertificate() ? 'opacity-100' : 'opacity-50'
            }`}
            style={{ 
              width: '1400px', 
              height: '1000px',
              maxWidth: '100%',
              aspectRatio: '1.4/1',
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Animation Particles */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-20"
                  style={{
                    width: `${Math.random() * 4 + 2}px`,
                    height: `${Math.random() * 4 + 2}px`,
                    backgroundColor: ['#2563eb', '#06b6d4', '#7c3aed', '#ec4899'][Math.floor(Math.random() * 4)],
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 3}s`
                  }}
                />
              ))}
            </div>

            {/* Main Certificate Content */}
            <div className="relative z-10 h-full flex flex-col p-20 text-white">
              {/* Logo at top left */}
              <div className="mb-12">
                <img 
                  src="/assets/short-logo.png" 
                  alt="HighScore Tech Logo" 
                  className="w-24 h-24 object-contain"
                />
              </div>

              {/* Certificate Header - Center */}
              <div className="text-center mb-16">
                <h1 className="text-7xl font-bold text-white mb-8" style={{ 
                  fontFamily: 'serif',
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Certificate of Completion
                </h1>
              </div>

              {/* Certificate Body */}
              <div className="text-center flex-1 flex flex-col justify-center space-y-12">
                <p className="text-3xl text-white font-light">This is to verify that,</p>
                
                {/* Student Name with underline */}
                <div className="relative">
                  <h2 className="text-6xl font-bold text-white mb-4" style={{ fontFamily: 'serif' }}>
                    {studentData?.firstName} {studentData?.lastName}
                  </h2>
                  <div className="w-96 h-1 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] mx-auto"></div>
                </div>
                
                {/* Course completion text */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-3xl text-white font-light leading-relaxed">
                    Has successfully completed his intensive training on{' '}
                    <span className="font-bold uppercase text-4xl" style={{
                      background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {studentData?.course?.name}
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer Section with lines and circle */}
              <div className="mt-16">
                <div className="flex items-center justify-between">
                  {/* Left line with CEO */}
                  <div className="flex-1 text-center">
                    <div className="w-72 h-0.5 bg-white mx-auto mb-4"></div>
                    <p className="text-xl text-white font-medium">HighScore Tech CEO</p>
                  </div>
                  
                  {/* Center circle design */}
                  <div className="mx-12">
                    <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4] flex items-center justify-center">
                        <Verified className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Right line with Date */}
                  <div className="flex-1 text-center">
                    <div className="w-72 h-0.5 bg-white mx-auto mb-4"></div>
                    <p className="text-xl text-white font-medium">Date</p>
                    <p className="text-lg text-white/80 mt-2">{formatDate(getCompletionDate())}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay for non-eligible certificates */}
          {!isEligibleForCertificate() && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
              <div className="text-center text-white">
                <EmojiEvents className="text-8xl mb-6 opacity-50" />
                <h4 className="text-3xl font-bold mb-4">Complete Course to Unlock</h4>
                <p className="text-xl text-[#e2e8f0]">Finish all requirements to earn your certificate</p>
              </div>
            </div>
          )}
        </div>

        {/* Download Section - Only show if eligible */}
        {isEligibleForCertificate() && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-white/10">
              <p className="text-[#e2e8f0] mb-6 text-lg">
                🎉 Congratulations! Your certificate is ready for download.
              </p>
              
              {/* Format Selection */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setDownloadFormat('pdf')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    downloadFormat === 'pdf'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-white/10 text-[#e2e8f0] hover:bg-white/20'
                  }`}
                >
                  PDF Format
                </button>
                <button
                  onClick={() => setDownloadFormat('jpg')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                    downloadFormat === 'jpg'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-white/10 text-[#e2e8f0] hover:bg-white/20'
                  }`}
                >
                  JPG Format
                </button>
              </div>

              {/* Download Button */}
              <button 
                onClick={() => downloadCertificate(downloadFormat)}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto text-lg"
              >
                <Download className="mr-3 text-xl" />
                Download Certificate ({downloadFormat.toUpperCase()})
              </button>
              
              <div className="flex justify-center space-x-4 mt-4">
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                  Course Completed
                </span>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                  Grade: {studentData?.progress?.averageGrade || 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation for particles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-15px) translateX(8px); 
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}
