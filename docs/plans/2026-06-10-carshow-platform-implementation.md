# Car Show Platform (Week 1–2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a QR-reachable car show registration page with Stripe payment, confirmation email, and automated reminder emails — deployed on Vercel with Supabase as the database.

**Architecture:** Vite SPA stays as-is; new server code lives in Vercel Functions under `/api`. Supabase holds `events`/`registrations`/`email_log` (service-role writes only from functions). Stripe Checkout hosts the payment page (entry fee + optional St. Jude donation line item); its webhook marks registrations paid and triggers Resend confirmation emails. A daily Vercel cron sends T-7/T-1 reminders, idempotent via `email_log`.

**Tech Stack:** Vite 6 + React 18 (existing), Vercel Functions (Node), `@supabase/supabase-js`, `stripe`, `resend`, `qrcode`, Vitest for unit-testable logic.

**Design doc:** `docs/plans/2026-06-10-chapter-platform-design.md`

**External prerequisites (user is handling, not blocking tasks 1–10):** domain purchase, Stripe account activation, Resend account + domain verification. Until then everything runs with Stripe **test mode** keys and Resend's `onboarding@resend.dev` sender.

**Compliance constants (from the season plan — bake into all copy):**
- NO tax-deductibility language anywhere (ALSAC GATE 1 not yet cleared)
- Rain-or-shine + rain date Aug 2 appears on the page and in every email
- Show #1: Foundry Classics, Sun Jul 26 2026, 11:00 AM–2:00 PM, City Foundry STL, $20 entry

**Branch:** work on `feat/carshow-platform`, merge to `master` when the page is demo-able (Anthony pushes to master regularly — rebase, don't merge-commit, per repo convention).

---

### Task 0: Branch + deps + test runner

**Files:**
- Modify: `package.json`

**Step 1: Create branch**

```bash
git checkout -b feat/carshow-platform
```

**Step 2: Install runtime deps**

```bash
npm install @supabase/supabase-js stripe resend qrcode
```

**Step 3: Install vitest**

```bash
npm install -D vitest
```

**Step 4: Add test script to package.json**

In `"scripts"`, add: `"test": "vitest run"`

**Step 5: Verify**

Run: `npx vitest run`
Expected: "No test files found" (exits 1 — fine, no tests yet)

**Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, stripe, resend, qrcode deps + vitest"
```

---

### Task 1: Vercel SPA config

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "crons": [
    { "path": "/api/send-reminders", "schedule": "0 14 * * *" }
  ]
}
```

(14:00 UTC = 9am Central. The negative-lookahead rewrite keeps `/api/*` routed to functions, everything else to the SPA.)

**Step 2: Verify build works locally**

Run: `npm run build`
Expected: `dist/` produced without errors

**Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: vercel config — SPA rewrite + daily reminder cron"
```

---

### Task 2: Supabase schema migration

**Files:**
- Create: `supabase/migrations/20260610_platform.sql`

**Step 1: Write the migration**

```sql
-- events: one row per registerable event
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  date date not null,
  time text,
  location text not null,
  description text,
  event_type text not null default 'philanthropy',
  status text not null default 'upcoming',
  registration_open boolean not null default false,
  entry_price_cents integer not null default 2000,
  capacity integer,
  image_url text,
  rain_date date,
  created_at timestamptz not null default now()
);

-- registrations: service-role writes only
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  name text not null,
  email text not null,
  phone text,
  car_year text,
  car_make text,
  car_model text,
  car_class text check (car_class in ('classic','exotic','performance','other')),
  stripe_session_id text unique,
  amount_paid_cents integer not null default 0,
  donation_cents integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','paid','refunded','checked_in')),
  created_at timestamptz not null default now()
);

-- email_log: idempotency for automated sends
create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id),
  email_type text not null
    check (email_type in ('confirmation','reminder_7d','reminder_1d','thank_you')),
  sent_at timestamptz not null default now(),
  unique (registration_id, email_type)
);

alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.email_log enable row level security;

-- events are publicly readable; only service role writes
create policy "events_public_read" on public.events
  for select using (true);

