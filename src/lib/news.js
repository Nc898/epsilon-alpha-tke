import { Flag } from 'lucide-react';

// Chapter news — newest first. Append new items here; they appear in both the
// slide-out NewsDrawer (a teaser) and the dedicated /news page (the full list).
export const NEWS_ITEMS = [
  {
    id: 'halloween-car-show-2026',
    icon: Flag,
    tag: 'Registration Open',
    title: 'Halloween Car Show at Neiman Marcus — October 25',
    body: "The 2026 series finale: Sunday, October 25 at Neiman Marcus, Plaza Frontenac. Sponsor vehicles load in at 9:30 AM, general registrations at 10:00 AM, and the show begins at 11:00 AM. Entry is $30 per vehicle, benefiting St. Jude. Car clubs and sponsors can request a custom registration link to invite their members and customers — and sponsor links earn $30 off the sponsor's event package per registered car, on request.",
    cta: { label: 'Register Your Car', to: '/carshow' },
  },
  {
    id: 'car-show-series-2026',
    icon: Flag,
    tag: 'Three-Show Series',
    title: 'TKE Is Back — Three Charity Car Shows for St. Jude',
    body: "The 2026 series began with the All-Classics & Imports Car Show on July 26, continued with the 30-car Friday Night Lights exotics showcase on September 4, and concludes with the Halloween Car Show at Neiman Marcus on October 25. Official Car Show Sponsors receive recognition across all three events, plus an Instagram and website spotlight.",
    cta: { label: 'Explore the Series', to: '/philanthropy' },
  },
  {
    id: 'exotics-car-show-2026',
    icon: Flag,
    tag: 'Applications Open',
    title: 'Friday Night Lights — 30-Car Exotics Showcase',
    body: "Friday, September 4 from 5:00–7:00 PM at City Foundry STL. Entry is free, registration is required, and the exotics-only field is capped at 30 vehicles. Apply online or contact Anthony Fahim at 314-374-5893.",
    cta: { label: 'Apply to Display', to: '/exotics-car-show' },
  },
  // ── HIDDEN — July 26 registration item, archived 2026-07-30 (event has
  //    passed; its CTA pointed at the now-removed /carshow route). Restore
  //    with the App.jsx HIDDEN block.
  // {
  //   id: 'carshow-2026',
  //   icon: Flag,
  //   tag: 'Registration Open',
  //   title: 'All-Classics & Imports Car Show — July 26',
  //   body: "Sunday, July 26 from 11:00 AM–2:00 PM at City Foundry STL. Entry is $30 per vehicle, and TKE is insured for the event. Every registered vehicle owner is recognized as a Participating Event Sponsor/Supporter. Official Sponsors receive recognition across all three shows.",
  //   cta: { label: 'Sign Up Your Car', to: '/carshow' },
  // },
];
