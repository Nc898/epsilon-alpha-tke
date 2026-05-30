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

export default function ChapterCalendar() {
  const [month, setMonth] = useState(new Date());
  const [filter, setFilter] = useState('all');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['all-events'],
    queryFn: () => base44.entities.ChapterEvent.list('date'),
  });

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

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
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
                <h3 className="font-heading text-xl font-bold text-foreground mb-6">Upcoming Events</h3>
                {filteredEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No events match the current filter.</p>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.filter(e => e.date && new Date(e.date) >= new Date(new Date().toDateString())).map(e => (
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
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
                            {e.time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{e.time}</span>}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                          {TYPE_LABELS[e.event_type] || e.event_type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}