-- registrations + email_log: NO anon policies at all.
-- Service role bypasses RLS, so Vercel Functions retain full access.

-- registration counts must be public (capacity display) without exposing PII
create view public.registration_counts
  with (security_invoker = off) as
  select event_id, count(*)::int as paid_count
  from public.registrations
  where status = 'paid'
  group by event_id;
grant select on public.registration_counts to anon, authenticated;
```

**Step 2: Apply it**

Either `supabase db push` (if CLI linked) or paste into the Supabase dashboard SQL editor and run.
Expected: success, three tables + one view visible in Table Editor.

**Step 3: Seed Show #1**

Run in SQL editor:

```sql
insert into public.events
  (title, slug, date, time, location, description, registration_open,
   entry_price_cents, capacity, rain_date)
values
  ('TKE for St. Jude Car Show — Foundry Classics', 'foundry-classics-2026',
   '2026-07-26', '11:00 AM – 2:00 PM', 'City Foundry STL',
   'Classic car show benefiting St. Jude Children''s Research Hospital. Rain or shine — rain date Sunday, August 2.',
   true, 2000, 80, '2026-08-02');
```

**Step 4: Verify**

In SQL editor: `select slug, registration_open from events;`
Expected: one row, `foundry-classics-2026`, `true`

**Step 5: Commit**

```bash
git add supabase/migrations/20260610_platform.sql
git commit -m "feat: supabase schema — events, registrations, email_log + RLS"
```

---

### Task 3: Supabase clients + env scaffolding

**Files:**
- Create: `src/lib/supabaseClient.js` (browser, anon key)
- Create: `api/_lib/supabaseAdmin.js` (functions, service role)
- Create: `.env.example`
- Modify: `.gitignore` (ensure `.env*.local` ignored)

**Step 1: Browser client**

```js
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Step 2: Admin client (Node, service role — never imported by browser code)**

```js
// api/_lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
```

**Step 3: .env.example**

```
# Browser (Vite)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Vercel Functions only — NEVER prefix with VITE_
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
EMAIL_FROM="TKE Epsilon Alpha <onboarding@resend.dev>"
SITE_URL=http://localhost:5173
ADMIN_KEY=
```

**Step 4: Create `.env.local` with real values** (Supabase project settings → API). Verify `.env.local` is gitignored: `git check-ignore .env.local` prints the path.

**Step 5: Smoke test**

Run: `node -e "import('./api/_lib/supabaseAdmin.js')"` — expect no import errors (env empty is fine at import time).

**Step 6: Commit**

```bash
git add src/lib/supabaseClient.js api/_lib/supabaseAdmin.js .env.example .gitignore
git commit -m "feat: supabase browser + admin clients, env scaffolding"
```

---

### Task 4: Registration validation schema (TDD)

Shared by the form and the API. Pure logic — test it properly.

**Files:**
- Create: `src/lib/registrationSchema.js`
- Test: `src/lib/registrationSchema.test.js`

**Step 1: Write failing tests**

```js
// src/lib/registrationSchema.test.js
import { describe, it, expect } from 'vitest';
import { registrationSchema } from './registrationSchema';

const valid = {
  name: 'Nick Childs',
  email: 'nick@example.com',
  phone: '314-555-1234',
  car_year: '1969',
  car_make: 'Ford',
  car_model: 'Mustang',
  car_class: 'classic',
  donation_dollars: 10,
};

describe('registrationSchema', () => {
  it('accepts a complete valid registration', () => {
    expect(registrationSchema.parse(valid)).toMatchObject({ name: 'Nick Childs' });
  });
  it('rejects a bad email', () => {
    expect(() => registrationSchema.parse({ ...valid, email: 'nope' })).toThrow();
  });
  it('rejects an unknown car class', () => {
    expect(() => registrationSchema.parse({ ...valid, car_class: 'spaceship' })).toThrow();
  });
  it('defaults donation to 0 when omitted', () => {
    const { donation_dollars, ...rest } = valid;
    expect(registrationSchema.parse(rest).donation_dollars).toBe(0);
  });
  it('rejects negative donations', () => {
    expect(() => registrationSchema.parse({ ...valid, donation_dollars: -5 })).toThrow();
  });
  it('coerces string donation input from the form', () => {
    expect(registrationSchema.parse({ ...valid, donation_dollars: '25' }).donation_dollars).toBe(25);
  });
  it('requires phone to be omittable', () => {
    const { phone, ...rest } = valid;
    expect(() => registrationSchema.parse(rest)).not.toThrow();
  });
});
```

