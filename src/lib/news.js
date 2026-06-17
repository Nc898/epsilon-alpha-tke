import { Flag } from 'lucide-react';

// Chapter news — newest first. Append new items here; they appear in both the
// slide-out NewsDrawer (a teaser) and the dedicated /news page (the full list).
export const NEWS_ITEMS = [
  {
    id: 'carshow-2026',
    icon: Flag,
    tag: 'Registration Open',
    title: 'TKE for St. Jude Car Show — Foundry Classics',
    body: "Sunday, July 26 at City Foundry STL. $20 entry benefits St. Jude Children's Research Hospital. Rain or shine — rain date August 2.",
    cta: { label: 'Sign Up Your Car', to: '/carshow' },
  },
];
