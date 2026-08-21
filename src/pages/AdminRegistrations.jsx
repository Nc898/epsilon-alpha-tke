import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Lock, Download, LogOut, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const KEY_STORAGE = 'tke_admin_key';
const EXOTICS_SLUG = 'exotics-car-show-2026';

function dollars(cents) {
  return `$${((cents ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Event dates are plain YYYY-MM-DD; pin to local noon so the calendar day
// never shifts across a timezone boundary.
function showDate(dateStr) {
  if (!dateStr) return '';
  return format(new Date(`${dateStr}T12:00:00`), 'MMM d, yyyy');
}

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  waitlisted: 'bg-blue-100 text-blue-800 border-blue-200',
  declined: 'bg-rose-100 text-rose-800 border-rose-200',
  refunded: 'bg-gray-100 text-gray-600 border-gray-200',
  checked_in: 'bg-gray-100 text-gray-600 border-gray-200',
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.refunded;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status === 'checked_in' ? 'checked in' : status}
    </span>
  );
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportCsv(rows, filename) {
  const headers = ['Name', 'Email', 'Phone', 'Car Year', 'Car Make', 'Car Model', 'Color', 'Instagram', 'Application Notes', 'Class', 'Status', 'Amount Paid', 'Donation', 'Event', 'Registered At'];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.name, r.email, r.phone, r.car_year, r.car_make, r.car_model,
      r.car_color, r.instagram, r.application_notes, r.car_class,
      r.status,
      ((r.amount_paid_cents ?? 0) / 100).toFixed(2),
      ((r.donation_cents ?? 0) / 100).toFixed(2),
      r.events?.title, r.created_at,
    ].map(csvEscape).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'registrations.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function KeyForm({ onSubmit, error }) {
  const [value, setValue] = useState('');
  return (
    <div className="pt-24 min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-heading text-xl font-bold text-foreground text-center mb-1">Admin</h1>
        <p className="text-muted-foreground text-sm text-center mb-6">Enter the admin key to view registrations.</p>
        {error && <p className="text-destructive text-sm text-center mb-4">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit(value.trim());
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="admin_key" className="text-sm">Admin key</Label>
            <Input
              id="admin_key"
              type="password"
              className="mt-1"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            View registrations
          </Button>
        </form>
      </div>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

// Group the flat registration list by event and roll up per-show totals, then
// decide which shows deserve a tab: any show that is still open for
// registration (the current show, even with zero entries yet) or any show that
// already captured at least one registration (a previous show's archive).
function buildShows(events, registrations) {
  const byEvent = new Map();
  for (const r of registrations) {
    if (!r.event_id) continue;
    if (!byEvent.has(r.event_id)) byEvent.set(r.event_id, []);
    byEvent.get(r.event_id).push(r);
  }

  return (events ?? [])
    .map((event) => {
      const rows = byEvent.get(event.id) ?? [];
      const totals = { count: rows.length, paid: 0, pending: 0, approved: 0, waitlisted: 0, gross_cents: 0, donation_cents: 0 };
      for (const r of rows) {
        if (r.status === 'paid') {
          totals.paid += 1;
          totals.gross_cents += r.amount_paid_cents ?? 0;
        } else if (r.status === 'pending') {
          totals.pending += 1;
        } else if (r.status === 'approved') {
          totals.approved += 1;
        } else if (r.status === 'waitlisted') {
          totals.waitlisted += 1;
        }
        totals.donation_cents += r.donation_cents ?? 0;
      }
      return { event, rows, totals };
    })
    .filter((show) => show.event.registration_open || show.totals.count > 0);
}

function ShowTable({ rows, isExotics, decisionMutation }) {
  if (rows.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <p className="text-muted-foreground text-sm text-center py-12">No registrations yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Name</th>
              <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Email</th>
              <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Car</th>
              <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Class</th>
              <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Status</th>
              <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Registered</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.email}</td>
                <td className="px-4 py-3 text-foreground whitespace-nowrap">
                  {[r.car_year, r.car_make, r.car_model].filter(Boolean).join(' ')}
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize whitespace-nowrap">{r.car_class}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isExotics ? (
                    <select
                      aria-label={`Application status for ${r.name}`}
                      value={r.status}
                      disabled={decisionMutation.isPending}
                      onChange={(event) => decisionMutation.mutate({ id: r.id, status: event.target.value })}
                      className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="declined">Declined</option>
                      <option value="checked_in">Checked in</option>
                    </select>
                  ) : (
                    <StatusBadge status={r.status} />
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {r.created_at ? format(new Date(r.created_at), 'MMM d, yyyy h:mm a') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminRegistrations() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [authError, setAuthError] = useState('');
  const [decisionMessage, setDecisionMessage] = useState('');
  const [activeSlug, setActiveSlug] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin_registrations', key],
    enabled: !!key,
    retry: false,
    queryFn: async () => {
      const res = await fetch('/api/registrations', { headers: { 'x-admin-key': key } });
      if (res.status === 401) {
        sessionStorage.removeItem(KEY_STORAGE);
        setKey('');
        setAuthError('Wrong key — try again.');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to load registrations');
      return res.json();
    },
  });

  const handleKeySubmit = (value) => {
    setAuthError('');
    sessionStorage.setItem(KEY_STORAGE, value);
    setKey(value);
  };

  const decisionMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Could not update application');
      return result;
    },
    onSuccess: (result) => {
      setDecisionMessage(result.email_warning ? 'Status saved; applicant email may be delayed.' : 'Status saved and applicant notified.');
      queryClient.invalidateQueries({ queryKey: ['admin_registrations', key] });
    },
    onError: (error) => setDecisionMessage(error.message || 'Could not update application.'),
  });

  const signOut = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setKey('');
    setAuthError('');
  };

  const shows = useMemo(
    () => (data ? buildShows(data.events, data.registrations) : []),
    [data],
  );

  // Default to the newest show (events come back date-desc), which is the
  // current/upcoming one. Fall back gracefully if the active show disappears.
  const activeShow = shows.find((s) => s.event.slug === activeSlug) || shows[0] || null;

  if (!key) return <KeyForm onSubmit={handleKeySubmit} error={authError} />;

  if (isLoading) {
    return (
      <div className="pt-24 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="pt-24 min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Something went wrong loading registrations.</p>
        <Button variant="outline" onClick={signOut}>Re-enter key</Button>
      </div>
    );
  }

  const totals = activeShow?.totals;
  const isExotics = activeShow?.event.slug === EXOTICS_SLUG;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Registrations</h1>
            <p className="text-muted-foreground text-sm mt-1">Car show registration dashboard — one tab per show</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!activeShow || activeShow.rows.length === 0}
              onClick={() => exportCsv(activeShow.rows, `${activeShow.event.slug}-registrations.csv`)}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" onClick={signOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        {shows.length === 0 ? (
          <div className="bg-card border border-border rounded-xl shadow-sm">
            <p className="text-muted-foreground text-sm text-center py-12">No shows to display yet.</p>
          </div>
        ) : (
          <>
            {/* One tab per show — current (newest) first. */}
            <div className="border-b border-border mb-8 -mx-1 overflow-x-auto">
              <div role="tablist" aria-label="Car shows" className="flex gap-1 min-w-max px-1">
                {shows.map((show) => {
                  const isActive = activeShow?.event.slug === show.event.slug;
                  return (
                    <button
                      key={show.event.slug}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveSlug(show.event.slug)}
                      className={`group relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <CalendarDays className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                      <span className="flex flex-col items-start leading-tight">
                        <span>{show.event.title}</span>
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {showDate(show.event.date)}
                        </span>
                      </span>
                      <span
                        className={`ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          show.event.registration_open
                            ? 'border-green-200 bg-green-100 text-green-800'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {show.event.registration_open ? 'Open' : 'Archived'} · {show.totals.count}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full ${isActive ? 'bg-primary' : 'bg-transparent'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {decisionMessage && (
              <p role="status" className="mb-4 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                {decisionMessage}
              </p>
            )}

            {/* Per-show stat tiles. Approved / waitlisted only appear for a
                curated-application show (exotics-style) that actually uses them. */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatTile label="Paid registrations" value={totals.paid} />
              <StatTile label={isExotics ? 'Applications' : 'Pending'} value={totals.pending} />
              {(isExotics || totals.approved > 0) && <StatTile label="Approved" value={totals.approved} />}
              {(isExotics || totals.waitlisted > 0) && <StatTile label="Waitlisted" value={totals.waitlisted} />}
              <StatTile label="Gross" value={dollars(totals.gross_cents)} />
              <StatTile label="St. Jude donations" value={dollars(totals.donation_cents)} />
            </div>

            <ShowTable rows={activeShow.rows} isExotics={isExotics} decisionMutation={decisionMutation} />
          </>
        )}
      </div>
    </div>
  );
}
