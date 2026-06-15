#!/usr/bin/env python3
"""
extract-alumni.py — Turn the chapter alumni roster (.xlsx) into a clean
alumni-contacts.json that the email agent / send script consumes.

Source spreadsheet lives in OneDrive (outside the repo) so the raw PII
roster is never committed. Point ALUMNI_XLSX at it (or pass a path arg).

Usage:
    python3 extract-alumni.py [path/to/roster.xlsx]

Env (optional):
    ALUMNI_XLSX   absolute path to the source .xlsx

Output:
    alumni-contacts.json   — only living members with a valid email,
                             deduped by lowercased email.
"""
import json
import os
import re
import sys
from datetime import datetime

import openpyxl

DEFAULT_XLSX = os.path.expanduser(
    "~/Library/CloudStorage/OneDrive-SaintLouisUniversity/Epsilon-Alpha, Nov2023.xlsx"
)
OUT_PATH = os.path.join(os.path.dirname(__file__), "alumni-contacts.json")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def col_index(header, *names):
    for n in names:
        if n in header:
            return header.index(n)
    return None


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("ALUMNI_XLSX", DEFAULT_XLSX)
    if not os.path.exists(src):
        sys.exit(f"Source spreadsheet not found: {src}\n"
                 f"Pass the path as an argument or set ALUMNI_XLSX.")

    wb = openpyxl.load_workbook(src, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    header = list(rows[0])

    i_first = col_index(header, "Pref First Name", "First Name")
    i_first_legal = col_index(header, "First Name")
    i_last = col_index(header, "Last Name")
    i_email = col_index(header, "EmailAddress", "Email Address", "Email")
    i_grad = col_index(header, "Grad Date")
    i_scroll = col_index(header, "Scroll Number")
    i_pid = col_index(header, "Person ID")
    i_death = col_index(header, "Death Date")
    i_death_notif = col_index(header, "Death Notification On")

    seen = set()
    contacts = []
    skipped_no_email = 0
    skipped_deceased = 0

    for r in rows[1:]:
        email = (str(r[i_email]).strip() if i_email is not None and r[i_email] else "")
        if not email or not EMAIL_RE.match(email):
            skipped_no_email += 1
            continue
        if (i_death is not None and r[i_death]) or (i_death_notif is not None and r[i_death_notif]):
            skipped_deceased += 1
            continue

        key = email.lower()
        if key in seen:
            continue
        seen.add(key)

        grad = r[i_grad] if i_grad is not None else None
        grad_year = grad.year if isinstance(grad, datetime) else None

        first = (r[i_first] or (r[i_first_legal] if i_first_legal is not None else None) or "").strip()
        last = (r[i_last] or "").strip() if i_last is not None else ""

        contacts.append({
            "person_id": r[i_pid] if i_pid is not None else None,
            "first_name": first,
            "last_name": last,
            "email": email,
            "grad_year": grad_year,
            "scroll_number": r[i_scroll] if i_scroll is not None else None,
        })

    contacts.sort(key=lambda c: (c["last_name"].lower(), c["first_name"].lower()))

    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source": os.path.basename(src),
        "count": len(contacts),
        "contacts": contacts,
    }
    with open(OUT_PATH, "w") as f:
        json.dump(payload, f, indent=2)

    print(f"Wrote {len(contacts)} mailable contacts -> {OUT_PATH}")
    print(f"  skipped (no/invalid email): {skipped_no_email}")
    print(f"  skipped (deceased):         {skipped_deceased}")


if __name__ == "__main__":
    main()
