/**
 * TKE St. Jude Fundraising Stats Updater
 *
 * Scrapes the TKE St. Louis University fundraising page on St. Jude's site,
 * then writes the live totals into the Base44 FundraisingStats entity so
 * the chapter website reflects accurate numbers.
 *
 * SETUP (one-time):
 *   1. cd scripts && npm install
 *   2. Copy .env.example to .env and fill in BASE44_APP_ID
 *      (find it in your Base44 dashboard → Settings → App ID)
 *   3. Run: node update-fundraising.js
 *   4. Run: bash setup-cron.sh  (schedules 8am / 12pm / 6pm CT daily)
 */

import 'dotenv/config';
import puppeteer from 'puppeteer';
import { createClient } from '@base44/sdk';

const ST_JUDE_URL = 'https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry';
const APP_ID = process.env.BASE44_APP_ID || process.env.VITE_BASE44_APP_ID;

if (!APP_ID) {
  console.error('[TKE] ERROR: BASE44_APP_ID is not set.');
  console.error('  → Create scripts/.env with BASE44_APP_ID=<your-app-id>');
  console.error('  → Find your App ID in the Base44 dashboard under Settings.');
  process.exit(1);
}

const base44 = createClient({ appId: APP_ID, requiresAuth: false, serverUrl: '' });

// ─── Scraper ────────────────────────────────────────────────────────────────

async function scrapeStJude() {
  console.log('[TKE] Launching browser…');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log(`[TKE] Navigating to ${ST_JUDE_URL}`);
  await page.goto(ST_JUDE_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Give any lazy-loaded JS widgets extra time to settle
  await new Promise(r => setTimeout(r, 3000));

  const result = await page.evaluate(() => {
    // ── Strategy 1: common Convio/Blackbaud TeamRaiser selectors ──
    const selectors = [
      '#thermAmountRaised',
      '.thermAmountRaised',
      '#fundraiser-amount-raised',
      '.fundraiser-amount-raised',
      '[class*="amount-raised"]',
      '[class*="amountRaised"]',
      '[class*="raised-amount"]',
      '[data-raised]',
      '.tr-thermometer .amount',
      '#trThermAmt',
      '.thermometer-amount',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const raw = el.dataset.raised || el.textContent || '';
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) return { amount: num, selector: sel };
      }
    }

    // ── Strategy 2: scan all text nodes for a dollar amount ──
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const amountPattern = /\$\s?([\d,]+(?:\.\d{2})?)/g;
    const candidates = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      let m;
      while ((m = amountPattern.exec(text)) !== null) {
        const num = parseFloat(m[1].replace(/,/g, ''));
        if (num > 100) candidates.push(num);
      }
    }
    if (candidates.length > 0) {
      // Take the largest amount found — likely the total raised
      candidates.sort((a, b) => b - a);
      return { amount: candidates[0], selector: 'text-scan', candidates };
    }

    return null;
  });

  // ── Donor count ──
  const donorResult = await page.evaluate(() => {
    const selectors = [
      '#donorCount', '.donorCount', '[class*="donor-count"]',
      '[class*="donorCount"]', '#totalDonors', '.total-donors',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const num = parseInt(el.textContent.replace(/\D/g, ''), 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return null;
  });

  await browser.close();

  if (!result) {
    throw new Error('Could not find fundraising amount on the St. Jude page. The page layout may have changed.');
  }

  console.log(`[TKE] Scraped: $${result.amount.toLocaleString()} via "${result.selector}"`);
  if (donorResult) console.log(`[TKE] Donors: ${donorResult}`);

  return {
    amount_raised: result.amount,
    donor_count: donorResult || 0,
  };
}

// ─── Base44 Update ──────────────────────────────────────────────────────────

async function updateBase44(scraped) {
  const now = new Date().toISOString();
  const payload = {
    amount_raised: scraped.amount_raised,
    donor_count: scraped.donor_count,
    goal: 50000,
    last_updated: now,
  };

  console.log('[TKE] Connecting to Base44…');
  const existing = await base44.entities.FundraisingStats.list();

  if (existing && existing.length > 0) {
    const id = existing[0].id;
    await base44.entities.FundraisingStats.update(id, payload);
    console.log(`[TKE] Updated FundraisingStats record (id: ${id})`);
  } else {
    await base44.entities.FundraisingStats.create(payload);
    console.log('[TKE] Created new FundraisingStats record');
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

(async () => {
  const start = Date.now();
  try {
    const scraped = await scrapeStJude();
    await updateBase44(scraped);
    console.log(`[TKE] Done in ${((Date.now() - start) / 1000).toFixed(1)}s ✓`);
  } catch (err) {
    console.error('[TKE] FAILED:', err.message);
    process.exit(1);
  }
})();
