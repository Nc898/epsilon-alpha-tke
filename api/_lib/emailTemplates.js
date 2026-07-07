// Email templates for car show registration emails (sent via Resend).
//
// Compliance rules (St. Jude / ALSAC obligations — enforced by emailTemplates.test.js):
//   1. NEVER mention tax-deductibility in any form until the ALSAC compliance gate clears.
//   2. Every communication carries the rain-or-shine + rain-date policy (fail-safe R1).
//   3. Transactional emails to registrants — no unsubscribe link.
//
// Pure functions, no dependencies. Node-compatible ESM (imported by Vercel Functions).

const BLACK = '#0a0a0a';
const CHERRY = '#AD2624';
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const CONTACT_EMAIL = 'slutkestewardship@gmail.com';
const CHAPTER_LINE = 'TKE Epsilon Alpha — Saint Louis University';

/** Format 'YYYY-MM-DD' as e.g. "Sunday, July 26, 2026" without external deps. */
function formatDate(isoDate, options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

/** Short form, e.g. "August 2" — used for the rain date. */
function formatDateShort(isoDate) {
  return formatDate(isoDate, { month: 'long', day: 'numeric' });
}

function carSummary(registration) {
  return [registration.car_year, registration.car_make, registration.car_model]
    .filter(Boolean)
    .join(' ');
}

function rainPolicyLine(event) {
  // The rain-or-shine line is mandatory on every communication (fail-safe R1).
  // The rain-date sentence is only appended when a rain date is actually set —
  // otherwise we'd render "our rain date is Invalid Date".
  if (!event.rain_date) {
    return `This event runs rain or shine.`;
  }
  return `This event runs rain or shine. In case of severe weather, our rain date is ${formatDateShort(event.rain_date)}.`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Shared branded shell: black header band with chapter wordmark, cherry red
 * accent bar, 600px centered layout, inline styles only.
 */
function wrapHtml({ bodyHtml }) {
  return `<!-- TKE Epsilon Alpha transactional email -->
<div style="margin:0;padding:0;background-color:#f4f4f4;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <div style="background-color:${BLACK};padding:28px 32px;text-align:center;">
      <div style="font-family:${SERIF};font-size:18px;letter-spacing:3px;color:#ffffff;">TAU KAPPA EPSILON</div>
      <div style="font-family:${SANS};font-size:11px;letter-spacing:4px;color:#cccccc;margin-top:6px;">EPSILON ALPHA</div>
    </div>
    <div style="height:4px;background-color:${CHERRY};"></div>
    <div style="padding:32px;font-family:${SANS};font-size:15px;line-height:1.6;color:#1a1a1a;">
${bodyHtml}
    </div>
    <div style="height:1px;background-color:#e5e5e5;"></div>
    <div style="padding:24px 32px;font-family:${SANS};font-size:12px;line-height:1.6;color:#777777;text-align:center;">
      <p style="margin:0 0 4px;">Questions? <a href="mailto:${CONTACT_EMAIL}" style="color:${CHERRY};text-decoration:none;">${CONTACT_EMAIL}</a></p>
      <p style="margin:0;">${CHAPTER_LINE}</p>
    </div>
  </div>
</div>`;
}

function textFooter() {
  return `---\nQuestions? ${CONTACT_EMAIL}\n${CHAPTER_LINE}`;
}

function confirmationBlockHtml(registration) {
  return `      <div style="background-color:#f7f7f7;border-left:4px solid ${CHERRY};padding:16px 20px;margin:24px 0;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#777777;">Confirmation Number</div>
        <div style="font-family:${SERIF};font-size:22px;color:${BLACK};margin-top:4px;">${escapeHtml(registration.id)}</div>
      </div>`;
}

function eventDetailsHtml(event) {
  return `      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 24px;">
        <tr><td style="padding:6px 0;font-family:${SANS};font-size:14px;color:#777777;width:90px;">Date</td><td style="padding:6px 0;font-family:${SANS};font-size:14px;color:#1a1a1a;">${escapeHtml(formatDate(event.date))}</td></tr>
        <tr><td style="padding:6px 0;font-family:${SANS};font-size:14px;color:#777777;">Time</td><td style="padding:6px 0;font-family:${SANS};font-size:14px;color:#1a1a1a;">${escapeHtml(event.time)}</td></tr>
        <tr><td style="padding:6px 0;font-family:${SANS};font-size:14px;color:#777777;">Location</td><td style="padding:6px 0;font-family:${SANS};font-size:14px;color:#1a1a1a;">${escapeHtml(event.location)}</td></tr>
      </table>`;
}

/**
 * Registration confirmation email.
 * @returns {{ subject: string, html: string, text: string }}
 */
export function confirmationEmail({ registration, event }) {
  const subject = `You're registered — ${event.title}`;
  const car = carSummary(registration);
  const rainLine = rainPolicyLine(event);
  const isJulyShow = event.slug === 'car-show-2026' || event.date === '2026-07-26';
  const julyHtml = isJulyShow
    ? `      <p style="margin:0 0 16px;"><strong>Transparency:</strong> TKE is insured for this event.</p>
      <p style="margin:0 0 16px;">Your registered vehicle also receives recognition as a Participating Event Sponsor/Supporter for the July 26 show.</p>`
    : '';

  const bodyHtml = `      <h1 style="font-family:${SERIF};font-size:26px;font-weight:normal;color:${BLACK};margin:0 0 8px;">You're registered!</h1>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(registration.name)}, your spot at <strong>${escapeHtml(event.title)}</strong> is confirmed. We can't wait to see your <strong>${escapeHtml(car)}</strong> on the lot.</p>
${confirmationBlockHtml(registration)}
      <h2 style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${BLACK};margin:24px 0 4px;">Event Details</h2>
${eventDetailsHtml(event)}
      <p style="margin:0 0 16px;"><strong>Show this email at check-in.</strong></p>
${julyHtml}
      <p style="margin:0 0 16px;color:#444444;">${escapeHtml(rainLine)}</p>`;

  const text = [
    `You're registered!`,
    ``,
    `Hi ${registration.name}, your spot at ${event.title} is confirmed.`,
    `We can't wait to see your ${car} on the lot.`,
    ``,
    `Confirmation Number: ${registration.id}`,
    ``,
    `Event Details`,
    `Date: ${formatDate(event.date)}`,
    `Time: ${event.time}`,
    `Location: ${event.location}`,
    ``,
    `Show this email at check-in.`,
    ...(isJulyShow ? [``, `Transparency: TKE is insured for this event.`, `Your registered vehicle is recognized as a Participating Event Sponsor/Supporter.`] : []),
    ``,
    rainLine,
    ``,
    textFooter(),
  ].join('\n');

  return { subject, html: wrapHtml({ bodyHtml }), text };
}

/**
 * Reminder email (T-7 or T-1 cron).
 * @returns {{ subject: string, html: string, text: string }}
 */
export function reminderEmail({ registration, event, daysOut }) {
  const isTomorrow = daysOut === 1;
  const subject = isTomorrow
    ? `Tomorrow: ${event.title}`
    : `One week until ${event.title}`;
  const car = carSummary(registration);
  const rainLine = rainPolicyLine(event);
  const isJulyShow = event.slug === 'car-show-2026' || event.date === '2026-07-26';
  const insuredHtml = isJulyShow
    ? `      <p style="margin:0 0 12px;"><strong>Transparency:</strong> TKE is insured for this event.</p>`
    : '';

  const intro = isTomorrow
    ? `It's almost showtime — <strong>${escapeHtml(event.title)}</strong> is <strong>tomorrow</strong>. Here are your final logistics.`
    : `<strong>${escapeHtml(event.title)}</strong> is one week away. Here's what to know before the big day.`;

  const middleHtml = isTomorrow
    ? `      <h2 style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${BLACK};margin:24px 0 8px;">Final Logistics</h2>
      <p style="margin:0 0 12px;">Arrive early for load-in so we can get your ${escapeHtml(car)} parked and polished before gates open. Show your confirmation email at check-in.</p>
      <h2 style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${BLACK};margin:24px 0 8px;">Weather Call</h2>
${insuredHtml}
      <p style="margin:0 0 12px;color:#444444;">${escapeHtml(rainLine)}</p>`
    : `      <h2 style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${BLACK};margin:24px 0 8px;">Schedule</h2>
      <p style="margin:0 0 12px;">${escapeHtml(formatDate(event.date))}, ${escapeHtml(event.time)} at ${escapeHtml(event.location)}.</p>
      <h2 style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${BLACK};margin:24px 0 8px;">Parking &amp; Load-In</h2>
      <p style="margin:0 0 12px;">Plan to arrive before gates open — volunteers will direct you to your spot for the ${escapeHtml(car)}. Load-in details will be in your day-before email.</p>
      <h2 style="font-family:${SERIF};font-size:18px;font-weight:normal;color:${BLACK};margin:24px 0 8px;">Raffle</h2>
      <p style="margin:0 0 12px;">We've lined up some great raffle prizes — bring a few extra dollars and try your luck for a good cause.</p>
${insuredHtml}
      <p style="margin:0 0 12px;color:#444444;">${escapeHtml(rainLine)}</p>`;

  const bodyHtml = `      <h1 style="font-family:${SERIF};font-size:26px;font-weight:normal;color:${BLACK};margin:0 0 8px;">${isTomorrow ? 'See you tomorrow!' : 'One week to go!'}</h1>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(registration.name)}, ${intro}</p>
${middleHtml}
${confirmationBlockHtml(registration)}`;

  const middleText = isTomorrow
    ? [
        `Final Logistics`,
        `Arrive early for load-in so we can get your ${car} parked and polished before gates open. Show your confirmation email at check-in.`,
        ``,
        `Weather Call`,
        ...(isJulyShow ? [`Transparency: TKE is insured for this event.`] : []),
        rainLine,
      ]
    : [
        `Schedule`,
        `${formatDate(event.date)}, ${event.time} at ${event.location}.`,
        ``,
        `Parking & Load-In`,
        `Plan to arrive before gates open — volunteers will direct you to your spot for the ${car}. Load-in details will be in your day-before email.`,
        ``,
        `Raffle`,
        `We've lined up some great raffle prizes — bring a few extra dollars and try your luck for a good cause.`,
        ``,
        ...(isJulyShow ? [`Transparency: TKE is insured for this event.`, ``] : []),
        rainLine,
      ];

  const text = [
    isTomorrow ? `See you tomorrow!` : `One week to go!`,
    ``,
    `Hi ${registration.name}, ${event.title} is ${isTomorrow ? 'tomorrow' : 'one week away'}.`,
    ``,
    ...middleText,
    ``,
    `Confirmation Number: ${registration.id}`,
    ``,
    textFooter(),
  ].join('\n');

  return { subject, html: wrapHtml({ bodyHtml }), text };
}
