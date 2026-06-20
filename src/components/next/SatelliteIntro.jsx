import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Real-satellite cosmic descent for /home-next. A keyless MapLibre globe with
 * Esri World Imagery tiles flies from space → North America → Missouri → St.
 * Louis → straight down onto the SLU campus; a HUD reads off the location +
 * live coordinates; then it crossfades to the SLU gate photo and a white-hot
 * flash hands off to the forge hero. One run per session; reduced-motion and
 * any map failure fall straight through to the page.
 */
const SLU = [-90.2342, 38.6359]; // Saint Louis University campus
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function labelForZoom(z) {
  if (z < 3.4) return 'EARTH';
  if (z < 5.6) return 'UNITED STATES';
  if (z < 8.2) return 'MISSOURI';
  if (z < 12.5) return 'ST. LOUIS';
  return 'SAINT LOUIS UNIVERSITY';
}

export default function SatelliteIntro() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('tke-sat-seen') === '1'
  );
  const [phase, setPhase] = useState('flying'); // flying → arriving → flash → done
  const [label, setLabel] = useState('EARTH');
  const mapEl = useRef(null);
  const coordsRef = useRef(null);
  const mapRef = useRef(null);

  const finish = () => {
    try { sessionStorage.setItem('tke-sat-seen', '1'); } catch { /* private */ }
    setDone(true);
  };

  useEffect(() => {
    if (done) return;
    if (reduce) { finish(); return; }

    let cancelled = false;
    let map;
    let flyRaf;
    let safety = setTimeout(() => { if (!cancelled) startArrival(); }, 13000); // never get stuck

    const startArrival = () => {
      clearTimeout(safety);
      setPhase('arriving');
      // photo crossfade (1s) → flash (0.5s) → reveal forge
      setTimeout(() => !cancelled && setPhase('flash'), 1100);
      setTimeout(() => !cancelled && finish(), 1850);
    };

    (async () => {
      let maplibregl;
      try {
        maplibregl = (await import('maplibre-gl')).default;
      } catch (e) {
        console.error('[SatelliteIntro] maplibre import failed:', e);
        return startArrival(); // library failed → skip to the gate
      }
      if (cancelled || !mapEl.current) return;

      try {
        map = new maplibregl.Map({
          container: mapEl.current,
          style: {
            version: 8,
            projection: { type: 'globe' },
            sources: { sat: { type: 'raster', tiles: [ESRI], tileSize: 256, maxzoom: 19, attribution: 'Esri, Maxar, Earthstar Geographics' } },
            layers: [
              { id: 'space', type: 'background', paint: { 'background-color': '#050304' } },
              { id: 'sat', type: 'raster', source: 'sat' },
            ],
          },
          center: [78, 26],
          zoom: 1.45,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
        });
        mapRef.current = map;
      } catch (e) {
        console.error('[SatelliteIntro] map init failed:', e);
        return startArrival();
      }

      map.on('error', () => {}); // tile hiccups shouldn't crash the show

      map.on('move', () => {
        const z = map.getZoom();
        const name = labelForZoom(z);
        setLabel((p) => (p === name ? p : name));
        const c = map.getCenter();
        if (coordsRef.current) {
          coordsRef.current.textContent =
            `${Math.abs(c.lat).toFixed(4)}° ${c.lat >= 0 ? 'N' : 'S'} · ${Math.abs(c.lng).toFixed(4)}° ${c.lng >= 0 ? 'E' : 'W'}`;
        }
      });

      map.on('load', () => {
        if (cancelled) return;
        // Two-phase hand-driven camera (flyTo ignores its duration across the
        // globe→mercator transition): first rotate the globe to North America
        // at low zoom, then descend onto the SLU campus. jumpTo() per frame.
        const lerp = (a, b, e) => a + (b - a) * e;
        const keys = [
          { p: 0.0, lng: 72, lat: 24, zoom: 1.5, pitch: 0, bearing: 0 },
          { p: 0.46, lng: -96, lat: 39, zoom: 3.8, pitch: 0, bearing: 0 }, // rotated over the USA
          { p: 1.0, lng: SLU[0], lat: SLU[1], zoom: 16.4, pitch: 38, bearing: -17 }, // down to SLU
        ];
        const at = (e) => {
          let i = 0;
          while (i < keys.length - 2 && e > keys[i + 1].p) i++;
          const a = keys[i], b = keys[i + 1];
          const f = (e - a.p) / (b.p - a.p);
          return {
            center: [lerp(a.lng, b.lng, f), lerp(a.lat, b.lat, f)],
            zoom: lerp(a.zoom, b.zoom, f),
            pitch: lerp(a.pitch, b.pitch, f),
            bearing: lerp(a.bearing, b.bearing, f),
          };
        };
        const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const DUR = 8000;
        const t0 = performance.now();
        const frame = (now) => {
          if (cancelled) return;
          const p = Math.min((now - t0) / DUR, 1);
          map.jumpTo(at(easeInOut(p)));
          if (p < 1) flyRaf = requestAnimationFrame(frame);
          else if (!cancelled) startArrival();
        };
        flyRaf = requestAnimationFrame(frame);
      });
    })();

    return () => {
      cancelled = true;
      clearTimeout(safety);
      cancelAnimationFrame(flyRaf);
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, reduce]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#050304] overflow-hidden">
      {/* satellite globe */}
      <div ref={mapEl} className="absolute inset-0 h-full w-full" />

      {/* dark grade + vignette over the map for cinematic depth + legibility */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 46%, transparent 38%, rgba(5,3,4,0.6) 88%)' }} />

      {/* HUD wayfinding */}
      <AnimatePresence>
        {phase === 'flying' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-x-0 bottom-[12%] text-center px-4 pointer-events-none"
          >
            <p className="font-heading text-white font-bold tracking-tight leading-none"
              style={{ fontSize: 'clamp(1.4rem, 5vw, 3rem)', textShadow: '0 2px 22px rgba(0,0,0,0.85)' }}>
              {label}
            </p>
            <p ref={coordsRef} className="text-primary/85 text-[11px] sm:text-sm tracking-[0.25em] mt-3 font-semibold"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
              26.0000° N · 78.0000° E
            </p>
            <div className="mx-auto mt-4 h-px w-24 sm:w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* targeting reticle while flying */}
      {phase === 'flying' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[30vmin] h-[30vmin] opacity-60">
            <div className="absolute inset-0 rounded-full border border-primary/40" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/25" />
            <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-primary/25" />
          </div>
        </div>
      )}

      {/* SLU gate arrival */}
      <AnimatePresence>
        {(phase === 'arriving' || phase === 'flash') && (
          <motion.div key="gate" className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
            <motion.img src="/assets/slu-gate.jpg" alt="" aria-hidden="true"
              initial={{ scale: 1.3 }} animate={{ scale: 1.06 }} transition={{ duration: 1.6, ease: 'easeOut' }}
              className="h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, transparent 35%, rgba(5,3,4,0.6))' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* white-hot flash → forge */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div key="flash" className="absolute inset-0 bg-white pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: 'easeIn' }} />
        )}
      </AnimatePresence>

      <p className="absolute bottom-2 left-3 text-[9px] text-white/30 pointer-events-none">Imagery © Esri, Maxar, Earthstar Geographics</p>
      <button onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-white/45 hover:text-white text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors">
        Skip ›
      </button>
    </div>
  );
}
