import { describe, it, expect } from 'vitest';
import { sponsorSlug, listSponsors, getSponsorBySlug } from './carShowSponsors';

describe('sponsorSlug', () => {
  it('generates the documented example slugs', () => {
    expect(sponsorSlug('RP Exotics')).toBe('rp-exotics');
    expect(sponsorSlug('Neiman Marcus St. Louis')).toBe('neiman-marcus-st-louis');
    expect(sponsorSlug('Audi Exchange Kirkwood')).toBe('audi-exchange-kirkwood');
    expect(sponsorSlug('Fastlane')).toBe('fastlane');
  });

  it('drops apostrophes instead of hyphenating them', () => {
    expect(sponsorSlug("O'Brien's Motors")).toBe('obriens-motors');
    expect(sponsorSlug('D’Angelo Auto')).toBe('dangelo-auto');
  });

  it('collapses consecutive separators and trims edge hyphens', () => {
    expect(sponsorSlug('  A &   B -- Garage!  ')).toBe('a-b-garage');
    expect(sponsorSlug('--Weird--Name--')).toBe('weird-name');
  });

  it('returns an empty string for punctuation-only names', () => {
    expect(sponsorSlug('!!!')).toBe('');
  });
});

describe('listSponsors', () => {
  it('normalizes entries with generated slugs and active defaulting to true', () => {
    const sponsors = listSponsors();
    expect(sponsors.length).toBeGreaterThan(0);
    for (const s of sponsors) {
      expect(s.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof s.active).toBe('boolean');
    }
  });

  it('keeps Fastlane with a stable slug but DEACTIVATED (July show archived)', () => {
    const fastlane = listSponsors().find((s) => s.name === 'Fastlane');
    expect(fastlane).toBeTruthy();
    expect(fastlane.slug).toBe('fastlane');
    // /carshow/register/* now serves the October show; July links must not
    // attribute to it. Slugs stay forever for July's attribution history.
    expect(fastlane.active).toBe(false);
  });

  it('keeps Cherry Garage (logo + slug) but deactivated with the July show', () => {
    const cherryGarage = listSponsors().find((s) => s.name === 'Cherry Garage');
    expect(cherryGarage).toBeTruthy();
    expect(cherryGarage.slug).toBe('cherry-garage');
    expect(cherryGarage.logo).toBe('/assets/sponsors/cherry-garage.webp');
    expect(cherryGarage.active).toBe(false);
  });

  it('deactivates ALL July sponsors so stale links cannot attribute to the October show', () => {
    const julySlugs = ['fastlane', 'jim-butler', 'revved-up-wishes', 'cherry-garage', 'reid-vann'];
    for (const slug of julySlugs) {
      const s = getSponsorBySlug(slug);
      expect(s, `july sponsor ${slug} must stay on the list (attribution history)`).toBeTruthy();
      expect(s.active, `july sponsor ${slug} must be inactive`).toBe(false);
    }
  });

  it('includes the Revved Up Wishes Sterrato showcase', () => {
    const revvedUp = listSponsors().find((s) => s.name === 'Revved Up Wishes');
    expect(revvedUp?.feature?.image).toBe('/assets/sponsors/revved-sterrato-spin/frame-08.webp');
    expect(revvedUp?.feature?.title).toBe('2024 Lamborghini Huracan Sterrato');
    expect(revvedUp?.feature?.details).toContain('Verde Gea');
    expect(revvedUp?.feature?.spinFrames).toHaveLength(8);
  });

  it('includes both Jim Butler Maserati spin showcases (MC20 + Grecale)', () => {
    const jimButler = listSponsors().find((s) => s.slug === 'jim-butler');
    expect(jimButler?.features).toHaveLength(2);
    expect(jimButler?.feature?.title).toBe('2024 Maserati MC20 Cielo'); // features[0]
    expect(jimButler?.features[0].spinFrames).toHaveLength(8);
    expect(jimButler?.features[0].spinFrames[0]).toBe('/assets/sponsors/maserati-mc20-spin/frame-01.webp');
    expect(jimButler?.features[1].title).toBe('2024 Maserati Grecale Modena');
    expect(jimButler?.features[1].spinFrames).toHaveLength(8);
    expect(jimButler?.features[1].spinFrames[0]).toBe('/assets/sponsors/maserati-grecale-spin/frame-01.webp');
  });
});

describe('getSponsorBySlug', () => {
  it('finds an approved sponsor by slug', () => {
    expect(getSponsorBySlug('fastlane')?.name).toBe('Fastlane');
  });

  it('is case-insensitive on the incoming slug', () => {
    expect(getSponsorBySlug('FASTLANE')?.name).toBe('Fastlane');
    expect(getSponsorBySlug('CHERRY-GARAGE')?.name).toBe('Cherry Garage');
  });

  it('returns null for invented, empty, or malicious slugs', () => {
    expect(getSponsorBySlug('not-a-sponsor')).toBeNull();
    expect(getSponsorBySlug('')).toBeNull();
    expect(getSponsorBySlug(null)).toBeNull();
    expect(getSponsorBySlug(undefined)).toBeNull();
    expect(getSponsorBySlug("fastlane' OR 1=1 --")).toBeNull();
    expect(getSponsorBySlug('<script>alert(1)</script>')).toBeNull();
  });
});
