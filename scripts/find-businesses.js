/**
 * TKE Epsilon Alpha — St. Louis Area Business Finder
 *
 * Builds a CSV "database" of sponsorship-likely businesses across the
 * St. Louis / Metro East zip codes, using the Google Places API (New).
 *
 * For each (zip, category) pair it runs a Text Search ("<category> in <zip>"),
 * paginates to the 60-result max, dedupes by place ID across the whole run,
 * and keeps only results whose postal code actually matches the target zip.
 *
 * SETUP (one-time):
 *   1. cd scripts && npm install
 *   2. Create a Google Cloud project, enable "Places API (New)", and make an
 *      API key with billing enabled. (console.cloud.google.com)
 *   3. Copy .env.example to .env and set GOOGLE_PLACES_API_KEY=<your-key>
 *
 * USAGE:
 *   node find-businesses.js --estimate     # cost/request estimate, no API calls
 *   node find-businesses.js                 # full run -> businesses.csv
 *   node find-businesses.js --zips 63105,63108   # limit to specific zips
 *   node find-businesses.js --out ../public/businesses.csv
 *
 * Heads up on cost: Google Places Text Search is a paid SKU (~$32 per 1000
 * requests as of early 2026, plus contact-data fields). A full run over every
 * zip and category can be a few thousand requests. Run --estimate first.
 */

import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

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

// ---------------------------------------------------------------------------
// Sponsorship-likely categories. `query` is the search term; `type` (optional)
// narrows results via Google's includedType. Government, schools, hospitals,
// and residential are intentionally excluded.
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { label: 'Restaurant', query: 'restaurants', type: 'restaurant' },
  { label: 'Bar', query: 'bars', type: 'bar' },
  { label: 'Cafe / Coffee', query: 'coffee shops', type: 'cafe' },
  { label: 'Bakery', query: 'bakeries', type: 'bakery' },
  { label: 'Pizza', query: 'pizza restaurants', type: 'restaurant' },
  { label: 'Brewery', query: 'breweries' },
  { label: 'Liquor Store', query: 'liquor stores', type: 'liquor_store' },
  { label: 'Retail Store', query: 'shops', type: 'store' },
  { label: 'Clothing Store', query: 'clothing stores', type: 'clothing_store' },
  { label: 'Grocery', query: 'grocery stores', type: 'supermarket' },
  { label: 'Hair / Barber', query: 'hair salons and barbers', type: 'hair_care' },
  { label: 'Beauty / Spa', query: 'beauty salons and spas', type: 'beauty_salon' },
  { label: 'Gym / Fitness', query: 'gyms and fitness studios', type: 'gym' },
  { label: 'Auto Repair', query: 'auto repair shops', type: 'car_repair' },
  { label: 'Car Dealer', query: 'car dealerships', type: 'car_dealer' },
  { label: 'Florist', query: 'florists', type: 'florist' },
  { label: 'Print / Signs', query: 'print and sign shops' },
  { label: 'Real Estate', query: 'real estate agencies', type: 'real_estate_agency' },
  { label: 'Insurance', query: 'insurance agencies', type: 'insurance_agency' },
  { label: 'Bank / Credit Union', query: 'banks and credit unions', type: 'bank' },
  { label: 'Pharmacy', query: 'pharmacies', type: 'pharmacy' },
  { label: 'Hardware / Home', query: 'hardware stores', type: 'hardware_store' },
  { label: 'Electronics', query: 'electronics stores', type: 'electronics_store' },
  { label: 'Pet Store', query: 'pet stores', type: 'pet_store' },
  { label: 'Catering / Events', query: 'catering and event venues' },
];

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.primaryTypeDisplayName',
  'places.rating',
  'places.userRatingCount',
  'places.businessStatus',
  'places.location',
  'nextPageToken',
].join(',');

const MAX_PAGES = 3; // Google caps Text Search at 60 results (3 x 20).
const PAGE_DELAY_MS = 2500; // nextPageToken needs a short delay to activate.
const QUERY_DELAY_MS = 200; // gentle pacing between distinct queries.

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { estimate: false, out: resolve(__dirname, 'businesses.csv'), zips: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--estimate' || a === '--dry-run') args.estimate = true;
    else if (a === '--out') args.out = resolve(process.cwd(), argv[++i]);
    else if (a === '--zips') args.zips = argv[++i].split(',').map((z) => z.trim());
  }
  return args;
}

