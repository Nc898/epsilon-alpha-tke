// ─────────────────────────────────────────────────────────────────────────────
// Base44 has been retired. Auth and data now run on Supabase (see
// src/lib/supabaseClient.js), and the content pages that used to read Base44
// entities fall back to their built-in defaults.
//
// This module used to construct a live @base44/sdk client, which auto-fired an
// auth `me()` call and an analytics batch against /api/apps/<appId>/... on every
// page load — 404s in the console because no Base44 backend is configured.
//
// It is now a local no-op stub with the same shape the old call sites expect, so
// nothing has to be rewired at once: entity reads resolve empty, and the dead
// auth flows reject with a clear message. No network requests are made.
// ─────────────────────────────────────────────────────────────────────────────

const RETIRED = 'This feature has been retired.';
const rejectRetired = () => Promise.reject(new Error(RETIRED));
const noop = () => {};

// Any base44.entities.<Name>.<method>() resolves to an empty result.
const entityStub = {
  list: () => Promise.resolve([]),
  filter: () => Promise.resolve([]),
  get: () => Promise.resolve(null),
  create: rejectRetired,
  update: rejectRetired,
  delete: rejectRetired,
};

export const base44 = {
  auth: {
    me: rejectRetired,            // treated as "not authenticated" by callers
    logout: noop,
    redirectToLogin: noop,
    loginViaEmailPassword: rejectRetired,
    loginWithProvider: noop,
    register: rejectRetired,
    verifyOtp: rejectRetired,
    resendOtp: rejectRetired,
    setToken: noop,
    resetPassword: rejectRetired,
    resetPasswordRequest: rejectRetired,
  },
  entities: new Proxy({}, { get: () => entityStub }),
};
