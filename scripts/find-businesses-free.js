/**
 * TKE Epsilon Alpha — St. Louis Area Business Finder (FREE / no API key)
 *
 * Goal: a CSV of sponsorship-likely businesses with the contact info the
 * chapter actually needs — phone, email, and (when no email is published)
 * a link to the business's contact page.
 *
 * How it works, all for $0:
 *   1. OpenStreetMap Overpass API  — for each zip, pull businesses tagged with
 *      shop / relevant amenity / office / craft / leisure, plus their
 *      phone, website, and (rarely) email tags. No API key, legal to store.
 *   2. Website scrape (fallback)   — for any business with a website but no
 *      email, fetch the homepage + a "contact" page and look for an email.
 *      If still none, record the contact-page URL instead.
 *
 * Reality check: OSM coverage is volunteer-driven, so it's a strong sample of
 * local businesses, not an exhaustive registry. Many small businesses won't
 * have a website mapped, so some rows will have phone only.
 *
 * USAGE:
 *   node find-businesses-free.js                  # all zips -> businesses-free.csv
 *   node find-businesses-free.js --zips 63105,63108
 *   node find-businesses-free.js --no-scrape      # OSM only, skip email scraping
 *   node find-businesses-free.js --limit 50       # cap businesses (testing)
 *   node find-businesses-free.js --out ../public/businesses.csv
 *
 * Requires Node 18+ (uses built-in fetch). No npm dependencies, no API key.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'TKE-EpsilonAlpha-SponsorProspecting/1.0 (chapter outreach; contact via tkeslu)';

// ---------------------------------------------------------------------------
// Target zip codes (St. Louis MO area + Metro East IL). city used for output.
// ---------------------------------------------------------------------------
const ZIP_CODES = [
  ['63005', 'Chesterfield'], ['63010', 'Arnold'], ['63011', 'Ballwin'],
  ['63017', 'Chesterfield'], ['63021', 'Manchester'], ['63026', 'Fenton'],
  ['63031', 'Florissant'], ['63032', 'Florissant'], ['63033', 'Florissant'],
  ['63034', 'Florissant'], ['63038', 'Ellisville'], ['63040', 'Ellisville'],
  ['63042', 'Hazelwood'], ['63043', 'Maryland Heights'], ['63044', 'Bridgeton'],
  ['63045', 'Earth City'], ['63051', 'House Springs'], ['63074', 'St. Ann'],
  ['63101', 'St. Louis'], ['63102', 'St. Louis'], ['63103', 'St. Louis'],
  ['63104', 'St. Louis'], ['63105', 'Clayton'], ['63106', 'St. Louis'],
  ['63107', 'St. Louis'], ['63108', 'St. Louis'], ['63109', 'St. Louis'],
  ['63110', 'St. Louis'], ['63111', 'St. Louis'], ['63112', 'St. Louis'],
  ['63113', 'St. Louis'], ['63114', 'Overland'], ['63115', 'St. Louis'],
  ['63116', 'St. Louis'], ['63117', 'Richmond Heights'], ['63118', 'St. Louis'],
  ['63119', 'Webster Groves'], ['63120', 'St. Louis'], ['63121', 'Normandy'],
  ['63122', 'Kirkwood'], ['63123', 'Affton'], ['63124', 'Ladue'],
  ['63125', 'Lemay'], ['63126', 'Crestwood'], ['63127', 'Sunset Hills'],
  ['63128', 'Sappington'], ['63129', 'Oakville'], ['63130', 'University City'],
  ['63131', 'Des Peres'], ['63132', 'Olivette'], ['63133', 'Pagedale'],
  ['63134', 'Berkeley'], ['63135', 'Ferguson'], ['63136', 'Jennings'],
  ['63137', 'Bellefontaine Nbrs'], ['63138', 'Spanish Lake'], ['63139', 'St. Louis'],
  ['63141', 'Creve Coeur'], ['63143', 'Maplewood'], ['63144', 'Brentwood'],
  ['63145', 'North County'], ['63146', 'Westport'], ['63147', 'Baden'],
  ['63301', 'St. Charles'], ['63303', 'St. Charles'], ['63366', "O'Fallon"],
  ['63367', 'Lake St. Louis'], ['63376', 'St. Peters'], ['63379', 'Troy'],
  ['63385', 'Wentzville'],
  ['62025', 'Edwardsville, IL'], ['62220', 'Belleville, IL'],
  ['62234', 'Collinsville, IL'], ['62236', 'Columbia, IL'],
];

// Sponsorship-likely amenity values (restaurants/retail/services). Excludes
// schools, hospitals, places of worship, government, etc.
const AMENITY_ALLOW = [
  'restaurant', 'bar', 'cafe', 'pub', 'fast_food', 'food_court', 'ice_cream',
  'biergarten', 'bank', 'pharmacy', 'fuel', 'car_rental', 'car_wash',
  'cinema', 'theatre', 'nightclub', 'marketplace', 'veterinary', 'dentist',
  'bicycle_rental', 'internet_cafe', 'studio',
].join('|');

const LEISURE_ALLOW = ['fitness_centre', 'sports_centre', 'bowling_alley', 'dance', 'escape_game'].join('|');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {
    out: resolve(__dirname, 'businesses-free.csv'),
    zips: null, scrape: true, limit: Infinity,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-scrape') args.scrape = false;
    else if (a === '--out') args.out = resolve(process.cwd(), argv[++i]);
    else if (a === '--zips') args.zips = argv[++i].split(',').map((z) => z.trim());
    else if (a === '--limit') args.limit = parseInt(argv[++i], 10);
  }
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// OpenStreetMap — fetch businesses for one zip
// ---------------------------------------------------------------------------
function overpassQuery(zip) {
  return `[out:json][timeout:90];
(
  nwr["addr:postcode"="${zip}"]["shop"];
  nwr["addr:postcode"="${zip}"]["amenity"~"^(${AMENITY_ALLOW})$"];
  nwr["addr:postcode"="${zip}"]["office"];
  nwr["addr:postcode"="${zip}"]["craft"];
  nwr["addr:postcode"="${zip}"]["leisure"~"^(${LEISURE_ALLOW})$"];
);
out center tags;`;
}

async function fetchZip(zip, attempt = 1) {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
      body: 'data=' + encodeURIComponent(overpassQuery(zip)),
    });
    if (res.status === 429 || res.status === 504) {
      if (attempt <= 3) { await sleep(5000 * attempt); return fetchZip(zip, attempt + 1); }
    }
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    const data = await res.json();
    return data.elements || [];
  } catch (err) {
    if (attempt <= 3) { await sleep(5000 * attempt); return fetchZip(zip, attempt + 1); }
    console.warn(`[TKE] WARN Overpass failed for ${zip}: ${err.message}`);
    return [];
  }
}

function categoryOf(tags) {
  if (tags.shop) return `shop:${tags.shop}`;
  if (tags.amenity) return `amenity:${tags.amenity}`;
  if (tags.craft) return `craft:${tags.craft}`;
  if (tags.office) return `office:${tags.office}`;
  if (tags.leisure) return `leisure:${tags.leisure}`;
  return 'other';
}

function addressOf(tags) {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ');
}

function normalizeUrl(u) {
  if (!u) return '';
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

// ---------------------------------------------------------------------------
// Website scraping — find an email, else a contact page URL
// ---------------------------------------------------------------------------
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const BAD_EMAIL = /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;
const JUNK_DOMAINS = /(example\.|sentry\.|wixpress\.|\.wix\.|godaddy|squarespace\.com|cloudflare|googleapis|gstatic|w3\.org|schema\.org)/i;

// Pull a single clean address out of a raw candidate, dropping any trailing
// HTML/JS/template junk the scrape may have grabbed (e.g. mailto:foo@x.com">..).
const STRICT_EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
function sanitizeEmail(raw) {
  if (!raw || raw.includes('{{') || raw.includes('${') || raw.includes('&#')) return '';
  const m = STRICT_EMAIL.exec(raw);
  if (!m) return '';
  const e = m[0].replace(/\.+$/, '').toLowerCase();
  return e.length >= 5 && e.length <= 80 ? e : '';
}

function extractEmails(html) {
  const found = new Set();
  // Prefer explicit mailto: links.
  const mailtoRe = /mailto:([^"'?\s>]+)/gi;
  let m;
  while ((m = mailtoRe.exec(html))) {
    let raw = m[1];
    try { raw = decodeURIComponent(raw); } catch { /* keep raw */ }
    const e = sanitizeEmail(raw);
    if (e) found.add(e);
  }
  for (const e of html.match(EMAIL_RE) || []) {
    const email = sanitizeEmail(e);
    if (!email || BAD_EMAIL.test(email) || JUNK_DOMAINS.test(email)) continue;
    found.add(email);
  }
  // Rank: prefer info@/contact@/hello@ style mailboxes.
  const list = [...found];
  list.sort((a, b) => score(b) - score(a));
  return list;
}

