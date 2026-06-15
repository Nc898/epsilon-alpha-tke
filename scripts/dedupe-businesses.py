#!/usr/bin/env python3
"""Remove businesses that are in the sponsor list from the businesses list, so
the two outreach lists don't overlap (sponsors file wins)."""
import csv, re

SPONSORS = "sponsors-free.csv"
BUSINESSES = "businesses-free.csv"
OUT = "businesses-unique.csv"

def norm(s):
    return re.sub(r'[^a-z0-9]', '', (s or "").lower())

def key(row):
    street = (row.get("address") or "").split(",")[0]
    return f"{norm(row.get('name'))}|{norm(street)}|{(row.get('zip') or '').strip()}"

with open(SPONSORS, newline="", encoding="utf-8") as f:
    sponsor_keys = {key(r) for r in csv.DictReader(f)}

with open(BUSINESSES, newline="", encoding="utf-8") as f:
    biz = list(csv.DictReader(f))
    fields = biz[0].keys() if biz else []

unique = [r for r in biz if key(r) not in sponsor_keys]
removed = len(biz) - len(unique)

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(fields))
    w.writeheader(); w.writerows(unique)

print(f"businesses total : {len(biz)}")
print(f"moved to sponsors: {removed}")
print(f"unique businesses: {len(unique)}  -> {OUT}")
