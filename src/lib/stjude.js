// ─────────────────────────────────────────────────────────────────────────────
// St. Jude fundraising — the ONE place the chapter's donation links and
// year-specific contacts live. The fundraising URL changes every year (it
// used to be hardcoded in six files); update it HERE and the Navbar, Footer,
// homepage, Donate page, registration forms, and Philanthropy all follow.
//
// History:
//   2025–2026  fr_id=162451  → $30,104 raised (final)
//   2026–2027  fr_id=165748  → current
// ─────────────────────────────────────────────────────────────────────────────

export const FUNDRAISING_YEAR = '2026–2027';

// Current-year St. Jude donation page. Gifts go directly to St. Jude (tax
// deductible); donors who provide a mailing address receive an acknowledgment
// letter from St. Jude by mail.
export const ST_JUDE_URL = 'https://fundraising.stjude.org/site/TR?fr_id=165748&pg=entry';
export const ST_JUDE_TAX_URL = 'https://www.stjude.org/about-st-jude/faq/is-my-donation-tax-deductible.html';

// Completed 2025–2026 year, kept for the recap section on /philanthropy.
// Deliberately NO url here — the old fundraising page is closed and must not
// be linked anywhere on the site.
export const LAST_YEAR = { label: '2025–2026', raised: 30104 };

// Year-specific ALSAC/St. Jude staff contact. All questions go through
// Anthony FIRST — the site copy must always route to him before Darryl.
export const ST_JUDE_CONTACT = {
  name: 'Darryl Jones',
  email: 'darryl.jones@alsac.stjude.org',
  office: 'ALSAC / St. Jude — Creve Coeur office',
};

export const CHAPTER_ST_JUDE_CONTACT = {
  name: 'Anthony Fahim',
  email: 'slutkepresident@gmail.com',
  phone: '314-374-5893',
  phoneHref: 'tel:+13143745893',
};
