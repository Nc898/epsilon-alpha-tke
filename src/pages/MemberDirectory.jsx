import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, User, Crown, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageHero from '../components/PageHero';
import ValuesShowcase from '../components/ValuesShowcase';
import Reveal from '../components/Reveal';

// ── Chapter leadership (Epsilon Alpha) ──────────────────────────────────────
const ADVISORS = [
  { name: 'Brandon Krawczyk', role: 'Chapter Advisor' },
  { name: 'Dylan Casas', role: 'Chapter Advisor' },
];

const EXEC_BOARD = [
  { name: 'Anthony Fahim', role: 'President', lead: true },
  { name: 'Anthony Gallina', role: 'Vice President' },
  { name: 'Ronan Smith', role: 'Secretary' },
  { name: 'Samuel Montealgre', role: 'Chaplain' },
  { name: 'Daniel Rodriguez', role: 'Sergeant at Arms' },
  { name: 'Kaden Luker', role: 'Historian' },
  { name: 'Sami Hussein', role: 'Treasurer' },
  { name: 'Alex Renner', role: 'New Member Educator' },
];

const CHAIRS = [
  { name: 'Josh Schmidt', role: 'Philanthropy Chairman' },
  { name: 'Alex Adekunle', role: 'Recruitment Chairman' },
  { name: 'Lucas Borage', role: 'Social Chairman' },
  { name: 'Ammar Sakroujeh', role: 'Public Relations Chairman' },
  { name: 'Jackson Keily', role: 'Athletics Chairman' },
  { name: 'Alex Renner', role: 'Merchandise Chairman' },
  { name: 'Ronan Smith', role: 'IFC Delegate' },
  { name: 'Nick Childs', role: 'Web Designer' },
  { name: 'Alex Eckert', role: 'Photographer' },
];

function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function LeaderCard({ person, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 5) * 0.05 }}
      className={`group bg-card border rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        person.lead ? 'border-primary/40 shadow-sm' : 'border-border'
      }`}
    >
      <div
        className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center font-heading font-bold text-xl text-primary bg-primary/10 ring-2 ring-offset-2 ring-offset-card ${
          person.lead ? 'ring-primary' : 'ring-primary/30'
        }`}
      >
        {person.photo ? (
          <div className="duotone-wrap w-full h-full rounded-full overflow-hidden">
            <img src={person.photo} alt={person.name} className="duotone w-full h-full object-cover" />
          </div>
        ) : (
          initials(person.name)
        )}
      </div>

      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
        {person.lead && <Crown className="h-3 w-3" />}
        {person.role}
      </span>

      <h3 className="font-heading font-bold text-foreground text-lg leading-tight relative after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-3/4">
        {person.name}
      </h3>
    </motion.div>
  );
}

function LeadershipSection({ eyebrow, title, icon, people, bg = 'bg-background' }) {
  return (
    <section className={`py-16 sm:py-20 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10 sm:mb-12">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">{eyebrow}</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground inline-flex items-center gap-3">
            {icon} {title}
          </h2>
        </Reveal>
        <div
          className={
            people.length <= 2
              ? 'grid grid-cols-2 gap-5 max-w-md mx-auto'
              : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'
          }
        >
          {people.map((p, i) => (
            <LeaderCard key={`${p.role}-${p.name}`} person={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GeneralMemberCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.04 }}
      className="group bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition-all"
    >
      <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center bg-primary/10 ring-1 ring-border overflow-hidden">
        {member.photo ? (
          <div className="duotone-wrap w-full h-full">
            <img src={member.photo} alt={member.name} className="duotone w-full h-full object-cover" />
          </div>
        ) : (
          <span className="font-heading font-bold text-primary/70">{initials(member.name || '?')}</span>
        )}
      </div>
      <h3 className="font-heading font-bold text-foreground text-base leading-tight">{member.name}</h3>
      {(member.major || member.graduation_year) && (
        <p className="text-muted-foreground text-xs mt-1">
          {member.major}
          {member.major && member.graduation_year ? ' · ' : ''}
          {member.graduation_year ? `Class of '${String(member.graduation_year).slice(-2)}` : ''}
        </p>
      )}
    </motion.div>
  );
}

export default function MemberDirectory() {
  const [search, setSearch] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.filter({ active: true }, 'display_order'),
  });

  const generalMembers = useMemo(() => {
    let list = members;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.major?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, search]);

  return (
    <div className="pt-24">
      <PageHero
        eyebrow="06 — Our Brotherhood"
        title="Member Directory"
        accent="Directory"
        watermark="BROTHERS"
        lead="Meet the men of TKE Epsilon Alpha — leaders, scholars, and brothers united in purpose."
        media={<ValuesShowcase />}
      />

      <LeadershipSection
        eyebrow="Guidance"
        title="Chapter Advisors"
        icon={<ShieldCheck className="h-7 w-7 text-primary" />}
        people={ADVISORS}
        bg="bg-background"
      />

      <LeadershipSection
        eyebrow="Leadership"
        title="Executive Board"
        icon={<Crown className="h-7 w-7 text-primary" />}
        people={EXEC_BOARD}
        bg="bg-muted/50"
      />

      <LeadershipSection
        eyebrow="Committees"
        title="Chairs & Officers"
        people={CHAIRS}
        bg="bg-background"
      />

      {/* General members */}
      <section className="py-16 sm:py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">The Chapter</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Members</h2>
          </Reveal>

          <div className="relative flex-1 mb-10 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or major…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : generalMembers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-heading text-xl font-bold text-foreground mb-2">
                {members.length === 0 ? 'Member profiles coming soon' : 'No members match your search.'}
              </p>
              {members.length === 0 && (
                <p className="text-muted-foreground max-w-sm mx-auto">
                  The full brotherhood roster is being added — check back soon to meet every brother of
                  Epsilon Alpha.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {generalMembers.map((m, i) => (
                <GeneralMemberCard key={m.id} member={m} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
