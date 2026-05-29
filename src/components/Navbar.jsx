import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/philanthropy', label: 'Philanthropy' },
  { to: '/alumni', label: 'Alumni' },
  { to: '/recruitment', label: 'Recruitment' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const isHome = location.pathname === '/';
  const solid = scrolled || !isHome;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      solid ? 'bg-[hsl(0,0%,7%)]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl lg:text-2xl font-bold text-white tracking-tight">
              TKE <span className="text-accent">ΕΑ</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-xs font-semibold tracking-widest uppercase transition-colors ${
                  location.pathname === l.to ? 'text-accent' : 'text-white/70 hover:text-white'
                }`}>{l.label}</Link>
            ))}
            <a href="https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                <Heart className="h-4 w-4" /> Donate
              </Button>
            </a>
            <img src="https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/fa6dfbb4f_images-8.png" alt="TKE Logo" className="h-10 w-10 object-contain" />
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-[hsl(0,0%,7%)]/95 backdrop-blur-md border-t border-white/10 animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to}
                className="block py-3 text-white/80 hover:text-accent font-medium uppercase text-sm tracking-wide">
                {l.label}
              </Link>
            ))}
            <a href="https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry" target="_blank" rel="noopener noreferrer" className="block pt-3">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                <Heart className="h-4 w-4" /> Donate to St. Jude
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}