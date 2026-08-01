import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
