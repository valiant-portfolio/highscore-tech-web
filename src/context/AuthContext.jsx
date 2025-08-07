import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../api/axios';
import { coursesData } from '../data/coursesData'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [studentData, setstudentData] = useState({
      studentId: 'ST2024001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phoneNumber: '+234 801 234 5678',
      address: '123 Technology Street, Victoria Island',
      country: 'Nigeria',
      state: 'Lagos',
      city: 'Lagos',
      gender: 'Male',
      dateOfBirth: '1995-03-15',
      registrationDate: '2024-01-15',
      courseStartDate: '2024-02-01',
      courseEndDate: '2024-05-01',
      
      // Learning setup
      learningMode: 'online',
      hasLaptop: 'yes',
      laptopModel: 'MacBook Pro 2021',
      laptopRam: '16GB',
      
      // Preferences
      internshipInterest: 'yes',
      needAccommodation: 'no',
      needTshirt: 'yes',
      roomType: '',
      agreeToTerms: true,
      
      // Course information
      selectedCourse: 'blockchain-development',
      course: coursesData.find(course => course.id === 'blockchain-development'),
      
      // Progress tracking
      progress: {
        currentModule: 3,
        totalModules: 4,
        modulesCompleted: 2,
        averageGrade: 87,
        assignmentsCompleted: 8,
        totalAssignments: 12,
        modules: [
          {
            completed: true,
            grade: 92,
            completedTopics: [0, 1, 2, 3, 4],
            assignments: [
              { title: 'HTML5 Structure Project', completed: true, grade: 95 },
              { title: 'CSS3 Responsive Layout', completed: true, grade: 89 }
            ]
          },
          {
            completed: true,
            grade: 88,
            completedTopics: [0, 1, 2, 3, 4],
            assignments: [
              { title: 'React Components Assignment', completed: true, grade: 90 },
              { title: 'Props and State Quiz', completed: true, grade: 86 }
            ]
          },
          {
            completed: false,
            grade: 82,
            completedTopics: [0, 1, 2],
            assignments: [
              { title: 'Custom Hooks Project', completed: true, grade: 85 },
              { title: 'Context API Implementation', completed: false, grade: null }
            ]
          },
          {
            completed: false,
            grade: null,
            completedTopics: [],
            assignments: []
          }
        ],
        recentActivity: [
          {
            type: 'completed',
            title: 'Completed Custom Hooks Topic',
            description: 'Successfully learned about creating custom React hooks',
            date: '2024-01-20',
            score: 85
          },
          {
            type: 'assignment',
            title: 'Submitted Custom Hooks Project',
            description: 'Built a reusable custom hook for API calls',
            date: '2024-01-18',
            score: 92
          },
          {
            type: 'quiz',
            title: 'React Hooks Quiz',
            description: 'Completed assessment on useState and useEffect',
            date: '2024-01-16',
            score: 88
          }
        ]
      },
      
      // Payment information
      paymentStatus: 'current',
      attendance: 92,
      payments: [
        {
          date: '2024-02-01',
          amount: 33333.33,
          method: 'Bank Transfer',
          status: 'completed'
        },
        {
          date: '2024-03-01',
          amount: 33333.33,
          method: 'Card Payment',
          status: 'completed'
        }
      ],
      
      // Emergency contact
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Mother',
        phone: '+234 802 345 6789',
        email: 'jane.doe@email.com'
      },
      
      notes: 'Highly motivated student with strong problem-solving skills. Shows excellent progress in React development.'
    });
  
  const [appLoad, setAppLoad] = useState(true)

  const fetchstudentData = async () => {
    try {
      const token = Cookies.get('token'); 
      if (!token) {
        setstudentData(null);
        setAppLoad(false);
        return;
      }
      const response = await api.get('/auth/get-student')
      if (response.success) {
        setstudentData(response.data);
      } else {
          setstudentData(null);
      }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setstudentData(null);
      } finally {
        setAppLoad(false);
      }
    };

    useEffect(() => {
        fetchstudentData();
    }, []);

  return (
    <AuthContext.Provider value={{studentData, setstudentData, appLoad }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);