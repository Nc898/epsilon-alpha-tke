// src/lib/instagramFeed.test.js
import { describe, it, expect } from 'vitest';
import { mapBeholdPayload } from './instagramFeed';

const post = (over = {}) => ({
  id: '123',
  permalink: 'https://www.instagram.com/p/abc/',
  mediaUrl: 'https://cdn.example.com/full.jpg',
  caption: 'Car show day! #tke',
  timestamp: '2026-06-01T15:00:00+0000',
  mediaType: 'IMAGE',
  ...over,
});

describe('mapBeholdPayload', () => {
  it('maps an object payload with posts array', () => {
    const tiles = mapBeholdPayload({ username: 'tkeslu', posts: [post()] });
    expect(tiles).toEqual([
      {
        id: '123',
        permalink: 'https://www.instagram.com/p/abc/',
        imageUrl: 'https://cdn.example.com/full.jpg',
        caption: 'Car show day! #tke',
        timestamp: '2026-06-01T15:00:00+0000',
        isVideo: false,
      },
    ]);
  });

  it('maps a bare array payload', () => {
    expect(mapBeholdPayload([post()])).toHaveLength(1);
  });

  it('prefers sizes.medium.mediaUrl when present', () => {
    const tiles = mapBeholdPayload([
      post({ sizes: { medium: { mediaUrl: 'https://cdn.example.com/med.jpg' } } }),
    ]);
    expect(tiles[0].imageUrl).toBe('https://cdn.example.com/med.jpg');
  });

  it('falls back to thumbnailUrl for videos and flags isVideo', () => {
    const tiles = mapBeholdPayload([
      post({ mediaType: 'VIDEO', mediaUrl: undefined, thumbnailUrl: 'https://cdn.example.com/thumb.jpg' }),
    ]);
    expect(tiles[0].imageUrl).toBe('https://cdn.example.com/thumb.jpg');
    expect(tiles[0].isVideo).toBe(true);
  });

  it('drops posts missing an image or permalink', () => {
    expect(mapBeholdPayload([post({ mediaUrl: undefined, sizes: undefined })])).toEqual([]);
    expect(mapBeholdPayload([post({ permalink: undefined })])).toEqual([]);
  });

  it('defaults caption to empty string', () => {
    expect(mapBeholdPayload([post({ caption: undefined })])[0].caption).toBe('');
  });

  it('returns [] for garbage payloads', () => {
    expect(mapBeholdPayload(null)).toEqual([]);
    expect(mapBeholdPayload(undefined)).toEqual([]);
    expect(mapBeholdPayload('nope')).toEqual([]);
    expect(mapBeholdPayload({ posts: 'nope' })).toEqual([]);
    expect(mapBeholdPayload({})).toEqual([]);
  });
});
