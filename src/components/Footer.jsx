import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, ArrowRight, Instagram } from 'lucide-react';
import Reveal from './Reveal';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Philanthropy', to: '/philanthropy' },
  { label: 'Alumni', to: '/alumni' },
  { label: 'Recruitment', to: '/recruitment' },
  { label: 'News', to: '/news' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[hsl(0,0%,7%)] text-white/70">
      {/* Statement band — the award-site signoff */}
      <div className="border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal>
            <p
              className="font-heading font-bold tracking-tight text-white leading-[1.02]"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
            >
              Better Men for a<br />
              <span className="text-primary">Better World.</span>
            </p>
            <Link
              to="/recruitment"
              className="group inline-flex items-center gap-2 mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 hover:text-white transition-colors"
            >
              Join the brotherhood
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <img
              src="/assets/tke-lockup-dark.png"
              alt="Tau Kappa Epsilon — Epsilon Alpha Chapter"
              width="200"
              className="w-[200px] h-auto mb-4"
            />
            <p className="text-sm leading-relaxed mb-4">
              Tau Kappa Epsilon — Epsilon Alpha Chapter at Saint Louis University.
              Building Better Men since 1955.
            </p>
            <div className="flex items-center gap-2 text-accent text-sm">
              <Heart className="h-4 w-4" />
              <span>Proud partners of St. Jude Children's Research Hospital</span>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">Navigate</h4>
            <ul className="space-y-2">
              {LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm hover:text-accent transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <p className="font-medium text-white">Anthony Fahim</p>
              <a href="tel:3143745893" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4" /> (314) 374-5893
              </a>
              <a href="mailto:slutkestewardship@gmail.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" /> slutkestewardship@gmail.com
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Instagram className="h-4 w-4" /> @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} TKE Epsilon Alpha Chapter. All rights reserved.</p>
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
          <a href="https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry" target="_blank" rel="noopener noreferrer"
            className="text-xs text-accent hover:text-accent/80 transition-colors font-semibold">
            Support St. Jude →
          </a>
        </div>
      </div>
    </footer>
  );
}