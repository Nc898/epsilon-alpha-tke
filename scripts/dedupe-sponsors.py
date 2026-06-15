#!/usr/bin/env python3
"""Remove sponsor prospects that already appear in the businesses list, so the
two outreach lists don't overlap (businesses file wins)."""
import csv, re, sys

BUSINESSES = "businesses-free.csv"
SPONSORS = "sponsors-free.csv"
OUT = "sponsors-unique.csv"

def norm(s):
    return re.sub(r'[^a-z0-9]', '', (s or "").lower())

def key(row):
    street = (row.get("address") or "").split(",")[0]
    return f"{norm(row.get('name'))}|{norm(street)}|{(row.get('zip') or '').strip()}"

with open(BUSINESSES, newline="", encoding="utf-8") as f:
    biz_keys = {key(r) for r in csv.DictReader(f)}

with open(SPONSORS, newline="", encoding="utf-8") as f:
    sponsors = list(csv.DictReader(f))
    fields = sponsors[0].keys() if sponsors else []

unique = [r for r in sponsors if key(r) not in biz_keys]
removed = len(sponsors) - len(unique)

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(fields))
    w.writeheader(); w.writerows(unique)

print(f"sponsors total : {len(sponsors)}")
print(f"overlap removed: {removed}")
print(f"unique sponsors: {len(unique)}  -> {OUT}")
