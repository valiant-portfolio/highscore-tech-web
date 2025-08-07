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

// Service Components
import IGamingDetail from './pages/services/iGamingDetail';
import CryptoExchangeDetail from './pages/services/CryptoExchangeDetail';
import AISolutionsDetail from './pages/services/AISolutionsDetail';
import MobileAppsDetail from './pages/services/MobileAppsDetail';
import EcommerceDetail from './pages/services/EcommerceDetail';
import TechTrainingDetail from './pages/services/TechTrainingDetail';
import StudentDashboard from './pages/students/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
    element:  <Register /> ,
    name: 'Register',
    showInNav: false,
    protected: false,
  },

    {
    path: '/student',
    element:<ProtectedRoute > <StudentDashboard /> </ProtectedRoute> ,
    name: 'Register',
    showInNav: false,
    protected: false,
  },
  
  // Service Routes
  {
    path: '/services/igaming',
    element: <IGamingDetail />,
    name: 'iGaming Services',
    showInNav: true,
    protected: false,
  },
  {
    path: '/services/crypto-exchange',
    element: <CryptoExchangeDetail />,
    name: 'Crypto Exchange Services',
    showInNav: true,
    protected: false,
  },
  {
    path: '/services/ai-solutions',
    element: <AISolutionsDetail />,
    name: 'AI Solutions Services',
    showInNav: true,
    protected: false,
  },
  {
    path: '/services/mobile-apps',
    element: <MobileAppsDetail />,
    name: 'Mobile Apps Services',
    showInNav: true,
    protected: false,
  },
  {
    path: '/services/ecommerce',
    element: <EcommerceDetail />,
    name: 'E-commerce Services',
    showInNav: true,
    protected: false,
  },
  {
    path: '/services/tech-training',
    element: <TechTrainingDetail />,
    name: 'Tech Training Services',
    showInNav: true,
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