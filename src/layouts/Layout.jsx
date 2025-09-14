import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { routes } from '../routes';
import TelegramIcon from '@mui/icons-material/Telegram';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
      {showNavigation && <Navbar />}
        <main className="pl-0 mx-auto">
          <Outlet />
        </main>
                <a
            href="https://t.me/valiant_joe"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              backgroundColor: 'var(--primary-blue)',
              color: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              zIndex: 1000,
            }}
          >
            <TelegramIcon />
          </a>
      {showNavigation && <Footer />}
      {/* <ChatModal /> */}
    </div>
  )
}

export default Layout
