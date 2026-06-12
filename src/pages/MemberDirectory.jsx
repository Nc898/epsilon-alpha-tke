import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Mail, Search, User, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PageHero from '../components/PageHero';

const EXEC_POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Recruitment Chair',
  'Philanthropy Chair',
  'Alumni Relations Chair',
  'Risk Manager',
  'Chaplain',
  'Sergeant at Arms',
  'Historian',
  'Marshal',
];

function MemberCard({ member, index }) {
  const isExec = member.position && member.position.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
      className={`group bg-card border rounded-2xl overflow-hidden flex flex-col items-center text-center p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${
        isExec ? 'border-primary/30 shadow-sm' : 'border-border'
      }`}
    >
      {/* Photo */}
      <div className={`w-24 h-24 rounded-full overflow-hidden mb-4 flex-shrink-0 ${
        isExec ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border'
      }`}>
        {member.photo ? (
          <div className="duotone-wrap w-full h-full">
            <img src={member.photo} alt={member.name} className="duotone w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </div>

      {/* Position badge */}
      {isExec && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-2">
          <Crown className="h-3 w-3" /> {member.position}
        </span>
      )}

      {/* Name */}
      <h3 className="font-heading font-bold text-foreground text-lg leading-tight relative after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-3/4">
        {member.name}
      </h3>

      {/* Major / Year */}
      {(member.major || member.graduation_year) && (
        <p className="text-muted-foreground text-xs mt-1">
          {member.major}{member.major && member.graduation_year ? ' · ' : ''}{member.graduation_year ? `Class of '${String(member.graduation_year).slice(-2)}` : ''}
        </p>
      )}

      {/* Bio */}
      {member.bio && (
        <p className="text-muted-foreground text-sm mt-3 line-clamp-2 leading-relaxed">
          {member.bio}
        </p>
      )}

      {/* Email */}
      <a
        href={`mailto:${member.email}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        <Mail className="h-3.5 w-3.5" />
        {member.email}
      </a>
    </motion.div>
  );
}

export default function MemberDirectory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.filter({ active: true }, 'display_order'),
  });

  const execMembers = useMemo(() =>
    members.filter(m => m.position && m.position.trim() !== '')
      .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99)),
    [members]
  );

  const generalMembers = useMemo(() =>
    members.filter(m => !m.position || m.position.trim() === ''),
    [members]
  );

  const filteredMembers = useMemo(() => {
    let list = filter === 'exec' ? execMembers : filter === 'members' ? generalMembers : members;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q) ||
        m.major?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, execMembers, generalMembers, filter, search]);

  return (
    <div className="pt-24">
      {/* Header */}
      <PageHero
        eyebrow="06 — Our Brotherhood"
        title="Member Directory"
        accent="Directory"
        watermark="BROTHERS"
        lead="Meet the men of TKE Epsilon Alpha — leaders, scholars, and brothers united in purpose."
      />

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, position, or major…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {[['all', 'All'], ['exec', 'Executive Board'], ['members', 'Members']].map(([val, label]) => (
                <Button
                  key={val}
                  size="sm"
                  variant={filter === val ? 'default' : 'outline'}
                  onClick={() => setFilter(val)}
                  className="text-xs font-semibold whitespace-nowrap"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-24">
              <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-heading text-xl font-bold text-foreground mb-2">Directory Coming Soon</p>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Member profiles are being added. Check back soon to meet the brothers of Epsilon Alpha.
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No members match your search.</p>
          ) : (
            <>
              {/* Exec board section */}
              {filter !== 'members' && filteredMembers.some(m => m.position) && (
                <div className="mb-14">
                  <div className="flex items-center gap-3 mb-6">
                    <Crown className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-2xl font-bold text-foreground">Executive Board</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {filteredMembers
                      .filter(m => m.position && m.position.trim() !== '')
                      .map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
                  </div>
                </div>
              )}

              {/* General members section */}
              {filter !== 'exec' && filteredMembers.some(m => !m.position || m.position.trim() === '') && (
                <div>
                  {filter === 'all' && filteredMembers.some(m => m.position) && (
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="font-heading text-2xl font-bold text-foreground">Members</h2>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {filteredMembers
                      .filter(m => !m.position || m.position.trim() === '')
                      .map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
