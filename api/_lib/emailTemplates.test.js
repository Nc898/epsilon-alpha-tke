import { describe, it, expect } from 'vitest';
import { confirmationEmail, reminderEmail } from './emailTemplates.js';

const reg = { id: 'abc-123', name: 'Nick', car_year: '1969', car_make: 'Ford', car_model: 'Mustang' };
const event = {
  title: 'TKE for St. Jude Car Show — Foundry Classics',
  date: '2026-07-26', time: '11:00 AM – 2:00 PM',
  location: 'City Foundry STL', rain_date: '2026-08-02',
};

describe('confirmationEmail', () => {
  const { subject, html, text } = confirmationEmail({ registration: reg, event });
  it('includes the registration id as confirmation number', () => {
    expect(html).toContain('abc-123');
    expect(text).toContain('abc-123');
  });
  it('includes rain-or-shine + rain date policy', () => {
    expect(html.toLowerCase()).toContain('rain or shine');
    expect(html).toContain('August 2');
  });
  it('omits the rain-date sentence (never "Invalid Date") when no rain_date is set', () => {
    const noRain = confirmationEmail({ registration: reg, event: { ...event, rain_date: null } });
    expect(noRain.html.toLowerCase()).toContain('rain or shine'); // compliance line still present
    expect(noRain.html).not.toContain('Invalid Date');
    expect(noRain.text).not.toContain('Invalid Date');
    expect(noRain.html).not.toContain('rain date is');
  });
  it('NEVER claims tax deductibility (ALSAC gate not cleared)', () => {
    for (const s of [subject, html, text]) {
      expect(s.toLowerCase()).not.toContain('tax');
      expect(s.toLowerCase()).not.toContain('deduct');
    }
  });
  it('has a plain-text fallback', () => {
    expect(text.length).toBeGreaterThan(50);
  });
});

describe('reminderEmail', () => {
  it('T-1 subject says tomorrow', () => {
    expect(reminderEmail({ registration: reg, event, daysOut: 1 }).subject.toLowerCase()).toContain('tomorrow');
  });
  it('T-7 subject says one week', () => {
    expect(reminderEmail({ registration: reg, event, daysOut: 7 }).subject.toLowerCase()).toContain('week');
  });
  it('never claims tax deductibility', () => {
    const { subject, html, text } = reminderEmail({ registration: reg, event, daysOut: 7 });
    for (const s of [subject, html, text]) expect(s.toLowerCase()).not.toContain('deduct');
  });
});