**Step 2: Run to verify failure**

Run: `npx vitest run src/lib/registrationSchema.test.js`
Expected: FAIL — cannot resolve `./registrationSchema`

**Step 3: Implement**

```js
// src/lib/registrationSchema.js
import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Valid email required'),
  phone: z.string().trim().optional(),
  car_year: z.string().trim().min(2, 'Year required'),
  car_make: z.string().trim().min(1, 'Make required'),
  car_model: z.string().trim().min(1, 'Model required'),
  car_class: z.enum(['classic', 'exotic', 'performance', 'other']),
  donation_dollars: z.coerce.number().int().min(0).max(10000).default(0),
});
```

**Step 4: Run tests**

Run: `npx vitest run src/lib/registrationSchema.test.js`
Expected: 7 passed

**Step 5: Commit**

```bash
git add src/lib/registrationSchema.js src/lib/registrationSchema.test.js
git commit -m "feat: shared registration zod schema with tests"
```

---

### Task 5: `POST /api/checkout`

**Files:**
- Create: `api/checkout.js`

**Step 1: Implement**

```js
// api/checkout.js
import Stripe from 'stripe';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { registrationSchema } from '../src/lib/registrationSchema.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = registrationSchema.safeParse(req.body?.registration);
  const eventSlug = req.body?.event_slug;
  if (!parsed.success || !eventSlug) {
    return res.status(400).json({ error: 'Invalid registration data' });
  }
  const reg = parsed.data;

  const { data: event } = await supabaseAdmin
    .from('events').select('*').eq('slug', eventSlug).single();
  if (!event || !event.registration_open) {
    return res.status(404).json({ error: 'Registration is not open for this event' });
  }

  // capacity check (paid only — pendings may abandon)
  if (event.capacity) {
    const { count } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id).eq('status', 'paid');
    if (count >= event.capacity) {
      return res.status(409).json({ error: 'This event is sold out' });
    }
  }

  const donationCents = reg.donation_dollars * 100;
  const { data: row, error: insertErr } = await supabaseAdmin
    .from('registrations')
    .insert({
      event_id: event.id,
      name: reg.name, email: reg.email, phone: reg.phone ?? null,
      car_year: reg.car_year, car_make: reg.car_make, car_model: reg.car_model,
      car_class: reg.car_class,
      amount_paid_cents: 0, donation_cents: donationCents, status: 'pending',
    })
    .select().single();
  if (insertErr) return res.status(500).json({ error: 'Could not create registration' });

  const lineItems = [{
    price_data: {
      currency: 'usd',
      product_data: { name: `${event.title} — Entry` },
      unit_amount: event.entry_price_cents,
    },
    quantity: 1,
  }];
  if (donationCents > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'St. Jude Donation (optional add-on)' },
        unit_amount: donationCents,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: reg.email,
    metadata: { registration_id: row.id, event_slug: event.slug },
    success_url: `${process.env.SITE_URL}/events/${event.slug}?status=success`,
    cancel_url: `${process.env.SITE_URL}/events/${event.slug}?status=cancelled`,
  });

  await supabaseAdmin.from('registrations')
    .update({ stripe_session_id: session.id }).eq('id', row.id);

  return res.status(200).json({ url: session.url });
}
```

**Step 2: Verify locally with `vercel dev`**

```bash
npx vercel dev
# in another terminal:
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"event_slug":"foundry-classics-2026","registration":{"name":"Test Driver","email":"test@example.com","car_year":"1969","car_make":"Ford","car_model":"Mustang","car_class":"classic","donation_dollars":5}}'
```

Expected: `{"url":"https://checkout.stripe.com/..."}` (with test-mode `STRIPE_SECRET_KEY` in `.env.local`; `vercel dev` reads it). A `pending` row appears in Supabase.

