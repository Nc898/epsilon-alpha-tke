/**
 * send-alumni-email.js — Send the weekly TKE Epsilon-Alpha alumni email.
 *
 * Reads the mailable roster (alumni-contacts.json), renders the current
 * newsletter (email-content/current.md) into the branded HTML shell
 * (email-content/template.html), personalizes per recipient, and sends
 * through Resend in batches.
 *
 * SAFETY: defaults to a DRY RUN. You must pass --send to actually deliver.
 *
 * Usage:
 *   node send-alumni-email.js                 # dry run: render + preview only
 *   node send-alumni-email.js --test you@x.com   # send one real test to yourself
 *   node send-alumni-email.js --send          # send to ALL mailable alumni
 *   node send-alumni-email.js --send --limit 50   # send to first 50 (staged)
 *
 * Env (.env):
 *   RESEND_API_KEY   from resend.com/api-keys
 *   FROM_EMAIL       e.g. "TKE Epsilon-Alpha <alumni@yourdomain.org>"
 *   REPLY_TO         (optional) where replies go
 *   UNSUBSCRIBE_URL  (optional) hosted unsubscribe page; falls back to mailto
 *   BASE44_APP_ID    (optional) enables auto-archiving each send to the
 *                    website's alumni page as a published AlumniUpdate.
 *                    Pass --no-archive to skip.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { Resend } from "resend";
import { marked } from "marked";
import matter from "gray-matter";
import { createClient } from "@base44/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "email-content");
const CONTACTS_PATH = path.join(__dirname, "alumni-contacts.json");
const TEMPLATE_PATH = path.join(CONTENT_DIR, "template.html");
const CURRENT_PATH = path.join(CONTENT_DIR, "current.md");
const UNSUB_PATH = path.join(CONTENT_DIR, "unsubscribed.txt");
const LOG_PATH = path.join(CONTENT_DIR, "send-log.json");

const BATCH_SIZE = 100; // Resend batch.send max
const BATCH_DELAY_MS = 1200; // stay under rate limits between batches

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const valOf = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};
const DO_SEND = has("--send");
const TEST_TO = valOf("--test");
const LIMIT = valOf("--limit") ? parseInt(valOf("--limit"), 10) : null;
const NO_ARCHIVE = has("--no-archive");

// ---- helpers ---------------------------------------------------------------
function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function loadUnsubscribed() {
  if (!fs.existsSync(UNSUB_PATH)) return new Set();
  return new Set(
    fs
      .readFileSync(UNSUB_PATH, "utf8")
      .split("\n")
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith("#"))
  );
}

function fillTokens(str, vars) {
  return str.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : ""
  );
}

function renderForRecipient({ template, subject, preheader, bodyMarkdown }, contact, unsubscribeUrl) {
  const firstName = (contact.first_name || "Brother").trim();
  const body = marked.parse(fillTokens(bodyMarkdown, { first_name: firstName, last_name: contact.last_name }));
  const html = fillTokens(template, {
    SUBJECT: subject,
    PREHEADER: preheader || "",
    BODY: body,
    FIRST_NAME: firstName,
    UNSUBSCRIBE_URL: unsubscribeUrl,
    YEAR: new Date().getFullYear(),
  });
  return html;
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Markdown -> readable plain text for the AlumniUpdate.content field
// (the alumni page renders content as text). Drops {{tokens}} too.
function markdownToText(md) {
  return md
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Publish the newsletter to the website's alumni page as a published
// AlumniUpdate (category "newsletter"). No-op if BASE44_APP_ID is unset.
async function archiveToSite(subject, bodyMarkdown) {
  const appId = process.env.BASE44_APP_ID || process.env.VITE_BASE44_APP_ID;
  if (!appId) {
    console.log("• Skipping site archive (BASE44_APP_ID not set).");
    return;
  }
  try {
    const base44 = createClient({ appId, requiresAuth: false, serverUrl: "" });
    const title = subject.replace(/\s*—\s*/g, " — ").trim();
    const existing = await base44.entities.AlumniUpdate.filter({ title, category: "newsletter" });
    const payload = { title, content: markdownToText(bodyMarkdown), category: "newsletter", published: true };
    if (existing && existing.length > 0) {
      await base44.entities.AlumniUpdate.update(existing[0].id, payload);
      console.log(`• Archived to alumni page (updated AlumniUpdate ${existing[0].id}).`);
    } else {
      const created = await base44.entities.AlumniUpdate.create(payload);
      console.log(`• Archived to alumni page (new AlumniUpdate ${created?.id ?? ""}).`);
    }
  } catch (err) {
    console.error(`• Site archive failed (email still sent): ${err.message}`);
  }
}

