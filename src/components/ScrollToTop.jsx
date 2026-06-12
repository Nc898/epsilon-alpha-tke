import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getLenis } from "../lib/useLenis";

const getHashId = (hash) => {
  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;

    const lenis = getLenis();

    if (hash) {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        if (lenis) {
          lenis.scrollTo(el);
        } else {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
      return () => window.clearTimeout(timer);
    }

    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash, navigationType]);

  return null;
}
