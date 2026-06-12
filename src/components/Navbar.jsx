import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { getLenis } from '../lib/useLenis';

const menuList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const menuItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const LEFT_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/philanthropy', label: 'Philanthropy' },
  { to: '/alumni', label: 'Alumni' },
  { to: '/recruitment', label: 'Recruitment' },
];

const RIGHT_LINKS = [
  { to: '/calendar', label: 'Calendar' },
  { to: '/members', label: 'Members' },
  { to: '/contact', label: 'Contact' },
];

const DONATE_URL = 'https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  // Lock page scroll behind the fullscreen menu (Lenis keeps scrolling
  // through overflow:hidden, so stop it explicitly too).
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const lenis = getLenis();
    if (lenis) open ? lenis.stop() : lenis.start();
    return () => {
      document.body.style.overflow = '';
      getLenis()?.start();
    };
  }, [open]);

  const linkClass = (to) =>
    `text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 ${
      location.pathname === to
        ? 'text-primary underline decoration-wavy decoration-2 underline-offset-[6px] decoration-primary'
        : 'text-white/70 hover:text-white'
    }`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-black shadow-lg">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center transition-all duration-500 ${
            scrolled ? 'h-16' : 'h-24'
          }`}
        >
          {/* ── Left links (desktop) / Hamburger (mobile) ── */}
          <div className="flex items-center flex-1">
            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-10">
              {LEFT_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={linkClass(l.to)}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-white"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* ── Center crest (triangle only — full lockup lives in footer/print) ── */}
          <div className="flex-shrink-0 flex justify-center">
            <Link to="/" aria-label="TKE Epsilon Alpha Home">
              <motion.img
                src="/assets/tke-crest.png"
                alt="Tau Kappa Epsilon"
                initial={{ y: -96, opacity: 0 }}
                animate={{ y: 0, opacity: 1, height: scrolled ? 56 : 92 }}
                transition={{
                  y: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
                  opacity: { duration: 0.5, delay: 0.15 },
                  height: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                }}
                style={{ aspectRatio: '1220 / 1055' }}
                className="object-contain drop-shadow-lg"
              />
            </Link>
          </div>

          {/* ── Right links + Donate (desktop) ── */}
          <div className="hidden lg:flex items-center gap-10 flex-1 justify-end">
            {RIGHT_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass(l.to)}>
                {l.label}
              </Link>
            ))}
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <Heart className="h-3.5 w-3.5" /> Donate
                <ArrowRight className="h-3.5 w-3.5 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
            </a>
          </div>

          {/* Mobile right spacer to keep logo centered */}
          <div className="flex-1 lg:hidden" />
        </div>
      </div>

      {/* ── Black accent bar ── */}
      <div className="h-[3px] w-full bg-black" />

      {/* ── Fullscreen mobile menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed inset-0 z-0 bg-[hsl(0,0%,4%)] overflow-y-auto"
          >
            {/* Giant ΤΚΕ watermark */}
            <span
              aria-hidden="true"
              className="fixed -bottom-10 -right-2 font-heading font-bold text-outline-light select-none pointer-events-none leading-none"
              style={{ fontSize: 'clamp(11rem, 50vw, 20rem)' }}
            >
              ΤΚΕ
            </span>

            <motion.div
              variants={menuList}
              initial="hidden"
              animate="visible"
              className="relative min-h-full flex flex-col pt-28 pb-10 px-7"
            >
              <div className="space-y-2">
                {[...LEFT_LINKS, ...RIGHT_LINKS].map((l, i) => (
                  <motion.div key={l.to} variants={menuItem}>
                    <Link to={l.to} className="group flex items-baseline gap-4 py-1">
                      <span className="text-[11px] font-semibold text-white/35 tabular-nums">
                        0{i + 1}
                      </span>
                      <span
                        className={`font-heading font-bold leading-tight transition-colors ${
                          location.pathname === l.to
                            ? 'text-primary'
                            : 'text-white group-hover:text-primary'
                        }`}
                        style={{ fontSize: 'clamp(2.1rem, 8vw, 3.4rem)' }}
                      >
                        {l.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={menuItem} className="mt-auto pt-10">
                <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                    <Heart className="h-4 w-4" /> Donate to St. Jude
                  </Button>
                </a>
                <p className="mt-5 text-center text-xs text-white/40 tracking-widest uppercase">
                  Tau Kappa Epsilon — Epsilon Alpha
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
