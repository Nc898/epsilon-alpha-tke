// src/lib/instagramFeed.js
// Normalizes a Behold.so feed payload (bare array OR {posts: []}) into the
// tile model rendered by <InstagramFeed>. Never throws — bad input → [].
// Instagram emits offsets without a colon (+0000), which Safari's Date
// parser rejects. Normalize to ISO; unparseable → null.
function normalizeTimestamp(ts) {
  if (typeof ts !== 'string') return null;
  const iso = ts.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

const isHttps = (u) => typeof u === 'string' && u.startsWith('https://');

export function mapBeholdPayload(payload) {
  const posts = Array.isArray(payload) ? payload : payload?.posts;
  if (!Array.isArray(posts)) return [];

  return posts.flatMap((p) => {
    if (!p || typeof p !== 'object') return [];
    const imageUrl = p.sizes?.medium?.mediaUrl ?? p.mediaUrl ?? p.thumbnailUrl;
    if (!isHttps(imageUrl) || !isHttps(p.permalink)) return [];
    return [{
      id: p.id ?? p.permalink,
      permalink: p.permalink,
      imageUrl,
      caption: p.caption ?? '',
      timestamp: normalizeTimestamp(p.timestamp),
      isVideo: p.mediaType === 'VIDEO',
    }];
  });
}