**Step 3: Commit**

```bash
git add api/checkout.js
git commit -m "feat: checkout endpoint — pending registration + stripe session"
```

---

### Task 6: Email templates (TDD on content rules)

**Files:**
- Create: `api/_lib/emailTemplates.js`
- Test: `api/_lib/emailTemplates.test.js`

**Step 1: Write failing tests** — the compliance rules are the spec:

```js
// api/_lib/emailTemplates.test.js
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
```

**Step 2: Run to verify failure** — `npx vitest run api/_lib/emailTemplates.test.js` → FAIL (module missing)

**Step 3: Implement** — TKE-branded inline-style HTML (cherry red `#AD2624`, black header with logo text, Playfair-ish serif headings via font stack). Both `confirmationEmail` and `reminderEmail` return `{ subject, html, text }`. Confirmation contains: greeting, confirmation # (`registration.id`), car summary, event date/time/location, "show this email at check-in", rain-or-shine + rain-date line, contact email. Reminder T-7: schedule + parking + raffle teaser; T-1: final logistics + weather-call note. Footer on all: chapter name/address + "questions: tke.epsilonalpha@slu.edu". No tax language anywhere.

**Step 4: Run tests** — expected: all pass

**Step 5: Commit**

```bash
git add api/_lib/emailTemplates.js api/_lib/emailTemplates.test.js
git commit -m "feat: confirmation + reminder email templates with compliance tests"
```

---

### Task 7: Stripe webhook → mark paid → send confirmation

**Files:**
- Create: `api/stripe-webhook.js`

**Step 1: Implement**

```js
// api/stripe-webhook.js
import Stripe from 'stripe';
import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { confirmationEmail } from './_lib/emailTemplates.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      await rawBody(req),
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature failed: ${err.message}` });
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const regId = session.metadata?.registration_id;
    if (regId) {
      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .update({ status: 'paid', amount_paid_cents: session.amount_total })
        .eq('id', regId)
        .select('*, events(*)').single();

      if (reg) {
        // idempotent: unique (registration_id, email_type) — insert first, send only if new
        const { error: logErr } = await supabaseAdmin
          .from('email_log')
          .insert({ registration_id: reg.id, email_type: 'confirmation' });
        if (!logErr) {
          const { subject, html, text } = confirmationEmail({ registration: reg, event: reg.events });
          await resend.emails.send({
            from: process.env.EMAIL_FROM, to: reg.email, subject, html, text,
          });
        }
      }
    }
  }

  return res.status(200).json({ received: true });
}
```

**Step 2: Verify end-to-end in test mode**

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook   # gives whsec_... → .env.local
# complete a checkout from Task 5's curl URL using card 4242 4242 4242 4242
```

Expected: registration flips to `paid` in Supabase, `email_log` row appears, Resend dashboard shows the send (to your own email).

**Step 3: Commit**

```bash
git add api/stripe-webhook.js
git commit -m "feat: stripe webhook — mark paid, send confirmation idempotently"
```

---

### Task 8: Reminder cron (TDD on day-selection logic)

**Files:**
- Create: `api/_lib/reminderLogic.js`
- Test: `api/_lib/reminderLogic.test.js`
- Create: `api/send-reminders.js`

**Step 1: Failing tests for the pure logic**

```js
// api/_lib/reminderLogic.test.js
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
```

**Step 2: Run** → FAIL (module missing)

**Step 3: Implement** — compute "today" in `America/Chicago` via `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' })` (yields `YYYY-MM-DD`), diff against the event date in whole days; return `'reminder_7d'`, `'reminder_1d'`, or `null`.

**Step 4: Run tests** → PASS

**Step 5: Cron endpoint**

