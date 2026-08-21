// St. Jude links moved to src/lib/stjude.js (they were never exotics-specific
// — the whole site uses them). Re-exported here so the unrouted ExoticsCarShow
// page keeps compiling; new code should import from '@/lib/stjude' directly.
export { ST_JUDE_URL, ST_JUDE_TAX_URL } from './stjude.js';

export const EXOTICS_SHOW = {
  name: 'Friday Night Lights',
  slug: 'exotics-car-show-2026',
  dateISO: '2026-09-04',
  dateLabel: 'Friday, September 4, 2026',
  hoursLabel: '5:00–7:00 PM',
  arrivalLabel: 'Arrival instructions sent after approval',
  capacity: 30,
  venue: 'City Foundry STL',
  meetingSpot: 'City Foundry STL',
  beneficiary: "St. Jude Children's Research Hospital",
  suggestedDonation: 30,
  image: '/assets/photos/q17.webp',
  contactName: 'Anthony Fahim',
  contactPhone: '314-374-5893',
  contactPhoneHref: 'tel:+13143745893',
  contactEmail: 'slutkestewardship@gmail.com',
};
