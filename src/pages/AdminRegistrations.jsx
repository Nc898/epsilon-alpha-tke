import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const headers = ['Name', 'Email', 'Phone', 'Car Year', 'Car Make', 'Car Model', 'Class', 'Status', 'Amount Paid', 'Donation', 'Event', 'Registered At'];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      r.name, r.email, r.phone, r.car_year, r.car_make, r.car_model, r.car_class,
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
  a.download = 'registrations.csv';
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

export default function AdminRegistrations() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [authError, setAuthError] = useState('');

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

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Registrations</h1>
            <p className="text-muted-foreground text-sm mt-1">Car show pre-registration dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => exportCsv(registrations)} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" onClick={signOut} className="gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatTile label="Paid registrations" value={totals.paid} />
          <StatTile label="Pending" value={totals.pending} />
          <StatTile label="Gross" value={dollars(totals.gross_cents)} />
          <StatTile label="St. Jude donations" value={dollars(totals.donation_cents)} />
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {registrations.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No registrations yet.</p>
          ) : (
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
                  {registrations.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.email}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">
                        {[r.car_year, r.car_make, r.car_model].filter(Boolean).join(' ')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize whitespace-nowrap">{r.car_class}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
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
