import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';

// Route-level code splitting: each page is its own chunk so the initial bundle
// no longer ships every page (admin, gallery, 3D/maps, Stripe, etc.) up front.
const Home = lazy(() => import('./pages/Home'));
const HomeNext = lazy(() => import('./pages/HomeNext'));
const Philanthropy = lazy(() => import('./pages/Philanthropy'));
const Alumni = lazy(() => import('./pages/Alumni'));
const Recruitment = lazy(() => import('./pages/Recruitment'));
const ChapterCalendar = lazy(() => import('./pages/ChapterCalendar'));
const Contact = lazy(() => import('./pages/Contact'));
const News = lazy(() => import('./pages/News'));
const MemberDirectory = lazy(() => import('./pages/MemberDirectory'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EventSignup = lazy(() => import('./pages/EventSignup'));
// HIDDEN — July 26 car show, archived 2026-07-30 (see routes below).
// const FreeCarShowSignup = lazy(() => import('./pages/FreeCarShowSignup'));
// const CarShow = lazy(() => import('./pages/CarShow'));
// SponsorCarShowSignup + /carshow now serve the OCTOBER show (halloweenShow.js).
const SponsorCarShowSignup = lazy(() => import('./pages/SponsorCarShowSignup'));
const HalloweenCarShow = lazy(() => import('./pages/HalloweenCarShow'));
const ExoticsCarShow = lazy(() => import('./pages/ExoticsCarShow'));
const Donate = lazy(() => import('./pages/Donate'));
const AdminRegistrations = lazy(() => import('./pages/AdminRegistrations'));
const Gallery = lazy(() => import('./pages/Gallery'));
const GalleryAlbum = lazy(() => import('./pages/GalleryAlbum'));
const AdminGallery = lazy(() => import('./pages/AdminGallery'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[hsl(0,0%,5%)]">
    <div className="w-8 h-8 border-4 border-slate-200/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { authError, navigateToLogin } = useAuth();

  // NOTE: deliberately NOT gated on isLoadingPublicSettings/isLoadingAuth.
  // Every route here is public, so holding the whole site behind a full-screen
  // spinner until a Base44 round trip finished only delayed first paint (and up
  // to APP_STATE_TIMEOUT_MS on a slow backend). Auth now resolves in the
  // background; anything that actually needs a user checks auth for itself
  // (ProtectedRoute, or the admin pages' own passcode gate).

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app. Suspense fallbacks keep route chunks from blocking the
  // shell — the inner boundary (in Layout) preserves the nav during navigation.
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomeNext />} />
          <Route path="/home-classic" element={<Home />} />
          <Route path="/home-next" element={<HomeNext />} />
          <Route path="/philanthropy" element={<Philanthropy />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/calendar" element={<ChapterCalendar />} />
          <Route path="/members" element={<MemberDirectory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/events/:slug" element={<EventSignup />} />
          {/* ── HIDDEN — July 26, 2026 All-Classics & Imports Car Show (archived
              2026-07-30, event has passed). /carshow was REUSED for the October
              Halloween show on 2026-07-30, so restoring July's CarShow page
              would need a different path. FreeCarShowSignup is hard-locked to
              the July slug and stays retired.
          <Route path="/carshow/register/free" element={<FreeCarShowSignup />} />
          ── */}
          {/* October 25 Halloween Car Show at Neiman Marcus (halloweenShow.js).
              The sponsor/club link route serves the October event; approved
              slugs live in carShowSponsors.js (July's five are inactive). */}
          <Route path="/carshow" element={<HalloweenCarShow />} />
          <Route path="/car-show" element={<HalloweenCarShow />} />
          <Route path="/carshow/register/:sponsorSlug" element={<SponsorCarShowSignup />} />
          {/* Static path outranks the generic /events/:slug above, so the
              archived July show 404s instead of rendering its signup form. */}
          <Route path="/events/car-show-2026" element={<PageNotFound />} />
          <Route path="/exotics-car-show" element={<ExoticsCarShow />} />
          <Route path="/events/exotics-car-show-2026" element={<ExoticsCarShow />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:slug" element={<GalleryAlbum />} />
          <Route path="/admin" element={<AdminRegistrations />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
