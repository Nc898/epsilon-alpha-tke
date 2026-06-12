-- Photo gallery: albums + photos + public 'gallery' storage bucket.
-- NOT YET APPLIED — run via Supabase MCP apply_migration or the SQL editor
-- on project sbwjtbwjghapopiutjdu (tke-epsilon-alpha).

-- albums: one row per event album (e.g. "Car Show 2025")
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  event_date date,
  cover_path text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- photos: service-role writes only; storage_path points into the gallery bucket
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null,
  size_bytes integer,
  created_at timestamptz not null default now()
);
create index photos_album_id_idx on public.photos (album_id, created_at);

alter table public.albums enable row level security;
alter table public.photos enable row level security;

-- public can read published albums and their photos; only service role writes
create policy "albums_public_read" on public.albums
  for select using (published);

create policy "photos_public_read" on public.photos
  for select using (
    exists (
      select 1 from public.albums a
      where a.id = photos.album_id and a.published
    )
  );

-- public storage bucket for the photo files (public read via /object/public/)
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;
