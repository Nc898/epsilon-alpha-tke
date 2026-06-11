import { describe, it, expect } from 'vitest';
import { reminderTypeForEvent } from './reminderLogic.js';

describe('reminderTypeForEvent', () => {
  it('returns reminder_7d exactly 7 days before', () => {
    expect(reminderTypeForEvent('2026-07-26', new Date('2026-07-19T14:00:00Z'))).toBe('reminder_7d');
  });
  it('returns reminder_1d the day before', () => {
    expect(reminderTypeForEvent('2026-07-26', new Date('2026-07-25T14:00:00Z'))).toBe('reminder_1d');
  });
  it('returns null on other days', () => {
    expect(reminderTypeForEvent('2026-07-26', new Date('2026-07-20T14:00:00Z'))).toBeNull();
    expect(reminderTypeForEvent('2026-07-26', new Date('2026-07-26T14:00:00Z'))).toBeNull();
  });
  it('is timezone-safe around midnight UTC (date math in America/Chicago)', () => {
    // 3am UTC Jul 20 is still Jul 19 in Chicago → reminder_7d
    expect(reminderTypeForEvent('2026-07-26', new Date('2026-07-20T03:00:00Z'))).toBe('reminder_7d');
  });
});