// ---- main ------------------------------------------------------------------
async function main() {
  for (const p of [CONTACTS_PATH, TEMPLATE_PATH, CURRENT_PATH]) {
    if (!fs.existsSync(p)) die(`Missing required file: ${p}`);
  }

  const FROM = process.env.FROM_EMAIL;
  const REPLY_TO = process.env.REPLY_TO || undefined;
  const API_KEY = process.env.RESEND_API_KEY;

  const { data: contactsFile } = { data: JSON.parse(fs.readFileSync(CONTACTS_PATH, "utf8")) };
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const parsed = matter(fs.readFileSync(CURRENT_PATH, "utf8"));
  const subject = parsed.data.subject;
  const preheader = parsed.data.preheader || "";
  const bodyMarkdown = parsed.content.trim();

  if (!subject) die("current.md is missing a `subject:` in its frontmatter.");
  if (!bodyMarkdown) die("current.md has no body content.");

  // Build recipient list
  const unsubscribed = loadUnsubscribed();
  let recipients = contactsFile.contacts.filter(
    (c) => c.email && !unsubscribed.has(c.email.toLowerCase())
  );

  // Unsubscribe link: hosted page if provided, else a mailto fallback
  const fromAddr = (FROM || "").match(/<([^>]+)>/)?.[1] || FROM || "";
  const mailtoUnsub = `mailto:${fromAddr}?subject=Unsubscribe`;
  const unsubscribeUrl = process.env.UNSUBSCRIBE_URL || mailtoUnsub;

  if (TEST_TO) {
    recipients = [{ first_name: "Test", last_name: "Recipient", email: TEST_TO }];
  } else if (LIMIT) {
    recipients = recipients.slice(0, LIMIT);
  }

  console.log("──────────────────────────────────────────────");
  console.log(`Subject:    ${subject}`);
  console.log(`From:       ${FROM || "(FROM_EMAIL not set)"}`);
  console.log(`Reply-To:   ${REPLY_TO || "(none)"}`);
  console.log(`Recipients: ${recipients.length}` + (TEST_TO ? "  [TEST]" : "") + (LIMIT ? `  [limited]` : ""));
  console.log(`Unsubscribed on file: ${unsubscribed.size}`);
  console.log(`Mode:       ${DO_SEND || TEST_TO ? "LIVE SEND" : "DRY RUN (no email sent)"}`);
  console.log("──────────────────────────────────────────────\n");

  // DRY RUN: render a preview to disk and stop.
  if (!DO_SEND && !TEST_TO) {
    const sample = recipients[0] || { first_name: "Brother", last_name: "", email: "sample@example.com" };
    const previewHtml = renderForRecipient({ template, subject, preheader, bodyMarkdown }, sample, unsubscribeUrl);
    const previewPath = path.join(CONTENT_DIR, "preview.html");
    fs.writeFileSync(previewPath, previewHtml);
    console.log(`Rendered preview for "${sample.first_name} ${sample.last_name}" -> ${previewPath}`);
    console.log("Open it in a browser to review. When ready:");
    console.log("  • test:  node send-alumni-email.js --test you@email.com");
    console.log("  • send:  node send-alumni-email.js --send\n");
    return;
  }

  // LIVE SEND
  if (!API_KEY) die("RESEND_API_KEY is not set in .env");
  if (!FROM) die("FROM_EMAIL is not set in .env");

  // Guard against accidentally re-sending the same campaign to everyone.
  if (DO_SEND && !TEST_TO) {
    const log = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) : [];
    const dup = log.find((e) => e.subject === subject && !e.test);
    if (dup && !has("--force")) {
      die(`A full send with subject "${subject}" already went out on ${dup.sent_at}.\n` +
          `  Change the subject in current.md, or pass --force to send again.`);
    }
  }

  const resend = new Resend(API_KEY);
  const batches = chunk(recipients, BATCH_SIZE);
  let sent = 0;
  const errors = [];

  for (let b = 0; b < batches.length; b++) {
    const payload = batches[b].map((c) => ({
      from: FROM,
      to: c.email,
      reply_to: REPLY_TO,
      subject,
      html: renderForRecipient({ template, subject, preheader, bodyMarkdown }, c, unsubscribeUrl),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));

    try {
      const res = await resend.batch.send(payload);
      if (res.error) throw new Error(JSON.stringify(res.error));
      sent += payload.length;
      console.log(`Batch ${b + 1}/${batches.length}: sent ${payload.length} (total ${sent})`);
    } catch (err) {
      console.error(`Batch ${b + 1} failed: ${err.message}`);
      errors.push({ batch: b + 1, error: err.message, emails: batches[b].map((c) => c.email) });
    }

    if (b < batches.length - 1) await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }

  // Publish to the website's alumni page (full sends only, not tests).
  let archived = false;
  if (DO_SEND && !TEST_TO && !NO_ARCHIVE && sent > 0) {
    await archiveToSite(subject, bodyMarkdown);
    archived = true;
  }

  // Append to send log
  const log = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) : [];
  log.push({
    sent_at: new Date().toISOString(),
    subject,
    recipients: sent,
    test: Boolean(TEST_TO),
    archived_to_site: archived,
    errors: errors.length ? errors : undefined,
  });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

  console.log(`\n✓ Done. Delivered ${sent}/${recipients.length}.` + (errors.length ? `  ${errors.length} batch error(s) — see send-log.json.` : ""));
}

main().catch((e) => die(e.stack || e.message));
