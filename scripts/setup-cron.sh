#!/usr/bin/env bash
# Sets up a crontab to run the St. Jude fundraising scraper 3× daily in Central Time.
# Runs at 8:00 AM, 12:00 PM, and 6:00 PM CT (handles DST automatically via TZ=America/Chicago).
#
# Usage: bash setup-cron.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BIN="$(which node)"

if [ -z "$NODE_BIN" ]; then
  echo "ERROR: node not found on PATH. Install Node.js first."
  exit 1
fi

CRON_CMD="cd \"$SCRIPT_DIR\" && $NODE_BIN update-fundraising.js >> /tmp/tke-fundraising.log 2>&1"

# Build the three cron entries with the Chicago timezone
NEW_CRONS=$(cat <<EOF
TZ=America/Chicago
0 8 * * * $CRON_CMD
0 12 * * * $CRON_CMD
0 18 * * * $CRON_CMD
EOF
)

# Preserve existing crontab entries (skip any previous TKE entries to avoid duplicates)
EXISTING=$(crontab -l 2>/dev/null | grep -v "tke-fundraising\|update-fundraising\|TZ=America/Chicago")

# Write merged crontab
(echo "$EXISTING"; echo ""; echo "# TKE St. Jude fundraising stats — 8am / 12pm / 6pm CT"; echo "$NEW_CRONS") | crontab -

echo "✓ Cron jobs installed. Schedule:"
echo "  8:00 AM CT  — morning update"
echo "  12:00 PM CT — midday update"
echo "  6:00 PM CT  — evening update"
echo ""
echo "Logs → /tmp/tke-fundraising.log"
echo ""
echo "To verify: crontab -l"
echo "To remove: crontab -e  (delete the TKE lines)"
