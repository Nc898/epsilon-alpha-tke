# Alumni Outreach — Weekly Email

Sends the weekly TKE Epsilon-Alpha alumni email (chapter updates, upcoming
events, support ask) to the mailable alumni roster via [Resend](https://resend.com).

Driven by the **`alumni-outreach`** Claude Code agent (`.claude/agents/alumni-outreach.md`).
Talk to it to draft, preview, test, and send. You teach it the content; it
handles the rest. The pieces below are what it operates.

## One-time setup

1. **Install deps** (already done if `node_modules/` exists):
   ```bash
   cd epsilon-alpha-tke/scripts && npm install
   ```

2. **Set up Resend + sending domain:**
   - **Register a chapter domain first** (~$12/yr) if you don't have one — e.g.
     via Namecheap, Cloudflare, or Porkbun. Pick something durable like
     `tkeslu.org` or `epsilonalpha-tke.org`. You must control the domain's DNS
     to verify it; you **cannot** use `@tke.org` (that's TKE Nationals'). The
     same domain can host the website and send email.
   - Sign up at [resend.com](https://resend.com).
   - **Domains → Add Domain**, enter the domain you'll send from (e.g.
     `tke-ea.org`). Add the shown DNS records (SPF, DKIM, DMARC) at your
     registrar. Verification can take a few minutes to a few hours.
   - **API Keys → Create** → copy the `re_...` key.

3. **Configure `.env`:**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   ```
   RESEND_API_KEY=re_xxxxxxxx
   FROM_EMAIL=TKE Epsilon-Alpha <alumni@yourverifieddomain.org>
   REPLY_TO=alumni@yourverifieddomain.org
   ```
   `FROM_EMAIL` **must** use the domain you verified in Resend.

4. **Generate the contact list** from the OneDrive roster:
   ```bash
   npm run alumni:extract
   ```
   Produces `alumni-contacts.json` (370 mailable alumni). Re-run whenever the
   roster spreadsheet is updated. The raw `.xlsx` stays in OneDrive and is
   never committed.

## Weekly workflow

```bash
cd epsilon-alpha-tke/scripts

# 1. Draft this week's email in email-content/current.md (the agent does this).

# 2. Preview — renders email-content/preview.html, sends nothing:
npm run alumni:preview

# 3. Real test to yourself:
node send-alumni-email.js --test you@email.com

# 4. Send to all mailable alumni:
npm run alumni:send
```

Safety built in:
- No email goes out without `--send` (or `--test`). The bare command is a dry run.
- The same subject line can't be fully sent twice (use `--force` to override).
- `--limit N` sends to only the first N recipients for a staged rollout.

## Website archive (auto)

A full send (`--send`) also publishes the newsletter to the website's **alumni
page** as a published `AlumniUpdate` (category `newsletter`) — so alumni and the
public get a browsable archive. This uses the `BASE44_APP_ID` already in your
`.env`. The card on the alumni page shows the subject as the title and a
plain-text preview of the body.

- Skip the website post for a given send with `--no-archive`.
- Tests (`--test`) never archive.
- If the archive fails, the email still sends; the error is logged.

## Unsubscribes

Add the person's email (lowercase, one per line) to
`email-content/unsubscribed.txt`. The sender skips everyone on that list.
Every email already includes an unsubscribe link + `List-Unsubscribe` header.

## Deliverability notes

- Resend free tier: ~100 emails/day, 3k/month. 370 recipients needs a paid
  plan (~$20/mo) or split across days with `--limit`.
- Verify SPF/DKIM/DMARC before the first real send — it's the difference
  between the inbox and the spam folder.
- Keep sends consistent (same from-address, real reply-to) to build sender
  reputation.

## Optional: true automation (cron)

The agent sends manually by design. If you later want an unattended weekly
send, add a crontab entry (pattern matches `setup-cron.sh`):

```bash
# Mondays at 9 AM Central — drafting still happens beforehand in current.md
0 9 * * 1  cd "/Users/anthonyfahim/TKE - EA/epsilon-alpha-tke/scripts" && /usr/local/bin/node send-alumni-email.js --send >> alumni-send.log 2>&1
```

## Files

| File | Purpose | Committed? |
|------|---------|-----------|
| `extract-alumni.py` | Roster `.xlsx` → `alumni-contacts.json` | yes |
| `send-alumni-email.js` | Renders + sends via Resend | yes |
| `email-content/template.html` | Branded HTML shell | yes |
| `email-content/current.md` | This week's content (subject + body) | yes |
| `email-content/unsubscribed.txt` | Opt-out list | yes |
| `alumni-contacts.json` | Mailable roster (PII) | **no** (gitignored) |
| `email-content/preview.html` | Dry-run preview | **no** |
| `email-content/send-log.json` | Send history | **no** |
| `.env` | Secrets | **no** |
