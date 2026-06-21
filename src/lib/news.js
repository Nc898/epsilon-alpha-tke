import { Flag } from 'lucide-react';

// Chapter news — newest first. Append new items here; they appear in both the
// slide-out NewsDrawer (a teaser) and the dedicated /news page (the full list).
export const NEWS_ITEMS = [
  {
    id: 'carshow-2026',
    icon: Flag,
    tag: 'Registration Open',
    title: 'TKE for St. Jude Car Show — Foundry Classics',
    body: "Sunday, July 26 at City Foundry STL. Entry is $30 for all vehicles and benefits St. Jude Children's Research Hospital. There is no rain date — this is a rain-or-shine car show and will proceed in the rain unless severe weather requires TKE and City Foundry STL to postpone or cancel the event.",
    cta: { label: 'Sign Up Your Car', to: '/carshow' },
  },
];
