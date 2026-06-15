/**
 * TKE Epsilon Alpha — Car Show + Gala Sponsor Prospector (FREE / no API key)
 *
 * Same pipeline as find-businesses-free.js, but narrowed to business TYPES that
 * realistically sponsor at the $1,250–$15,000 level and fit the two events:
 *   • Car Show — dealers, auto repair, parts, tires, detailing, fuel, rentals
 *   • Gala     — banks, law/accounting/financial firms, real estate, jewelers,
 *                hotels, country clubs, fine dining, furniture/home
 *   • Both     — insurance, corporate offices, tech/marketing, breweries, bars
 *
 * IMPORTANT: business TYPE is only a proxy for giving capacity — no free data
 * source exposes revenue or donation history. Vet the list before soliciting.
 *
 * Output columns: name, category, event_fit, address, zip, city, phone, email,
 * website, contact_page.  -> sponsors-free.csv
 *
 * USAGE (identical flags to find-businesses-free.js):
 *   node find-sponsors.js
 *   node find-sponsors.js --zips 63105,63108
 *   node find-sponsors.js --no-scrape
 *   node find-sponsors.js --limit 50
 *
 * Requires Node 18+ (built-in fetch). No npm deps, no API key.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'TKE-EpsilonAlpha-SponsorProspecting/1.0 (chapter outreach)';

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

// Targeted Overpass filters — only sponsor-capable types are fetched.
const SHOP = 'car|motorcycle|car_repair|car_parts|tyres|tires|jewelry|watches|furniture|alcohol|wine|trade';
const AMENITY = 'bank|restaurant|fuel|car_rental|car_wash|bar|pub|biergarten';
const OFFICE = 'lawyer|accountant|financial|financial_advisor|estate_agent|insurance|company|it|telecommunication|advertising|engineer|architect|consulting';
const CRAFT = 'brewery|winery|distillery';
const LEISURE = 'golf_course';

// Map an OSM feature to a friendly category + which event it best fits.
function classify(tags) {
  const s = tags.shop, a = tags.amenity, o = tags.office, c = tags.craft;
  if (s) {
    if (s === 'car') return ['Car Dealership', 'Car Show'];
    if (s === 'motorcycle') return ['Motorcycle Dealer', 'Car Show'];
    if (s === 'car_repair') return ['Auto Repair', 'Car Show'];
    if (s === 'car_parts') return ['Auto Parts', 'Car Show'];
    if (s === 'tyres' || s === 'tires') return ['Tire Shop', 'Car Show'];
    if (s === 'jewelry' || s === 'watches') return ['Jeweler', 'Gala'];
    if (s === 'furniture') return ['Furniture & Home', 'Gala'];
    if (s === 'alcohol' || s === 'wine') return ['Liquor / Wine', 'Both'];
    if (s === 'trade') return ['Trade / Wholesale', 'Both'];
  }
  if (a) {
    if (a === 'bank') return ['Bank / Credit Union', 'Gala'];
    if (a === 'restaurant') return ['Restaurant / Catering', 'Both'];
    if (a === 'fuel') return ['Fuel / Convenience', 'Car Show'];
    if (a === 'car_rental') return ['Car Rental', 'Car Show'];
    if (a === 'car_wash') return ['Car Wash / Detail', 'Car Show'];
    if (a === 'bar' || a === 'pub' || a === 'biergarten') return ['Bar / Pub', 'Both'];
  }
  if (o) {
    if (o === 'lawyer') return ['Law Firm', 'Gala'];
    if (o === 'accountant') return ['Accounting Firm', 'Gala'];
    if (o === 'financial' || o === 'financial_advisor') return ['Financial / Wealth Mgmt', 'Gala'];
    if (o === 'estate_agent') return ['Real Estate', 'Gala'];
    if (o === 'insurance') return ['Insurance Agency', 'Both'];
    if (o === 'it' || o === 'telecommunication') return ['Technology / IT', 'Both'];
    if (o === 'advertising') return ['Marketing / Advertising', 'Both'];
    if (o === 'engineer' || o === 'architect' || o === 'consulting') return ['Professional Services', 'Gala'];
    if (o === 'company') return ['Corporate Office', 'Both'];
  }
  if (c) {
    if (c === 'brewery') return ['Brewery', 'Both'];
    if (c === 'winery') return ['Winery', 'Both'];
    if (c === 'distillery') return ['Distillery', 'Both'];
  }
  if (tags.tourism === 'hotel') return ['Hotel / Hospitality', 'Gala'];
  if (tags.leisure === 'golf_course') return ['Country Club / Golf', 'Gala'];
  return null;
}

// --------------------------------------------------------------------------- CLI
function parseArgs(argv) {
  const args = { out: resolve(__dirname, 'sponsors-free.csv'), zips: null, scrape: true, limit: Infinity };
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

function overpassQuery(zip) {
  return `[out:json][timeout:90];
(
  nwr["addr:postcode"="${zip}"]["shop"~"^(${SHOP})$"];
  nwr["addr:postcode"="${zip}"]["amenity"~"^(${AMENITY})$"];
  nwr["addr:postcode"="${zip}"]["office"~"^(${OFFICE})$"];
  nwr["addr:postcode"="${zip}"]["craft"~"^(${CRAFT})$"];
  nwr["addr:postcode"="${zip}"]["tourism"="hotel"];
  nwr["addr:postcode"="${zip}"]["leisure"~"^(${LEISURE})$"];
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
    if ((res.status === 429 || res.status === 504) && attempt <= 3) { await sleep(5000 * attempt); return fetchZip(zip, attempt + 1); }
    if (!res.ok) throw new Error(`Overpass ${res.status}`);
    return (await res.json()).elements || [];
  } catch (err) {
    if (attempt <= 3) { await sleep(5000 * attempt); return fetchZip(zip, attempt + 1); }
    console.warn(`[TKE] WARN Overpass failed for ${zip}: ${err.message}`);
    return [];
  }
}

function addressOf(tags) {
  return [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'], tags['addr:state'], tags['addr:postcode'],
  ].filter(Boolean).join(', ');
}
function normalizeUrl(u) {
  if (!u) return '';
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

// --------------------------------------------------------------------------- Scrape
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const STRICT_EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const BAD_EMAIL = /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i;
const JUNK_DOMAINS = /(example\.|sentry\.|wixpress\.|\.wix\.|godaddy|squarespace\.com|cloudflare|googleapis|gstatic|w3\.org|schema\.org)/i;

function sanitizeEmail(raw) {
  if (!raw || raw.includes('{{') || raw.includes('${') || raw.includes('&#')) return '';
  const m = STRICT_EMAIL.exec(raw);
  if (!m) return '';
  const e = m[0].replace(/\.+$/, '').toLowerCase();
  return e.length >= 5 && e.length <= 80 ? e : '';
}
function extractEmails(html) {
  const found = new Set();
  const mailtoRe = /mailto:([^"'?\s>]+)/gi;
  let m;
  while ((m = mailtoRe.exec(html))) {
    let raw = m[1];
    try { raw = decodeURIComponent(raw); } catch { /* keep */ }
    const e = sanitizeEmail(raw);
    if (e) found.add(e);
  }
  for (const e of html.match(EMAIL_RE) || []) {
    const email = sanitizeEmail(e);
    if (!email || BAD_EMAIL.test(email) || JUNK_DOMAINS.test(email)) continue;
    found.add(email);
  }
  return [...found].sort((a, b) => score(b) - score(a));
}
function score(email) {
  const local = email.split('@')[0];
  if (/^(info|contact|hello|sales|office|admin|hi)$/.test(local)) return 3;
  if (/^(info|contact|hello|sales|office)/.test(local)) return 2;
  return 1;
}
function findContactLink(html, baseUrl) {
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let m; const candidates = [];
  while ((m = re.exec(html))) {
    const href = m[1], text = m[2].replace(/<[^>]+>/g, ' ').toLowerCase();
    if (/contact/i.test(href) || /contact/.test(text)) candidates.push(href);
    else if (/about/i.test(href) || /about/.test(text)) candidates.push(href);
  }
  if (!candidates.length) return '';
  candidates.sort((a, b) => (/contact/i.test(b) ? 1 : 0) - (/contact/i.test(a) ? 1 : 0));
  try { return new URL(candidates[0], baseUrl).href; } catch { return ''; }
}
async function fetchHtml(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, signal: ctrl.signal, redirect: 'follow' });
    if (!res.ok) return '';
    if (!(res.headers.get('content-type') || '').includes('text/html')) return '';
    return await res.text();
  } catch { return null; } finally { clearTimeout(t); }
}
async function scrapeContact(websiteUrl) {
  const home = normalizeUrl(websiteUrl);
  if (!home) return { email: '', contact_page: '' };
  const html = await fetchHtml(home);
  if (html === null) return { email: '', contact_page: '', failed: true };
  if (!html) return { email: '', contact_page: '' };
  let emails = extractEmails(html);
  const contactLink = findContactLink(html, home);
  if (!emails.length && contactLink && contactLink !== home) {
    const chtml = await fetchHtml(contactLink);
    if (chtml) emails = extractEmails(chtml);
  }
  if (emails.length) return { email: emails[0], contact_page: contactLink || home };
  return { email: '', contact_page: contactLink || home };
}
async function mapPool(items, limit, fn, onProgress) {
  let idx = 0, completed = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      await fn(items[i], i);
      if (onProgress && ++completed % 20 === 0) onProgress(completed, items.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

function toCsv(rows) {
  const headers = ['name', 'category', 'event_fit', 'address', 'zip', 'city', 'phone', 'email', 'website', 'contact_page'];
  const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n') + '\n';
}

// --------------------------------------------------------------------------- Main
async function main() {
  const args = parseArgs(process.argv);
  const zips = args.zips ? ZIP_CODES.filter(([z]) => args.zips.includes(z)) : ZIP_CODES;
  const cityByZip = new Map(ZIP_CODES.map(([z, c]) => [z, c]));

  console.log(`[TKE] Fetching sponsor prospects from OpenStreetMap for ${zips.length} zip(s)...`);
  const seen = new Map();
  for (const [zip, city] of zips) {
    const elements = await fetchZip(zip);
    let kept = 0;
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags.operator || '';
      if (!name) continue;
      const cls = classify(tags);
      if (!cls) continue;
      const key = `${name.toLowerCase()}|${tags['addr:street'] || ''}|${zip}`;
      if (seen.has(key)) continue;
      seen.set(key, {
        name, category: cls[0], event_fit: cls[1],
        address: addressOf(tags), zip, city: cityByZip.get(zip) || city,
        phone: tags.phone || tags['contact:phone'] || tags.mobile || '',
        email: tags.email || tags['contact:email'] || '',
        website: normalizeUrl(tags.website || tags['contact:website'] || tags.url || ''),
        contact_page: '',
      });
      kept++;
    }
    console.log(`[TKE] ${zip} (${city}): ${kept} prospects · running total ${seen.size}`);
    // Flush partial results after every zip so a mid-collection stop never
    // wipes the run (collection has no other checkpoint).
    writeFileSync(args.out, toCsv([...seen.values()].sort(
      (a, b) => a.zip.localeCompare(b.zip) || a.name.localeCompare(b.name))));
    await sleep(1200);
  }

  let rows = [...seen.values()];
  if (rows.length > args.limit) rows = rows.slice(0, args.limit);
  rows.sort((a, b) => a.zip.localeCompare(b.zip) || a.name.localeCompare(b.name));
  const flush = () => writeFileSync(args.out, toCsv(rows));
  flush();
  console.log(`[TKE] ${rows.length} sponsor prospects from OSM. Base list saved to ${args.out}.`);

  if (args.scrape) {
    const cachePath = args.out.replace(/\.csv$/i, '') + '.scrape-cache.json';
    const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
    for (const r of rows) {
      if (!r.email && r.website && cache[r.website]) {
        r.email = cache[r.website].email || '';
        r.contact_page = cache[r.website].contact_page || '';
      }
    }
    const toScrape = rows.filter((r) => !r.email && r.website && !cache[r.website]);
    console.log(`[TKE] Scraping ${toScrape.length} websites for emails / contact pages...`);
    let sinceFlush = 0;
    await mapPool(toScrape, 6, async (r) => {
      const res = await scrapeContact(r.website);
      r.email = res.email; r.contact_page = res.contact_page;
      if (!res.failed) cache[r.website] = { email: res.email, contact_page: res.contact_page };
      if (++sinceFlush >= 25) { sinceFlush = 0; flush(); writeFileSync(cachePath, JSON.stringify(cache)); }
    }, (done, total) => console.log(`[TKE]   scraped ${done}/${total}`));
    flush(); writeFileSync(cachePath, JSON.stringify(cache));
    console.log(`[TKE] Emails found for ${rows.filter((r) => r.email).length}/${rows.length} prospects.`);
  }
  console.log(`[TKE] Done. ${rows.length} sponsor prospects written to ${args.out}`);
}

main().catch((err) => { console.error('[TKE] Fatal:', err); process.exit(1); });
