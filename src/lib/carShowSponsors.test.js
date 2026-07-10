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

  it('includes Fastlane with the expected slug', () => {
    const fastlane = listSponsors().find((s) => s.name === 'Fastlane');
    expect(fastlane).toBeTruthy();
    expect(fastlane.slug).toBe('fastlane');
    expect(fastlane.active).toBe(true);
  });
});

describe('getSponsorBySlug', () => {
  it('finds an approved sponsor by slug', () => {
    expect(getSponsorBySlug('fastlane')?.name).toBe('Fastlane');
  });

  it('is case-insensitive on the incoming slug', () => {
    expect(getSponsorBySlug('FASTLANE')?.name).toBe('Fastlane');
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