function score(email) {
  const local = email.split('@')[0];
  if (/^(info|contact|hello|sales|office|admin|hi)$/.test(local)) return 3;
  if (/^(info|contact|hello|sales|office)/.test(local)) return 2;
  return 1;
}

function findContactLink(html, baseUrl) {
  // Find anchor hrefs whose href/text mention contact/about.
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let m;
  const candidates = [];
  while ((m = re.exec(html))) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, ' ').toLowerCase();
    if (/contact/i.test(href) || /contact/.test(text)) candidates.push(href);
    else if (/about/i.test(href) || /about/.test(text)) candidates.push(href);
  }
  if (!candidates.length) return '';
  // Prefer "contact" over "about".
  candidates.sort((a, b) => (/contact/i.test(b) ? 1 : 0) - (/contact/i.test(a) ? 1 : 0));
  try { return new URL(candidates[0], baseUrl).href; } catch { return ''; }
}

async function fetchHtml(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return '';
    return await res.text();
  } catch {
    // Network error / timeout / abort — couldn't reach the site at all.
    // Return null (distinct from '') so callers can avoid caching it and
    // retry on a later resume (e.g. after wifi comes back).
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function scrapeContact(websiteUrl) {
  const home = normalizeUrl(websiteUrl);
  if (!home) return { email: '', contact_page: '' };
  const html = await fetchHtml(home);
  // null = couldn't reach the site (network/timeout). Flag it so it isn't
  // cached and gets retried on resume. '' = reached but unusable (no retry).
  if (html === null) return { email: '', contact_page: '', failed: true };
  if (!html) return { email: '', contact_page: '' };

  let emails = extractEmails(html);
  const contactLink = findContactLink(html, home);

  if (!emails.length && contactLink && contactLink !== home) {
    const chtml = await fetchHtml(contactLink);
    if (chtml) emails = extractEmails(chtml);
  }

  if (emails.length) return { email: emails[0], contact_page: contactLink || home };
  // No email anywhere — hand back the best contact URL we found.
  return { email: '', contact_page: contactLink || home };
}

// Simple concurrency-limited map.
async function mapPool(items, limit, fn, onProgress) {
  const results = new Array(items.length);
  let idx = 0;
  let completed = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i], i);
      completed++;
      if (onProgress && completed % 20 === 0) onProgress(completed, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
function toCsv(rows) {
  const headers = ['name', 'category', 'address', 'zip', 'city', 'phone', 'email', 'website', 'contact_page'];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(','));
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv);
  const zips = args.zips ? ZIP_CODES.filter(([z]) => args.zips.includes(z)) : ZIP_CODES;
  const cityByZip = new Map(ZIP_CODES.map(([z, c]) => [z, c]));

  console.log(`[TKE] Fetching businesses from OpenStreetMap for ${zips.length} zip(s)...`);
  const seen = new Map(); // dedupe by name+address

  for (let i = 0; i < zips.length; i++) {
    const [zip, city] = zips[i];
    const elements = await fetchZip(zip);
    let kept = 0;
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['operator'] || '';
      if (!name) continue; // skip unnamed features
      const phone = tags.phone || tags['contact:phone'] || tags['mobile'] || '';
      const website = tags.website || tags['contact:website'] || tags.url || '';
      const email = tags.email || tags['contact:email'] || '';
      const key = `${name.toLowerCase()}|${tags['addr:street'] || ''}|${zip}`;
      if (seen.has(key)) continue;
      seen.set(key, {
        name,
        category: categoryOf(tags),
        address: addressOf(tags),
        zip,
        city: cityByZip.get(zip) || city,
        phone,
        email,
        website: normalizeUrl(website),
        contact_page: '',
      });
      kept++;
    }
    console.log(`[TKE] ${zip} (${city}): ${kept} businesses · running total ${seen.size}`);
    await sleep(1200); // be polite to the public Overpass instance
  }

  let rows = [...seen.values()];
  if (rows.length > args.limit) rows = rows.slice(0, args.limit);
  console.log(`[TKE] ${rows.length} unique businesses from OSM.`);

  rows.sort((a, b) => a.zip.localeCompare(b.zip) || a.name.localeCompare(b.name));
  const flush = () => writeFileSync(args.out, toCsv(rows));

  // Save the full business list immediately — even if scraping is interrupted,
  // you keep everything OSM gave us (phones, websites, any OSM emails).
  flush();
  console.log(`[TKE] Saved base list to ${args.out}.`);

  if (args.scrape) {
    // Resumable scrape cache keyed by website URL, so a re-run skips work
    // already done instead of starting over.
    const cachePath = args.out.replace(/\.csv$/i, '') + '.scrape-cache.json';
    const cache = existsSync(cachePath)
      ? JSON.parse(readFileSync(cachePath, 'utf8'))
      : {};
    // Apply any cached results to the current rows up front.
    for (const r of rows) {
      if (!r.email && r.website && cache[r.website]) {
        r.email = cache[r.website].email || '';
        r.contact_page = cache[r.website].contact_page || '';
      }
    }

    const toScrape = rows.filter((r) => !r.email && r.website && !cache[r.website]);
    const cachedCount = rows.filter((r) => r.website && cache[r.website]).length;
    console.log(`[TKE] Scraping ${toScrape.length} websites (${cachedCount} already cached)...`);

    let sinceFlush = 0;
    await mapPool(
      toScrape, 6,
      async (r) => {
        const res = await scrapeContact(r.website);
        r.email = res.email;
        r.contact_page = res.contact_page;
        // Only cache real results. Network failures (res.failed) stay
        // uncached so a resume retries them once you're back online.
        if (!res.failed) cache[r.website] = { email: res.email, contact_page: res.contact_page };
        // Checkpoint every 25 completions so a kill never loses much.
        if (++sinceFlush >= 25) {
          sinceFlush = 0;
          flush();
          writeFileSync(cachePath, JSON.stringify(cache));
        }
        return r;
      },
      (done, total) => console.log(`[TKE]   scraped ${done}/${total}`),
    );
    flush();
    writeFileSync(cachePath, JSON.stringify(cache));
    const withEmail = rows.filter((r) => r.email).length;
    console.log(`[TKE] Emails found for ${withEmail}/${rows.length} businesses.`);
  }

  console.log(`[TKE] Done. ${rows.length} businesses written to ${args.out}`);
}

main().catch((err) => {
  console.error('[TKE] Fatal:', err);
  process.exit(1);
});
