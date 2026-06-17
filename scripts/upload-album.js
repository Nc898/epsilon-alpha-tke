// Bulk-upload a folder of photos into a gallery album.
//
// Compresses each image (JPEG, max 2000px edge, q82 — same target as the
// in-browser admin uploader) and pushes it into the public 'gallery' bucket,
// creating the album row and wiring up the cover. Idempotent on re-run: it
// reuses an existing album with the same slug and skips photos already
// uploaded (matched by original filename), so you can safely re-run if the
// connection drops partway through 89 photos.
//
// Usage:
//   1. Put the real service-role key in ../.env.local (SUPABASE_SERVICE_ROLE_KEY)
//   2. npm install            (installs sharp + @supabase/supabase-js here)
//   3. node upload-album.js --dir "/path/to/photos" --title "Sunnen Car Show 2025"
//
// Flags:
//   --dir <path>      folder of source images (required)
//   --title <text>    album title (required)
//   --date <ISO>      event date, e.g. 2025-09-20 (optional)
//   --desc <text>     album description (optional)
//   --max <px>        max edge in pixels (default 2000)
//   --quality <1-100> JPEG quality (default 82)
//   --unpublished     create the album hidden (publish later from /admin/gallery)

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

// Keys live in the app root's .env.local, one level up from scripts/
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

// --- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name, fallback = undefined) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const DIR = flag('dir');
const TITLE = flag('title');
const DATE = flag('date') || null;
const DESC = flag('desc') || null;
const MAX_EDGE = Number(flag('max', 2000));
const QUALITY = Number(flag('quality', 82));
const PUBLISHED = !has('unpublished');

if (!DIR || !TITLE) {
  console.error('Usage: node upload-album.js --dir "<folder>" --title "<title>" [--date YYYY-MM-DD] [--desc "..."]');
  process.exit(1);
}

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY || KEY.startsWith('PASTE')) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local (service-role key still a placeholder?).');
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif', '.tif', '.tiff', '.gif']);
const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'album';

async function getOrCreateAlbum() {
  const slug = slugify(TITLE);
  const { data: existing } = await supabase.from('albums').select('*').eq('slug', slug).maybeSingle();
  if (existing) {
    console.log(`Reusing existing album "${existing.title}" (${slug}).`);
    return existing;
  }
  const { data, error } = await supabase
    .from('albums')
    .insert({ title: TITLE, slug, description: DESC, event_date: DATE, published: PUBLISHED })
    .select()
    .single();
  if (error) throw error;
  console.log(`Created album "${data.title}" (${slug})${PUBLISHED ? '' : ' [hidden]'}.`);
  return data;
}

async function main() {
  const album = await getOrCreateAlbum();

  // Which original names are already in this album? (resumable re-runs)
  const { data: existingPhotos } = await supabase
    .from('photos').select('storage_path').eq('album_id', album.id);
  const done = new Set(
    (existingPhotos || []).map((p) => p.storage_path.replace(/^.*?-/, '')) // strip the uuid- prefix
  );

  const entries = (await readdir(DIR))
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    .sort(); // stable order so photos appear consistently

  if (entries.length === 0) {
    console.error(`No images found in ${DIR}`);
    process.exit(1);
  }

  console.log(`Found ${entries.length} images. Compressing → JPEG (max ${MAX_EDGE}px, q${QUALITY})…\n`);

  const slug = album.slug;
  let uploaded = 0, skipped = 0, failed = 0, firstPath = album.cover_path;

  for (let i = 0; i < entries.length; i++) {
    const src = entries[i];
    const outName = `${slug}-${String(i + 1).padStart(3, '0')}.jpg`;
    if (done.has(outName)) { skipped++; continue; }

    try {
      const input = await readFile(join(DIR, src));
      const buffer = await sharp(input)
        .rotate() // honor EXIF orientation
        .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer();

      const path = `albums/${album.id}/${randomUUID().slice(0, 8)}-${outName}`;
      const { error: upErr } = await supabase.storage
        .from('gallery')
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: false });
      if (upErr) throw upErr;

      const { error: rowErr } = await supabase
        .from('photos')
        .insert({ album_id: album.id, storage_path: path, size_bytes: buffer.length });
      if (rowErr) {
        await supabase.storage.from('gallery').remove([path]);
        throw rowErr;
      }

      firstPath = firstPath || path;
      uploaded++;
      const kb = Math.round(buffer.length / 1024);
      process.stdout.write(`  [${i + 1}/${entries.length}] ${outName}  ${kb}KB\n`);
    } catch (err) {
      failed++;
      console.warn(`  [${i + 1}/${entries.length}] ${src} FAILED: ${err.message}`);
    }
  }

  // Ensure a cover is set (first uploaded photo)
  if (firstPath && !album.cover_path) {
    await supabase.from('albums').update({ cover_path: firstPath }).eq('id', album.id);
  }

  console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped} (already present), failed ${failed}.`);
  console.log(`Album live at: /gallery/${slug}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
