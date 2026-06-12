import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import useLenis from '../lib/useLenis';

export default function Layout() {
  useLenis();

  return (
    <div className="min-h-screen flex flex-col font-body">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