function getZipCity(targetZips) {
  if (!targetZips) return ZIP_CODES;
  const set = new Set(targetZips);
  return ZIP_CODES.filter(([z]) => set.has(z));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function postalOf(place) {
  const comp = (place.addressComponents || []).find((c) =>
    (c.types || []).includes('postal_code'),
  );
  return comp ? comp.longText || comp.shortText : '';
}

async function textSearch(textQuery, includedType, pageToken) {
  const body = { textQuery, pageSize: 20, regionCode: 'US' };
  if (includedType) body.includedType = includedType;
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    // Rate limited — back off and retry once.
    await sleep(3000);
    return textSearch(textQuery, includedType, pageToken);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places API ${res.status}: ${text}`);
  }
  return res.json();
}

function toCsv(rows) {
  const headers = [
    'name', 'category', 'address', 'zip', 'city', 'phone', 'website',
    'rating', 'review_count', 'status', 'lat', 'lng', 'place_id',
  ];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => esc(r[h])).join(','));
  }
  return lines.join('\n') + '\n';
}

async function main() {
  const args = parseArgs(process.argv);
  const zips = getZipCity(args.zips);
  const totalQueries = zips.length * CATEGORIES.length;

  console.log(`[TKE] Zips: ${zips.length}  Categories: ${CATEGORIES.length}`);
  console.log(`[TKE] Distinct (zip x category) queries: ${totalQueries}`);
  console.log(`[TKE] Worst-case API requests (x${MAX_PAGES} pages): ${totalQueries * MAX_PAGES}`);

  if (args.estimate) {
    // Text Search (Enterprise w/ contact fields) ~ $35 / 1000 requests.
    const lo = (totalQueries * 35) / 1000;
    const hi = (totalQueries * MAX_PAGES * 35) / 1000;
    console.log(`[TKE] Rough cost estimate: $${lo.toFixed(2)} (1 page each) to $${hi.toFixed(2)} (full pagination).`);
    console.log('[TKE] Estimate only — no API calls made. Remove --estimate to run for real.');
    return;
  }

  if (!API_KEY) {
    console.error('[TKE] ERROR: GOOGLE_PLACES_API_KEY is not set.');
    console.error('  → Create scripts/.env with GOOGLE_PLACES_API_KEY=<your-key>');
    console.error('  → Enable "Places API (New)" + billing in Google Cloud Console.');
    process.exit(1);
  }

  const targetZipSet = new Set(zips.map(([z]) => z));
  const cityByZip = new Map(zips.map(([z, c]) => [z, c]));
  const seen = new Map(); // place_id -> row
  let done = 0;

  for (const [zip, city] of zips) {
    for (const cat of CATEGORIES) {
      done++;
      const q = `${cat.query} in ${zip}`;
      try {
        let pageToken;
        for (let page = 0; page < MAX_PAGES; page++) {
          const data = await textSearch(q, cat.type, pageToken);
          const places = data.places || [];
          for (const p of places) {
            const pzip = postalOf(p);
            // Keep only results actually inside one of our target zips.
            if (!targetZipSet.has(pzip)) continue;
            if (seen.has(p.id)) continue;
            seen.set(p.id, {
              name: p.displayName?.text || '',
              category: cat.label,
              address: p.formattedAddress || '',
              zip: pzip,
              city: cityByZip.get(pzip) || city,
              phone: p.nationalPhoneNumber || '',
              website: p.websiteUri || '',
              rating: p.rating ?? '',
              review_count: p.userRatingCount ?? '',
              status: p.businessStatus || '',
              lat: p.location?.latitude ?? '',
              lng: p.location?.longitude ?? '',
              place_id: p.id,
            });
          }
          pageToken = data.nextPageToken;
          if (!pageToken) break;
          await sleep(PAGE_DELAY_MS);
        }
      } catch (err) {
        console.warn(`[TKE] WARN query failed: "${q}" — ${err.message}`);
      }
      if (done % 25 === 0 || done === totalQueries) {
        console.log(`[TKE] ${done}/${totalQueries} queries · ${seen.size} unique businesses so far`);
      }
      await sleep(QUERY_DELAY_MS);
    }
  }

  const rows = [...seen.values()].sort(
    (a, b) => a.zip.localeCompare(b.zip) || a.name.localeCompare(b.name),
  );
  writeFileSync(args.out, toCsv(rows));
  console.log(`[TKE] Done. ${rows.length} unique businesses written to ${args.out}`);
}

main().catch((err) => {
  console.error('[TKE] Fatal:', err);
  process.exit(1);
});
