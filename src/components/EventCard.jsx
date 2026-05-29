import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function EventCard({ event }) {
  const date = event.date ? new Date(event.date + 'T00:00:00') : null;

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Ticket-style top edge */}
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

      {event.image && (
        <div className="relative h-48 overflow-hidden">
          <img src={event.image} alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {event.ticket_price > 0 && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
              ${event.ticket_price}
            </span>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          {date && (
            <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
              <span className="text-primary font-bold text-lg leading-none">{format(date, 'd')}</span>
              <span className="text-primary text-[10px] font-semibold uppercase">{format(date, 'MMM')}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-lg font-semibold text-foreground leading-tight">{event.title}</h3>
            {event.event_type && (
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                {event.event_type.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {event.description && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-2 text-sm text-muted-foreground mb-5">
          {event.time && (
            <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" />{event.time}</div>
          )}
          <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{event.location}</div>
        </div>

        {/* Perforated divider */}
        <div className="border-t border-dashed border-border my-2" />

        <div className="flex gap-2 mt-auto pt-3">
          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1">
            <Ticket className="h-3.5 w-3.5" /> Register
          </Button>
          <Button size="sm" variant="outline" className="gap-1">
            <Calendar className="h-3.5 w-3.5" /> Add to Cal
          </Button>
        </div>
      </div>
    </div>
  );
}