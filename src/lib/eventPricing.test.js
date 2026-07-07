import { describe, expect, it } from 'vitest';
import { entryCentsNow, isEarlyBird } from './eventPricing';

describe('July 26 car show flat pricing', () => {
  const legacyRow = {
    slug: 'car-show-2026',
    entry_price_cents: 5000,
    early_bird_price_cents: 3000,
    early_bird_until: '2026-07-15',
  };

  it('charges $30 before the former cutoff', () => {
    expect(entryCentsNow(legacyRow, new Date('2026-07-01T12:00:00Z'))).toBe(3000);
  });

  it('still charges $30 after the former cutoff', () => {
    expect(entryCentsNow(legacyRow, new Date('2026-07-20T12:00:00Z'))).toBe(3000);
  });

  it('never labels the event as early-bird pricing', () => {
    expect(isEarlyBird(legacyRow, new Date('2026-07-01T12:00:00Z'))).toBe(false);
  });
});