```js
// api/send-reminders.js
import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { reminderEmail } from './_lib/emailTemplates.js';
import { reminderTypeForEvent } from './_lib/reminderLogic.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Vercel cron sends Authorization: Bearer $CRON_SECRET when set
  if (process.env.CRON_SECRET &&
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const { data: events } = await supabaseAdmin
    .from('events').select('*').eq('status', 'upcoming');

  let sent = 0;
  for (const event of events ?? []) {
    const type = reminderTypeForEvent(event.date, new Date());
    if (!type) continue;
    const daysOut = type === 'reminder_7d' ? 7 : 1;

    const { data: regs } = await supabaseAdmin
      .from('registrations').select('*')
      .eq('event_id', event.id).eq('status', 'paid');

    for (const reg of regs ?? []) {
      const { error: logErr } = await supabaseAdmin
        .from('email_log').insert({ registration_id: reg.id, email_type: type });
      if (logErr) continue; // already sent — idempotent
      const { subject, html, text } = reminderEmail({ registration: reg, event, daysOut });
      await resend.emails.send({ from: process.env.EMAIL_FROM, to: reg.email, subject, html, text });
      sent++;
    }
  }
  return res.status(200).json({ sent });
}
```

**Step 6: Verify** — temporarily set a test event's date to 7 days from today in Supabase, run `curl http://localhost:3000/api/send-reminders` under `vercel dev`, expect `{"sent":N}` and email_log rows; run again, expect `{"sent":0}` (idempotent). Reset the date.

**Step 7: Commit**

```bash
git add api/_lib/reminderLogic.js api/_lib/reminderLogic.test.js api/send-reminders.js
git commit -m "feat: daily reminder cron with timezone-safe T-7/T-1 logic"
```

---

### Task 9: Event signup page UI

**Files:**
- Create: `src/pages/EventSignup.jsx`
- Modify: `src/App.jsx` (add routes)

**Step 1: Build the page** at route `/events/:slug`:

- Fetch event by slug from Supabase (TanStack Query + `supabase.from('events').select().eq('slug', slug).single()`); also fetch `registration_counts` for the spots-left badge when capacity is set
- Dark hero matching the site system (Playfair heading, cherry red accents): title, date/time/location, price, "Rain or shine — rain date Aug 2" line
- Form (react-hook-form + `zodResolver(registrationSchema)`, shadcn `Input`/`Select`/`Button`): name, email, phone (optional), car year/make/model, class select, optional "Add a St. Jude donation" dollar input
- Submit → `POST /api/checkout` → `window.location = url`; loading state on the button; sonner toast on error; "sold out" state when API returns 409
- Handle `?status=success` (show confirmation panel: "You're registered — check your email", confetti via existing `canvas-confetti`) and `?status=cancelled` (toast "Payment cancelled — your spot is not reserved", form still usable)
- Mobile-first: single column, large tap targets — every QR scan is a phone

**Step 2: Add routes in App.jsx** (inside the `Layout` route group):

```jsx
<Route path="/events/:slug" element={<EventSignup />} />
```

**Step 3: Verify manually** — `npm run dev`, visit `/events/foundry-classics-2026`, complete a test-mode payment with `4242…`, land back on success panel, confirmation email arrives.

**Step 4: Commit**

```bash
git add src/pages/EventSignup.jsx src/App.jsx
git commit -m "feat: event signup page with stripe checkout flow"
```

---

### Task 10: `/carshow` + `/donate` QR routes

**Files:**
- Create: `src/pages/CarShowRedirect.jsx`
- Create: `src/pages/Donate.jsx`
- Modify: `src/App.jsx`

**Step 1: `/carshow`** — fetch the next `registration_open` event ordered by date, `<Navigate to={`/events/${slug}`} replace />`; if none, render a "registration opens soon" card with the chapter contact. This is what the printed QR points at all season.

