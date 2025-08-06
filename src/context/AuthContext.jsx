import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [studentData, setstudentData] = useState(null); 
  const [appLoad, setAppLoad] = useState(true)

  const fetchstudentData = async () => {
    try {
      const token = Cookies.get('token'); 
      if (!token) {
        setstudentData(null);
        setAppLoad(false);
        return;
      }
      const response = await api.get('/student/profile')
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