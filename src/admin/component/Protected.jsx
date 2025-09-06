import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AdminContext';
import Preloader from '../../components/Preloader';

const AdminProtectedRoute = ({ children }) => {
  const { adminData, appLoad } = useAuth();
  
  if (appLoad) {
    return <Preloader />;
  }
  
  if (!adminData) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
