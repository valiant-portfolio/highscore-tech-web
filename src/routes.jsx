import { lazy } from 'react';
import { Navigate } from 'react-router';
import About from './pages/About';
// import Login from './pages/Auth/Login';
// import ProtectedRoute from './components/ProtectedRoute';

const NotFound = lazy(() => import('./pages/Notfound'));
const HomePage = lazy(() => import('./pages/home/Index'));


export const routes = [
  {
    path: '/',
    element: <HomePage /> ,
    name: 'Home',
    showInNav: false,
    protected: false,
  },
    {
    path: '/about',
    element: <About /> ,
    name: 'About',
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