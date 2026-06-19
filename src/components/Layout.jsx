import { Outlet, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import NewsDrawer from './NewsDrawer';
import ExternalLinkInterstitial from './ExternalLinkInterstitial';
import GrainOverlay from './GrainOverlay';
import CustomCursor from './CustomCursor';
import useLenis from '../lib/useLenis';

export default function Layout() {
  useLenis();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col font-body">
      <ScrollToTop />
      <GrainOverlay />
      <CustomCursor />
      <Navbar />
      <NewsDrawer />
      <ExternalLinkInterstitial />
      <main className="flex-1">
        {/* Keyed on pathname so each route entry fades/rises in. No exit
            animation — exit + ScrollToTop causes flicker. */}
        <motion.div
          key={pathname}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
