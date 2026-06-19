import { useEffect, useState } from 'react';
import { ExternalLink, ShieldQuestion } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

/*
  Global "you are leaving our site" interstitial.

  Mounted once in Layout. A single capture-phase click listener catches every
  anchor on the page; if it points to a different hostname (http/https), we
  pause navigation and ask the user to confirm. Covers all external links —
  Stripe, St. Jude, Instagram, etc. — without wrapping each one.

  Opt out on any link with  data-no-interstitial  (e.g. a trusted embed).
*/
export default function ExternalLinkInterstitial() {
  const [pending, setPending] = useState(null); // { href, host }

  useEffect(() => {
    function onClick(e) {
      // Respect the browser's own shortcuts: modified clicks / non-primary
      // buttons (open-in-new-tab, etc.) pass through untouched.
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const el = e.target instanceof Element ? e.target.closest('a') : null;
      if (!el) return;
      if (el.hasAttribute('data-no-interstitial')) return;

      const raw = el.getAttribute('href');
      if (!raw) return;

      let url;
      try {
        url = new URL(el.href, window.location.href);
      } catch {
        return;
      }

      // Only intercept real web navigations leaving our domain. Skip mailto:,
      // tel:, sms:, and any same-origin / in-app link.
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === window.location.hostname) return;

      e.preventDefault();
      setPending({ href: url.href, host: url.hostname.replace(/^www\./, '') });
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const proceed = () => {
    if (pending) window.open(pending.href, '_blank', 'noopener,noreferrer');
    setPending(null);
  };

  return (
    <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <ShieldQuestion className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="font-heading text-xl">
            You're leaving our website
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            You're about to visit an external site that TKE Epsilon Alpha doesn't
            operate or control. We aren't responsible for its content or privacy
            practices.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {pending && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3.5 py-2.5 text-sm">
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground truncate" title={pending.href}>
              {pending.host}
            </span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Stay here</AlertDialogCancel>
          <AlertDialogAction onClick={proceed} className="gap-1.5">
            Continue <ExternalLink className="h-4 w-4" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
