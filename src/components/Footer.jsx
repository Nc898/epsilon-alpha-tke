import { Link } from 'react-router-dom';
import { Heart, Phone, Mail } from 'lucide-react';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Philanthropy', to: '/philanthropy' },
  { label: 'Alumni', to: '/alumni' },
  { label: 'Recruitment', to: '/recruitment' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[hsl(0,0%,7%)] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              TKE <span className="text-accent">ΕΑ</span>
            </h3>
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
              <a href="mailto:tke.epsilonalpha@slu.edu" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" /> tke.epsilonalpha@slu.edu
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {new Date().getFullYear()} TKE Epsilon Alpha Chapter. All rights reserved.</p>
          <a href="https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry" target="_blank" rel="noopener noreferrer"
            className="text-xs text-accent hover:text-accent/80 transition-colors font-semibold">
            Support St. Jude →
          </a>
        </div>
      </div>
    </footer>
  );
}