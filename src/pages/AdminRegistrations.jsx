import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Lock, Download, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const KEY_STORAGE = 'tke_admin_key';

function dollars(cents) {
  return `$${((cents ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function exportCsv(rows) {
  const headers = [
    'Name', 'Email', 'Phone', 'Car Year', 'Car Make', 'Car Model', 'Color', 'Instagram',
    'Application Notes', 'Class', 'Status', 'Amount Paid', 'Donation', 'Event', 'Registered At',
    // Sponsor attribution (payment_status mirrors Status; amount_paid mirrors Amount Paid)
    'registration_source', 'sponsor_name', 'sponsor_slug', 'referral_page',
    'payment_status', 'amount_paid', 'stripe_session_id', 'stripe_payment_intent_id',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.name, r.email, r.phone, r.car_year, r.car_make, r.car_model,
      r.car_color, r.instagram, r.application_notes, r.car_class,
      r.status,
      ((r.amount_paid_cents ?? 0) / 100).toFixed(2),
      ((r.donation_cents ?? 0) / 100).toFixed(2),
      r.events?.title, r.created_at,
      r.registration_source ?? 'direct', r.sponsor_name, r.sponsor_slug, r.referral_page,
      r.status,
      ((r.amount_paid_cents ?? 0) / 100).toFixed(2),
      r.stripe_session_id, r.stripe_payment_intent_id,
    ].map(csvEscape).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'registrations.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// "Direct" vs "Registered through <sponsor> sponsor link" vs the unlisted,
// no-payment "Free Ticket" link — each gets a distinct badge; the full
// sentence + referral URL (sponsor) live in the hover title.
function SourceBadge({ registration }) {
  if (registration.registration_source === 'sponsor' && registration.sponsor_name) {
    return (
      <span
        title={`Registered through ${registration.sponsor_name} sponsor link${registration.referral_page ? ` — ${registration.referral_page}` : ''}`}
        className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
      >
        {registration.sponsor_name}
      </span>
    );
  }
  if (registration.registration_source === 'comp') {
    return (
      <span
        title="Registered through the free-ticket link — no payment collected"
        className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
      >
        Free Ticket
      </span>
    );
  }
  return <span className="text-muted-foreground text-xs">Direct</span>;
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

export default function AdminRegistrations() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [authError, setAuthError] = useState('');
  const [decisionMessage, setDecisionMessage] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'direct' | 'comp' | sponsor slug
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

  const { registrations, totals } = data;

  // Sponsor filter options come from the data itself (name keyed by slug).
  const sponsorOptions = [...new Map(
    registrations
      .filter((r) => r.registration_source === 'sponsor' && r.sponsor_slug)
      .map((r) => [r.sponsor_slug, r.sponsor_name || r.sponsor_slug])
  ).entries()];

  const filtered = registrations.filter((r) => {
    const source = r.registration_source ?? 'direct';
    if (sourceFilter === 'all') return true;
    if (sourceFilter === 'direct') return source === 'direct';
    if (sourceFilter === 'comp') return source === 'comp';
    return r.sponsor_slug === sourceFilter;
  });

  // Per-source summary for the filtered view. Only verified paid money counts
  // as collected (webhook-confirmed statuses, never the success redirect).
  const summary = filtered.reduce(
    (acc, r) => {
      acc.total += 1;
      if (r.status === 'paid' || r.status === 'checked_in') {
        acc.paidCount += 1;
        acc.collected_cents += r.amount_paid_cents ?? 0;
      } else if (r.status === 'pending') acc.pending += 1;
      else acc.other += 1; // refunded / declined / cancelled-equivalents
      return acc;
    },
    { total: 0, paidCount: 0, pending: 0, other: 0, collected_cents: 0 }
  );
  const filterLabel = sourceFilter === 'direct'
    ? 'Direct'
    : sourceFilter === 'comp'
      ? 'Free Ticket'
      : sponsorOptions.find(([slug]) => slug === sourceFilter)?.[1] ?? '';

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Registrations</h1>
            <p className="text-muted-foreground text-sm mt-1">Car show pre-registration dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by registration source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground"
            >
              <option value="all">All sources</option>
              <option value="direct">Direct</option>
              <option value="comp">Free Ticket</option>
              {sponsorOptions.map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => exportCsv(filtered)} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" onClick={signOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatTile label="Paid registrations" value={totals.paid} />
          <StatTile label="Applications" value={totals.pending} />
          <StatTile label="Exotics approved" value={totals.approved ?? 0} />
          <StatTile label="Waitlisted" value={totals.waitlisted ?? 0} />
          <StatTile label="Gross" value={dollars(totals.gross_cents)} />
          <StatTile label="St. Jude donations" value={dollars(totals.donation_cents)} />
        </div>

        {sourceFilter !== 'all' && (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-3">
              {sourceFilter === 'direct'
                ? 'Direct registrations'
                : sourceFilter === 'comp'
                  ? 'Registered through the free-ticket link'
                  : `Registered through ${filterLabel} sponsor link`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Total</p><p className="font-heading text-xl font-bold text-foreground">{summary.total}</p></div>
              <div><p className="text-muted-foreground text-xs">Completed payments</p><p className="font-heading text-xl font-bold text-foreground">{summary.paidCount}</p></div>
              <div><p className="text-muted-foreground text-xs">Pending</p><p className="font-heading text-xl font-bold text-foreground">{summary.pending}</p></div>
              <div><p className="text-muted-foreground text-xs">Failed / cancelled / refunded</p><p className="font-heading text-xl font-bold text-foreground">{summary.other}</p></div>
              <div><p className="text-muted-foreground text-xs">Collected (verified)</p><p className="font-heading text-xl font-bold text-foreground">{dollars(summary.collected_cents)}</p></div>
            </div>
          </div>
        )}

        {decisionMessage && (
          <p role="status" className="mb-4 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {decisionMessage}
          </p>
        )}

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              {sourceFilter === 'all' ? 'No registrations yet.' : 'No registrations for this source yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Name</th>
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Email</th>
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Car</th>
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Class</th>
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Source</th>
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.email}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {[r.car_year, r.car_make, r.car_model].filter(Boolean).join(' ')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize whitespace-nowrap">{r.car_class}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><SourceBadge registration={r} /></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.events?.slug === 'exotics-car-show-2026' ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
