import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In local dev the Supabase env vars are usually absent. createClient() throws
// when they're missing, which would crash the whole app to a blank page. Guard
// so the site still renders locally; features that need Supabase no-op until the
// env vars are set (they are in production on Vercel).
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