**Step 2: `/donate`** — minimal dark page: St. Jude copy, one big cherry-red button → `https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry` (the chapter's existing St. Jude page), no tax language. Used by the gate-donation QR at shows.

**Step 3: Routes** — `<Route path="/carshow" element={<CarShowRedirect />} />` and `<Route path="/donate" element={<Donate />} />` in the Layout group.

**Step 4: Verify** — both URLs resolve in dev; `/carshow` lands on the Foundry page.

**Step 5: Commit**

```bash
git add src/pages/CarShowRedirect.jsx src/pages/Donate.jsx src/App.jsx
git commit -m "feat: /carshow QR redirect + /donate page"
```

---

### Task 11: Admin registrations view

**Files:**
- Create: `api/registrations.js`
- Create: `src/pages/AdminRegistrations.jsx`
- Modify: `src/App.jsx`

**Step 1: `GET /api/registrations?key=<ADMIN_KEY>&event=<slug>`** — compares `key` to `process.env.ADMIN_KEY` (timing-safe via `crypto.timingSafeEqual` on hashed values); returns registrations + totals (paid count, gross cents, donation cents) via service role. 401 on mismatch.

**Step 2: `/admin` page** — prompts for the key (stored in `sessionStorage`), then: stat tiles (paid / pending / gross / donations — the Jul 12 "25 pre-registered?" check at a glance), sortable table (name, email, car, class, status, paid date), CSV export button (client-side blob from the JSON).

**Step 3: Route** — `<Route path="/admin" element={<AdminRegistrations />} />` (inside Layout, not linked in nav).

**Step 4: Verify** — wrong key → 401 UI message; right key → test registrations appear.

**Step 5: Commit**

```bash
git add api/registrations.js src/pages/AdminRegistrations.jsx src/App.jsx
git commit -m "feat: admin registrations dashboard behind ADMIN_KEY"
```

---

### Task 12: QR print assets

**Files:**
- Create: `scripts/generate-qr.mjs`

**Step 1: Script** — uses the `qrcode` package to emit `assets/qr/carshow-qr.svg`, `carshow-qr-1200.png`, `donate-qr.svg`, `donate-qr-1200.png` for `${SITE_URL}/carshow` and `${SITE_URL}/donate`. Until the domain exists, generate with the `*.vercel.app` URL as a placeholder set, regenerate after DNS cutover (flyer print should wait for the real domain — note this in the script output).

**Step 2: Run** — `node scripts/generate-qr.mjs https://<deployment-url>` → 4 files; scan one with a phone to verify.

**Step 3: Commit**

```bash
git add scripts/generate-qr.mjs assets/qr/
git commit -m "feat: QR print asset generator for carshow + donate"
```

---

### Task 13: Deploy to Vercel + production wiring

**Step 1: Push branch, open PR, merge to master** (rebase on Anthony's latest first):

```bash
git pull --rebase origin master
npm run test && npm run build   # full suite green before merge
git push -u origin feat/carshow-platform
gh pr create --fill && gh pr merge --rebase
```

**Step 2: `vercel link` + import the repo in the Vercel dashboard** (or `npx vercel --prod`). Framework preset: Vite.

**Step 3: Set production env vars** (Vercel dashboard or `vercel env add`): all of `.env.example` with real values — Stripe **live** keys only after the user's Stripe account activates; until then test keys.

**Step 4: Stripe webhook endpoint** — Stripe dashboard → add endpoint `https://<prod-url>/api/stripe-webhook` for `checkout.session.completed`; put the signing secret in `STRIPE_WEBHOOK_SECRET`.

**Step 5: End-to-end smoke test in production** with a test-mode key first, then one real $1-configured… **no** — verify with Stripe test mode on a preview deployment, then flip live keys and do ONE real $20 registration (Nick's own card) and refund it from the Stripe dashboard. Confirm: paid row, confirmation email, admin dashboard shows it, refund flips nothing (manual status update — acceptable for now).

**Step 6: When the domain lands** — add it in Vercel, update `SITE_URL`, re-run Task 12 QRs, verify Resend domain + switch `EMAIL_FROM` to `events@<domain>`.

---

## Verification checklist (definition of done)

- [ ] `npm run test` green (schema, templates, reminder logic)
- [ ] Phone-scan QR → signup → Apple Pay test payment → confirmation email, under 2 minutes
- [ ] Reminder cron idempotent (second run sends 0)
- [ ] No "tax" / "deduct" string anywhere in `src/` or `api/` copy: `grep -ri deduct src api` returns nothing
- [ ] Rain date on page + all emails
- [ ] `/admin` shows live count (the Jul 12 trigger check)
- [ ] `registrations` table not readable with the anon key (verify in Supabase API docs panel with anon JWT)
