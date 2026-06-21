# AI Handoff

Status: ready
Owner: none
Branch: `main`
Last-known commit: `c6a2248`

## Latest result

- 2026-06-21: Added the Exotics at the Foundry application workflow, admin decisions, paid sponsorship details, July Potential Sponsor program, news/philanthropy placements, and rotating partner showcase.
- GitHub is authenticated securely as `anthonyfahim50`; clean remotes use GitHub CLI credentials.
- Checks: production build passes, lint passes, 33 tests pass, and both new API files pass Node syntax validation.
- Deployment requires `supabase/migrations/20260621_exotics_car_show.sql` before live applications can be accepted.

## Next action

Verify the GitHub-triggered Vercel deployment and apply the exotics Supabase migration. Never restore a token inside a remote URL.
