import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import Reveal from './Reveal';

const ST_JUDE_URL = 'https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry';

export default function StJudeSection() {
  return (
    <section className="py-20 sm:py-28 bg-[hsl(0,0%,7%)] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Our Mission</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Fighting Childhood Cancer <br className="hidden sm:block" />
              <span className="text-primary">with St. Jude</span>
            </h2>
            <div className="w-16 h-0.5 bg-accent mb-6" />
            <div className="space-y-4 text-white/80 leading-relaxed">
              <p>
                Tau Kappa Epsilon has partnered with St. Jude Children's Research Hospital for decades,
                united by a shared mission to find cures and save children's lives.
              </p>
              <p>
                Families never receive a bill from St. Jude for treatment, travel, housing, or food —
                because all a family should worry about is helping their child live.
              </p>
              <p>
                The Epsilon Alpha Chapter is committed to making a meaningful impact in the fight against
                childhood cancer through fundraising events, community engagement, and awareness campaigns.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <Heart className="h-5 w-5" /> Donate Now
                </Button>
              </a>
              <Link to="/philanthropy">
                <Button size="lg" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 font-semibold gap-2 h-12 px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Our Events <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative">
              <img src="https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/34dc63c53_tempImage0dskXs.jpg" alt="TKE Brothers volunteering for St. Jude"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground rounded-xl p-5 shadow-xl">
                <p className="font-heading text-3xl font-bold">$50K</p>
                <p className="text-sm font-medium">Annual Goal</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
