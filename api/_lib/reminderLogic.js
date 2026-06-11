const chicagoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' });

/**
 * Decide which reminder (if any) is due for an event today.
 * "Today" is computed in America/Chicago so the daily cron behaves
 * consistently regardless of when it fires in UTC.
 *
 * @param {string} eventDate - event date as 'YYYY-MM-DD'
 * @param {Date} now - current time
 * @returns {'reminder_7d' | 'reminder_1d' | null}
 */
export function reminderTypeForEvent(eventDate, now) {
  const today = chicagoDate.format(now); // 'YYYY-MM-DD' in America/Chicago
  const diffDays = (Date.parse(`${eventDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  if (diffDays === 7) return 'reminder_7d';
  if (diffDays === 1) return 'reminder_1d';
  return null;
}
