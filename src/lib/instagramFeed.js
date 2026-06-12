// src/lib/instagramFeed.js
// Normalizes a Behold.so feed payload (bare array OR {posts: []}) into the
// tile model rendered by <InstagramFeed>. Never throws — bad input → [].
export function mapBeholdPayload(payload) {
  const posts = Array.isArray(payload) ? payload : payload?.posts;
  if (!Array.isArray(posts)) return [];

  return posts.flatMap((p) => {
    if (!p || typeof p !== 'object') return [];
    const imageUrl = p.sizes?.medium?.mediaUrl ?? p.mediaUrl ?? p.thumbnailUrl;
    if (!imageUrl || !p.permalink) return [];
    return [{
      id: p.id ?? p.permalink,
      permalink: p.permalink,
      imageUrl,
      caption: p.caption ?? '',
      timestamp: p.timestamp ?? null,
      isVideo: p.mediaType === 'VIDEO',
    }];
  });
}
