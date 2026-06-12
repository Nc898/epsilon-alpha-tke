import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2, Lock, Plus, Upload, Trash2, Eye, EyeOff, Images, FolderPlus, LogOut,
} from 'lucide-react';

// Same key + storage slot as /admin/registrations — one sign-in covers both.
const KEY_STORAGE = 'tke_admin_key';

async function api(key, body) {
  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw Object.assign(new Error('Unauthorized'), { unauthorized: true });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'Request failed');
  return res.json();
}

// Resize/compress in the browser so uploads stay well under the 4.5MB
// serverless body limit (max edge 2000px, JPEG q0.82 ≈ 400KB–1MB per photo).
async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 2000;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  const base64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
  return { base64, size: blob.size };
}

function KeyForm({ onSubmit, error }) {
  const [value, setValue] = useState('');
  return (
    <div className="pt-24 min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(value.trim()); }}
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-sm"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Gallery Admin</h1>
        <p className="text-muted-foreground text-sm mb-5">Enter the admin key to manage albums.</p>
        <Input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Admin key"
          autoFocus
        />
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          Unlock
        </Button>
      </form>
    </div>
  );
}

function CreateAlbumForm({ adminKey, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', event_date: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Album title is required.');
    setBusy(true);
    try {
      const { album } = await api(adminKey, { action: 'create-album', ...form });
      toast.success(`Album "${album.title}" created.`);
      setForm({ title: '', description: '', event_date: '' });
      onCreated(album);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
        <FolderPlus className="h-5 w-5 text-primary" /> New Album
      </h2>
      <div>
        <Label className="text-sm">Title *</Label>
        <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="mt-1" placeholder="e.g. Car Show 2025" />
      </div>
      <div>
        <Label className="text-sm">Event Date</Label>
        <Input type="date" value={form.event_date} onChange={(e) => setForm((p) => ({ ...p, event_date: e.target.value }))}
          className="mt-1" />
      </div>
      <div>
        <Label className="text-sm">Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="mt-1" rows={2} placeholder="A few words about the event…" />
      </div>
      <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create Album
      </Button>
    </form>
  );
}

function AlbumRow({ album, adminKey, onChanged }) {
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(null); // null | {done, total, failed}

  const uploadFiles = async (files) => {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setProgress({ done: 0, total: list.length, failed: 0 });
    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        const { base64 } = await compressImage(list[i]);
        await api(adminKey, {
          action: 'upload-photo',
          albumId: album.id,
          filename: list[i].name.replace(/\.[^.]+$/, '.jpg'),
          contentType: 'image/jpeg',
          data: base64,
        });
      } catch {
        failed += 1;
      }
      setProgress({ done: i + 1, total: list.length, failed });
    }
    setProgress(null);
    if (failed) toast.error(`${failed} of ${list.length} photos failed — try them again.`);
    else toast.success(`${list.length} photo${list.length === 1 ? '' : 's'} uploaded to "${album.title}".`);
    onChanged();
  };

  const remove = async () => {
    if (!confirm(`Delete "${album.title}" and ALL its photos? This can't be undone.`)) return;
    try {
      await api(adminKey, { action: 'delete-album', albumId: album.id });
      toast.success('Album deleted.');
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const togglePublish = async () => {
    try {
      await api(adminKey, { action: 'set-publish', albumId: album.id, published: !album.published });
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const count = album.photos?.[0]?.count ?? 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-heading font-bold text-foreground truncate">{album.title}</h3>
          {!album.published && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Hidden
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
          <Images className="h-3.5 w-3.5" /> {count} photo{count === 1 ? '' : 's'}
          <span className="text-muted-foreground/50">·</span>
          <span className="truncate">/gallery/{album.slug}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }}
        />
        <Button
          size="sm"
          onClick={() => fileRef.current.click()}
          disabled={!!progress}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5"
        >
          {progress ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {progress.done}/{progress.total}</>
          ) : (
            <><Upload className="h-3.5 w-3.5" /> Upload</>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={togglePublish} className="gap-1.5">
          {album.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" variant="outline" onClick={remove} className="text-destructive hover:text-destructive gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || '');
  const [authError, setAuthError] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin_albums', key],
    enabled: !!key,
    retry: false,
    queryFn: async () => {
      try {
        return await api(key, { action: 'list-albums' });
      } catch (err) {
        if (err.unauthorized) {
          sessionStorage.removeItem(KEY_STORAGE);
          setKey('');
          setAuthError('Wrong key — try again.');
        }
        throw err;
      }
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin_albums'] });

  const handleKeySubmit = (value) => {
    setAuthError('');
    sessionStorage.setItem(KEY_STORAGE, value);
    setKey(value);
  };

  const signOut = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setKey('');
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
        <p className="text-muted-foreground">Something went wrong loading albums.</p>
        <Button variant="outline" onClick={signOut}>Re-enter key</Button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Gallery Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create albums and upload event photos. Photos are compressed in your browser before upload.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5 self-start sm:self-auto">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreateAlbumForm adminKey={key} onCreated={refresh} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {data.albums.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
                No albums yet — create your first one.
              </div>
            ) : (
              data.albums.map((album) => (
                <AlbumRow key={album.id} album={album} adminKey={key} onChanged={refresh} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
