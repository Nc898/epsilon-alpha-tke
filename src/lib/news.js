import { Flag } from 'lucide-react';

// Chapter news — newest first. Append new items here; they appear in both the
// slide-out NewsDrawer (a teaser) and the dedicated /news page (the full list).
export const NEWS_ITEMS = [
  {
    id: 'exotics-car-show-2026',
    icon: Flag,
    tag: 'Applications Open',
    title: 'Exotics at the Foundry — 30-Car Showcase',
    body: "Friday, August 28 from 5:30–7:30 PM at City Foundry STL. Complimentary applications are open for a curated field of 30 exotic vehicles, with check-in at Colibri Real Estate from 5:00–5:30 PM. Cars will be protected by stanchions throughout the show. A $30 donation to St. Jude is encouraged but never required.",
    cta: { label: 'Apply to Display', to: '/exotics-car-show' },
  },
  {
    id: 'carshow-2026',
    icon: Flag,
    tag: 'Registration Open',
    title: 'TKE for St. Jude Car Show — Foundry Classics',
    body: "Sunday, July 26 at City Foundry STL. Entry is $30 for all vehicles and benefits St. Jude Children's Research Hospital. There is no rain date — this is a rain-or-shine car show and will proceed in the rain unless severe weather requires TKE and City Foundry STL to postpone or cancel the event.",
    cta: { label: 'Sign Up Your Car', to: '/carshow' },
  },
];
