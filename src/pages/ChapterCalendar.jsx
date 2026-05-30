import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';

const TYPE_COLORS = {
  philanthropy: 'bg-primary',
  recruitment: 'bg-accent',
  brotherhood: 'bg-blue-500',
  alumni: 'bg-emerald-500',
  community_service: 'bg-purple-500',
  general: 'bg-muted-foreground',
};

const TYPE_LABELS = {
  philanthropy: 'Philanthropy',
  recruitment: 'Recruitment',
  brotherhood: 'Brotherhood',
  alumni: 'Alumni',
  community_service: 'Community Service',
  general: 'General',
};

// ── Real chapter event dates ─────────────────────────────────────────────────
const CHAPTER_EVENTS = [
  // JULY
  {
    id: 'evt-jul-26',
    title: 'TKE for St. Jude Car Show',
    date: '2026-07-26',
    time: '11:00 AM – 2:00 PM',
    location: 'City Foundry STL',
    description: 'Annual car show fundraiser benefiting St. Jude Children\'s Research Hospital.',
    event_type: 'philanthropy',
    status: 'upcoming',
  },
  // AUGUST
  {
    id: 'evt-aug-14',
    title: 'SLU Welcome Week',
    date: '2026-08-14',
    time: 'Aug 14 – 18',
    location: 'Saint Louis University',
    description: 'Saint Louis University Welcome Week (August 14–18, 2026).',
    event_type: 'general',
    status: 'upcoming',
  },
  {
    id: 'evt-aug-15',
    title: 'SLU Convocation & Family Welcome',
    date: '2026-08-15',
    time: 'All Day',
    location: 'Saint Louis University',
    description: 'Saint Louis University Convocation and Family Welcome ceremony.',
    event_type: 'general',
    status: 'upcoming',
  },
  {
    id: 'evt-aug-20',
    title: 'Mass of the Holy Spirit',
    date: '2026-08-20',
    time: 'All Day',
    location: 'Saint Louis University',
    description: 'Annual Mass of the Holy Spirit at Saint Louis University.',
    event_type: 'brotherhood',
    status: 'upcoming',
  },
  {
    id: 'evt-aug-23',
    title: 'Fraternity & Sorority Life Meet & Greet',
    date: '2026-08-23',
    time: 'TBD',
    location: 'Saint Louis University',
    description: 'Fraternity & Sorority Life Meet & Greet — meet the Greek community at SLU.',
    event_type: 'recruitment',
    status: 'upcoming',
  },
  {
    id: 'evt-aug-28',
    title: 'TKE for St. Jude Car Show',
    date: '2026-08-28',
    time: '11:00 AM – 2:00 PM',
    location: 'City Foundry STL',
    description: 'Car show fundraiser benefiting St. Jude Children\'s Research Hospital.',
    event_type: 'philanthropy',
    status: 'upcoming',
  },
  // SEPTEMBER
  {
    id: 'evt-sep-09',
    title: 'IFC Recruitment Meet & Greet',
    date: '2026-09-09',
    time: '6:00 PM – 8:00 PM',
    location: 'Saint Louis University',
    description: 'IFC Recruitment Meet & Greet — learn about TKE Epsilon Alpha and Greek life.',
    event_type: 'recruitment',
    status: 'upcoming',
  },
  {
    id: 'evt-sep-11',
    title: 'IFC BBQ',
    date: '2026-09-11',
    time: '5:00 PM – 8:00 PM',
    location: 'Saint Louis University',
    description: 'IFC BBQ — food, fun, and an opportunity to meet the brothers of TKE.',
    event_type: 'recruitment',
    status: 'upcoming',
  },
  {
    id: 'evt-sep-12',
    title: 'Fall Recruitment Week',
    date: '2026-09-12',
    time: 'Sep 12 – 21',
    location: 'Saint Louis University',
    description: 'Fall Formal Recruitment Week (September 12–21). Meet the brothers and discover what TKE Epsilon Alpha is all about.',
    event_type: 'recruitment',
    status: 'upcoming',
  },
  {
    id: 'evt-sep-23',
    title: 'Mental Health & Brotherhood Day',
    date: '2026-09-23',
    time: 'All Day',
    location: 'Chapter Retreat',
    description: 'Chapter Retreat and Wellness Event focused on mental health, brotherhood, and personal growth.',
    event_type: 'brotherhood',
    status: 'upcoming',
  },
  {
    id: 'evt-sep-25',
    title: 'SLU Homecoming & Family Weekend',
    date: '2026-09-25',
    time: 'Sep 25 – 27',
    location: 'Saint Louis University',
    description: 'Saint Louis University Homecoming and Family Weekend (September 25–27, 2026).',
    event_type: 'general',
    status: 'upcoming',
  },
  {
    id: 'evt-sep-26',
    title: 'TKE Alumni & Family Networking Social',
    date: '2026-09-26',
    time: '5:30 PM – 7:30 PM',
    location: 'Saint Louis University',
    description: 'TKE Alumni and Family Networking Social during SLU Homecoming & Family Weekend.',
    event_type: 'alumni',
    status: 'upcoming',
  },
  // OCTOBER
  {
    id: 'evt-oct-01',
    title: 'TKE Philanthropy Week',
    date: '2026-10-01',
    time: 'Oct 1 – 3',
    location: 'Saint Louis University',
    description: 'TKE Philanthropy Week (October 1–3) — a series of fundraising and awareness events for St. Jude.',
    event_type: 'philanthropy',
    status: 'upcoming',
  },
  {
    id: 'evt-oct-25',
    title: 'TKE × St. Jude Charity Car Show',
    date: '2026-10-25',
    time: '11:00 AM – 2:00 PM',
    location: 'City Foundry STL',
    description: 'TKE × St. Jude Charity Car Show — all proceeds benefit St. Jude Children\'s Research Hospital.',
    event_type: 'philanthropy',
    status: 'upcoming',
  },
  // NOVEMBER
  {
    id: 'evt-nov-06',
    title: 'Province Forum & Leadership Weekend',
    date: '2026-11-06',
    time: 'Nov 6 – 8',
    location: 'TBD',
    description: 'Province Forum and Leadership Weekend (November 6–8) — regional TKE leadership development.',
    event_type: 'brotherhood',
    status: 'upcoming',
  },
  {
    id: 'evt-nov-13',
    title: 'TKEsGiving',
    date: '2026-11-13',
    time: 'TBD',
    location: 'Saint Louis University',
    description: 'Annual Brotherhood and Community Celebration — TKEsGiving brings brothers, friends, and the community together.',
    event_type: 'brotherhood',
    status: 'upcoming',
  },
  // DECEMBER
  {
    id: 'evt-dec-04',
    title: 'SLU Fall Semester Concludes',
    date: '2026-12-04',
    time: 'All Day',
    location: 'Saint Louis University',
    description: 'Saint Louis University Fall Semester concludes.',
    event_type: 'general',
    status: 'upcoming',
  },
  {
    id: 'evt-dec-07',
    title: 'Final Examination Week',
    date: '2026-12-07',
    time: 'Dec 7 – 11',
    location: 'Saint Louis University',
    description: 'Final Examination Week (December 7–11, 2026).',
    event_type: 'general',
    status: 'upcoming',
  },
  {
    id: 'evt-dec-12',
    title: 'Fall Commencement Ceremony',
    date: '2026-12-12',
    time: 'All Day',
    location: 'Saint Louis University',
    description: 'Saint Louis University Fall Commencement Ceremony.',
    event_type: 'general',
    status: 'upcoming',
  },
];

