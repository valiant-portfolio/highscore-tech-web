import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Preloader from '../components/Preloader';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      <Suspense fallback={<Preloader />}>
        <Navbar />
        <main className="pl-0 mx-auto">
          <Outlet />
        </main>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Layout;