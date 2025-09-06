import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminData, setadminData] = useState(null);
  const [appLoad, setAppLoad] = useState(true)

  const fetchAdmin = async () => {
    try {
      const token = Cookies.get('token-admin'); 
      if (!token) {
        setadminData(null);
        setAppLoad(false);
        return;
      }
      const response = await api.get('/auth/get-admin')
      if (response.success) {
        setadminData(response.data);
      } else {
          setadminData(null);
      }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setadminData(null);
      } finally {
        setAppLoad(false);
      }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

  return (
    <AuthContext.Provider value={{adminData, setadminData, appLoad }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);