export default function ChapterCalendar() {
  const [month, setMonth] = useState(new Date(2026, 6, 1)); // July 2026
  const [filter, setFilter] = useState('all');

  const { data: apiEvents = [] } = useQuery({
    queryKey: ['all-events'],
    queryFn: () => base44.entities.ChapterEvent.list('date'),
  });

  // Use Base44 data when available, otherwise use chapter events
  const events = apiEvents.length > 0 ? apiEvents : CHAPTER_EVENTS;

  const filteredEvents = useMemo(() =>
    filter === 'all' ? events : events.filter(e => e.event_type === filter),
    [events, filter]
  );

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day) =>
    filteredEvents.filter(e => e.date && isSameDay(new Date(e.date + 'T00:00:00'), day));

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="bg-[hsl(0,0%,7%)] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Stay Updated</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4">Chapter Calendar</h1>
          <p className="text-white/70">All events across the Epsilon Alpha Chapter in one place.</p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')} className="text-xs font-semibold">All Events</Button>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <Button key={k} size="sm" variant={filter === k ? 'default' : 'outline'}
                onClick={() => setFilter(k)} className="text-xs font-semibold gap-1.5">
                <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[k]}`} />
                {v}
              </Button>
            ))}
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-heading text-2xl font-bold text-foreground">{format(month, 'MMMM yyyy')}</h2>
            <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border border-border rounded-xl overflow-hidden mb-12">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-muted/50 p-2 sm:p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()}
                  className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-t border-l border-border ${
                    !inMonth ? 'bg-muted/30' : 'bg-card'
                  }`}>
                  <span className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full ${
                    isToday ? 'bg-primary text-primary-foreground' : inMonth ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}>{format(day, 'd')}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`${TYPE_COLORS[e.event_type] || 'bg-muted-foreground'} text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded truncate font-medium`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event List */}
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-6">
              Upcoming Events
            </h3>
            {filteredEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No events match the current filter.</p>
            ) : (
              <div className="space-y-3">
                {filteredEvents
                  .filter(e => e.date && new Date(e.date) >= new Date(new Date().toDateString()))
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(e => (
                    <div key={e.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-accent/30 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${TYPE_COLORS[e.event_type]}`} />
                        <div className="w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-lg leading-none">
                            {format(new Date(e.date + 'T00:00:00'), 'd')}
                          </span>
                          <span className="text-primary text-[10px] font-semibold uppercase">
                            {format(new Date(e.date + 'T00:00:00'), 'MMM')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{e.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mt-1">
                          {e.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>}
                          {e.time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{e.time}</span>}
                        </div>
                        {e.description && (
                          <p className="text-muted-foreground text-xs mt-1.5 line-clamp-1">{e.description}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full flex-shrink-0">
                        {TYPE_LABELS[e.event_type] || e.event_type}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
