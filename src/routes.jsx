import { lazy } from 'react';
import { Navigate } from 'react-router';
import Examination from './pages/exam/Index';
import Test from './pages/test/Index';

// Lazy load all components for better performance
const NotFound = lazy(() => import('./pages/Notfound'));
const HomePage = lazy(() => import('./pages/home/Index'));
const About = lazy(() => import('./pages/About'));
const Course = lazy(() => import('./pages/Courses/Index'));
const CourseDetail = lazy(() => import('./pages/Courses/CourseDetail'));
const Login = lazy(() => import('./pages/auth/Login'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const Register = lazy(() => import('./pages/auth/Register'));
// const ExamPage = lazy(() => import('./pages/Exam'));

// Service Components - Lazy loaded
const IGamingDetail = lazy(() => import('./pages/services/iGamingDetail'));
const CryptoExchangeDetail = lazy(() => import('./pages/services/CryptoExchangeDetail'));
const AISolutionsDetail = lazy(() => import('./pages/services/AISolutionsDetail'));
const MobileAppsDetail = lazy(() => import('./pages/services/MobileAppsDetail'));
const EcommerceDetail = lazy(() => import('./pages/services/EcommerceDetail'));
const TechTrainingDetail = lazy(() => import('./pages/services/TechTrainingDetail'));
const NDAIndex = lazy(() => import('./pages/NDA/Index'));

// Student Dashboard - Lazy loaded
const StudentDashboard = lazy(() => import('./pages/students/StudentDashboard'));

// Protected Route - Lazy loaded
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

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
    path: '/admin-login',
    element: <AdminLogin /> ,
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
    path: '/nd-agreement',
    element:  <NDAIndex /> ,
    name: 'agreement',
    showInNav: false,
    protected: false,
  },
  {
    path: '/test',
    element: <Test /> ,
    name: 'Examination',
    showInNav: false,
    protected: false,
  },
  // {
  //   path: '/exam',
  //   element: <ExamPage />,
  //   name: 'Exam',
  //   showInNav: false,
  //   protected: false,
  // },
  {
    path: '/student',
    element:<ProtectedRoute > <StudentDashboard /> </ProtectedRoute> ,
    name: 'StudentDashboard',
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