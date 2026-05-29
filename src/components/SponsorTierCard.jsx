import { Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TIER_CONFIG = {
  title: { color: 'from-primary to-red-900', benefits: ['Premier logo placement on all materials', 'Exclusive event naming rights', 'VIP table at Gala (10 seats)', 'Social media feature campaign', 'Website homepage banner', 'Speaking opportunity at events'] },
  platinum: { color: 'from-slate-300 to-slate-500', benefits: ['Logo on all event materials', 'VIP table at Gala (8 seats)', 'Social media recognition', 'Website sponsor page feature', 'Event signage'] },
  gold: { color: 'from-accent/80 to-accent', benefits: ['Logo on event materials', 'Gala tickets (6)', 'Social media mention', 'Website logo placement'] },
  silver: { color: 'from-slate-400 to-slate-500', benefits: ['Logo on select materials', 'Gala tickets (4)', 'Website logo placement'] },
  bronze: { color: 'from-amber-700 to-amber-900', benefits: ['Name on event materials', 'Gala tickets (2)', 'Website listing'] },
  friend: { color: 'from-primary/60 to-primary', benefits: ['Name listed on website', 'Recognition at events'] },
};

export default function SponsorTierCard({ tier, price }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.friend;
  const label = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all duration-300">
      <div className={`bg-gradient-to-r ${config.color} p-4 flex items-center gap-3`}>
        <Star className="h-5 w-5 text-white" />
        <h3 className="font-heading text-lg font-bold text-white">{label} Sponsor</h3>
      </div>
      <div className="p-6">
        {price && <p className="font-heading text-2xl font-bold text-foreground mb-4">${price.toLocaleString()}</p>}
        <ul className="space-y-2 mb-6">
          {config.benefits.map(b => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Link to="/contact?type=sponsorship">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" size="sm">
            Become a Sponsor
          </Button>
        </Link>
      </div>
    </div>
  );
}