import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import JSZip from 'jszip';
import { supabase } from '@/lib/supabaseClient';
import { photoUrl } from './Gallery';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, X, ChevronLeft, ChevronRight, Loader2, Images } from 'lucide-react';
import { format } from 'date-fns';

async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// True on devices whose browser can share image files through the native
// sheet (iOS Safari, Android Chrome) — that sheet is what offers "Save Image"
// / "Add to Photos", AirDrop, Messages, Instagram, etc. Desktop browsers
// generally can't share files, so we fall back to a plain download there.
const canShareFiles =
  typeof navigator !== 'undefined' &&
  navigator.canShare &&
  navigator.canShare({ files: [new File([''], 't.jpg', { type: 'image/jpeg' })] });

async function fetchPhotoFile(url, filename) {
  const blob = await (await fetch(url)).blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

// Native share → save to camera roll / AirDrop / Messages / socials. Returns
// false if the device can't share files so the caller can fall back.
async function sharePhoto(url, filename) {
  if (!canShareFiles) return false;
  try {
    await navigator.share({ files: [await fetchPhotoFile(url, filename)] });
  } catch (err) {
    if (err?.name === 'AbortError') return true; // user dismissed the sheet
    return false;
  }
  return true;
}

function Lightbox({ photos, index, onClose, onMove }) {
  const photo = photos[index];

  const onKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    },
    [onClose, onMove]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onKey]);

  if (!photo) return null;
  const url = photoUrl(photo.storage_path);

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        aria-label="Previous photo"
        onClick={(e) => { e.stopPropagation(); onMove(-1); }}
        className="absolute left-3 sm:left-6 p-3 text-white/60 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <img
        src={url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[88vw] object-contain rounded-lg shadow-2xl"
      />

      <button
        aria-label="Next photo"
        onClick={(e) => { e.stopPropagation(); onMove(1); }}
        className="absolute right-3 sm:right-6 p-3 text-white/60 hover:text-white transition-colors"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm tabular-nums">{index + 1} / {photos.length}</span>
        {canShareFiles && (
          <Button
            size="sm"
            onClick={() => sharePhoto(url, photo.storage_path.split('/').pop())}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs"
          >
            <Share2 className="h-3.5 w-3.5" /> Save / Share
          </Button>
        )}
        <Button
          size="sm"
          variant={canShareFiles ? 'outline' : 'default'}
          onClick={async () => {
            const blob = await (await fetch(url)).blob();
            downloadBlob(blob, photo.storage_path.split('/').pop());
          }}
          className={
            canShareFiles
              ? 'rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold gap-1.5 text-xs'
              : 'rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs'
          }
        >
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
      </div>
    </div>
  );
}

export default function GalleryAlbum() {
  const { slug } = useParams();
  const [lightbox, setLightbox] = useState(null); // photo index or null
  const [zipProgress, setZipProgress] = useState(null); // null | {done, total}

  const { data: album, isLoading: albumLoading } = useQuery({
    queryKey: ['album', slug],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('albums').select('*').eq('slug', slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['album_photos', album?.id],
    enabled: !!album?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos').select('*').eq('album_id', album.id).order('created_at');
      if (error) throw error;
      return data;
    },
  });

  const downloadAll = async () => {
    setZipProgress({ done: 0, total: photos.length });
    try {
      const zip = new JSZip();
      for (let i = 0; i < photos.length; i++) {
        const blob = await (await fetch(photoUrl(photos[i].storage_path))).blob();
        zip.file(photos[i].storage_path.split('/').pop(), blob);
        setZipProgress({ done: i + 1, total: photos.length });
      }
      const out = await zip.generateAsync({ type: 'blob' });
      await downloadBlob(out, `${slug}-photos.zip`);
    } finally {
      setZipProgress(null);
    }
  };

  if (albumLoading) {
    return (
      <div className="pt-24 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="pt-24 min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Images className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">This album doesn't exist (or isn't published yet).</p>
        <Link to="/gallery">
          <Button variant="outline" className="rounded-full gap-2"><ArrowLeft className="h-4 w-4" /> All Albums</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24">
      {/* Album header */}
      <section className="relative overflow-hidden bg-[hsl(0,0%,5%)] text-white rounded-b-[2.5rem]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold uppercase tracking-widest transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> All Albums
          </Link>
          <h1 className="font-heading font-bold" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1.05 }}>
            {album.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-white/60 text-sm">
            {album.event_date && <span>{format(new Date(album.event_date + 'T00:00:00'), 'MMMM d, yyyy')}</span>}
            <span>{photos.length} photo{photos.length === 1 ? '' : 's'}</span>
          </div>
          {album.description && <p className="text-white/70 max-w-2xl mt-4 leading-relaxed">{album.description}</p>}

          {photos.length > 0 && (
            <Button
              onClick={downloadAll}
              disabled={!!zipProgress}
              className="mt-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-11 px-7 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {zipProgress ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Zipping {zipProgress.done}/{zipProgress.total}…</>
              ) : (
                <><Download className="h-4 w-4" /> Download Album ({photos.length})</>
              )}
            </Button>
          )}
        </div>
      </section>

      {/* Photo grid */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {photosLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : photos.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No photos in this album yet.</p>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightbox(i)}
                  className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={photoUrl(p.storage_path)}
                    alt=""
                    loading="lazy"
                    className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                  <Download className="absolute bottom-3 right-3 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox !== null && (
        <Lightbox
          photos={photos}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onMove={(d) => setLightbox((i) => (i + d + photos.length) % photos.length)}
        />
      )}
    </div>
  );
}
