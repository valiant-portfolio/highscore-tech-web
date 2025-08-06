import { lazy } from 'react';
import { Navigate } from 'react-router';

// import Login from './pages/Auth/Login';
// import ProtectedRoute from './components/ProtectedRoute';

const NotFound = lazy(() => import('./pages/Notfound'));
const HomePage = lazy(() => import('./pages/home/Index'));
import About from './pages/About';
import Course from './pages/Courses/Index';
import CourseDetail from './pages/Courses/CourseDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

export const routes = [
  {
    path: '/',
    element: <HomePage /> ,
    name: 'Home',
    showInNav: true,
    protected: false,
  },
  {
    path: '/about',
    element: <About /> ,
    name: 'About',
    showInNav: true,
    protected: false,
  },
  {
    path: '/courses',
    element: <Course /> ,
    name: 'About',
    showInNav: true,
    protected: false,
  },
    {
    path: '/course/:courseId',
    element: <CourseDetail /> ,
    name: 'About',
    showInNav: true,
    protected: false,
  },
  {
    path: '/login',
    element: <Login /> ,
    name: 'Login',
    showInNav: false,
    protected: false,
  },
  {
    path: '/register',
    element: <Register /> ,
    name: 'Register',
    showInNav: false,
    protected: false,
  },


  // {
  //   path: '/transactions',
  //   element: <ProtectedRoute><Transactions /></ProtectedRoute>,
  //   name: 'Transactions',
  //   showInNav: true,
  //   protected: true,
  //   children: [
  //     {
  //       index: true,
  //       element: <DepositsTable />,
  //     },
 
  //   ],
  // },
  {
    path: '*',
    element: <NotFound />,
    name: 'Not Found',
    showInNav: false,
    protected: false,
  },
];