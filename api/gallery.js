// api/gallery.js — admin-only gallery management (create albums, upload
// photos into the public 'gallery' bucket, delete, publish). Public pages
// read albums/photos directly through the anon client + RLS; everything
// here requires the x-admin-key header, like /api/registrations.
import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

function sha256(value) {
  return createHash('sha256').update(String(value)).digest();
}

function keyMatches(provided, expected) {
  if (!provided || !expected) return false;
  return timingSafeEqual(sha256(provided), sha256(expected));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'album';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!keyMatches(req.headers['x-admin-key'], process.env.ADMIN_KEY)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action } = req.body ?? {};

    if (action === 'list-albums') {
      const { data, error } = await supabaseAdmin
        .from('albums')
        .select('*, photos(count)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ albums: data });
    }

    if (action === 'list-photos') {
      const { albumId } = req.body;
      const { data, error } = await supabaseAdmin
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at');
      if (error) throw error;
      return res.status(200).json({ photos: data });
    }

    if (action === 'create-album') {
      const { title, description, event_date } = req.body;
      if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

      let slug = slugify(title);
      const { data: existing } = await supabaseAdmin.from('albums').select('id').eq('slug', slug).maybeSingle();
      if (existing) slug = `${slug}-${randomUUID().slice(0, 6)}`;

      const { data, error } = await supabaseAdmin
        .from('albums')
        .insert({ title: title.trim(), slug, description: description || null, event_date: event_date || null })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ album: data });
    }

    if (action === 'upload-photo') {
      const { albumId, filename, contentType, data } = req.body;
      if (!albumId || !data) return res.status(400).json({ error: 'albumId and data are required' });

      const buffer = Buffer.from(data, 'base64');
      const safeName = (filename || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
      const path = `albums/${albumId}/${randomUUID().slice(0, 8)}-${safeName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('gallery')
        .upload(path, buffer, { contentType: contentType || 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: photo, error } = await supabaseAdmin
        .from('photos')
        .insert({ album_id: albumId, storage_path: path, size_bytes: buffer.length })
        .select()
        .single();
      if (error) {
        await supabaseAdmin.storage.from('gallery').remove([path]);
        throw error;
      }

      // First photo becomes the album cover automatically
      await supabaseAdmin
        .from('albums')
        .update({ cover_path: path })
        .eq('id', albumId)
        .is('cover_path', null);

      return res.status(200).json({ photo });
    }

    if (action === 'delete-photo') {
      const { photoId } = req.body;
      const { data: photo, error: fetchError } = await supabaseAdmin
        .from('photos').select('*').eq('id', photoId).single();
      if (fetchError) throw fetchError;

      await supabaseAdmin.storage.from('gallery').remove([photo.storage_path]);
      const { error } = await supabaseAdmin.from('photos').delete().eq('id', photoId);
      if (error) throw error;

      // If it was the cover, promote the next photo (or clear)
      const { data: album } = await supabaseAdmin
        .from('albums').select('id, cover_path').eq('id', photo.album_id).single();
      if (album?.cover_path === photo.storage_path) {
        const { data: next } = await supabaseAdmin
          .from('photos').select('storage_path').eq('album_id', photo.album_id).limit(1).maybeSingle();
        await supabaseAdmin.from('albums').update({ cover_path: next?.storage_path ?? null }).eq('id', photo.album_id);
      }

      return res.status(200).json({ ok: true });
    }

    if (action === 'delete-album') {
      const { albumId } = req.body;
      const { data: photos, error: listError } = await supabaseAdmin
        .from('photos').select('storage_path').eq('album_id', albumId);
      if (listError) throw listError;

      if (photos.length > 0) {
        // remove() takes up to 100 paths per call
        for (let i = 0; i < photos.length; i += 100) {
          await supabaseAdmin.storage.from('gallery').remove(photos.slice(i, i + 100).map(p => p.storage_path));
        }
      }
      const { error } = await supabaseAdmin.from('albums').delete().eq('id', albumId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (action === 'set-publish') {
      const { albumId, published } = req.body;
      const { error } = await supabaseAdmin.from('albums').update({ published: !!published }).eq('id', albumId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (action === 'set-cover') {
      const { albumId, path } = req.body;
      const { error } = await supabaseAdmin.from('albums').update({ cover_path: path }).eq('id', albumId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('gallery error:', err);
    return res.status(500).json({ error: 'Gallery operation failed' });
  }
}
