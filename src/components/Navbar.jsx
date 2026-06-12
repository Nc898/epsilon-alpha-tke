import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LEFT_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/philanthropy', label: 'Philanthropy' },
  { to: '/alumni', label: 'Alumni' },
];

const RIGHT_LINKS = [
  { to: '/recruitment', label: 'Recruitment' },
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

  const linkClass = (to) =>
    `text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200 ${
      location.pathname === to
        ? 'text-primary underline decoration-wavy decoration-2 underline-offset-[6px] decoration-primary'
        : 'text-white/70 hover:text-white'
    }`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                animate={{ height: scrolled ? 48 : 80 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: 'auto' }}
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

      {/* ── Mobile slide-down menu ── */}
      {open && (
        <div className="lg:hidden bg-black border-t border-white/10 animate-in slide-in-from-top-2">
          <div className="px-5 py-5 space-y-1">
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`block py-3 font-semibold uppercase text-sm tracking-widest border-b border-white/5 last:border-0 transition-colors ${
                  location.pathname === l.to
                    ? 'text-primary underline decoration-wavy decoration-2 underline-offset-[6px] decoration-primary'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4">
              <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                  <Heart className="h-4 w-4" /> Donate to St. Jude
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
