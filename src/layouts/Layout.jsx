import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Preloader from '../components/Preloader';
import { routes } from '../routes';

const Layout = () => {
  const location = useLocation();
  const getCurrentRoute = () => {
  let currentRoute = routes.find(route => route.path === location.pathname);
  if (!currentRoute) {
    currentRoute = routes.find(route => {
      if (route.children && location.pathname.startsWith(route.path)) {
        return true;
      }
      return false;
    });
  }
  
  if (!currentRoute) {
    currentRoute = routes.find(route => route.path === '*');
  }
  
  return currentRoute;
};
  
  const currentRoute = getCurrentRoute();
  
  const showNavigation = currentRoute?.showInNav 

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      <Suspense fallback={<Preloader />}>
      {showNavigation && <Navbar />}
        <main className="pl-0 mx-auto">
          <Outlet />
        </main>
         {showNavigation && <Footer />}
      </Suspense>
    </div>
  );
};

export default Layout;