import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue } from 'framer-motion';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Epic home intro.
 *
 *   ACT 1 — COSMOS + ORBIT: a real satellite Earth (keyless MapLibre globe +
 *           Esri imagery) hangs in space while a ring of brother photos orbits
 *           horizontally around it ("from every corner of the world"). The
 *           camera then descends toward the United States — and, driven by that
 *           same descent progress, the orbiting photos expand outward and a
 *           photo grid blooms from the center to cover the page exactly as we
 *           arrive (no flat slideshow; the expansion IS the zoom).
 *   ACT 2 — NATION: the wall holds over the satellite US while a glowing chapter
 *           network radiates from St. Louis (Epsilon Alpha) to every corner.
 *   ACT 3 — SEAL: the nation implodes into a single point where a ceremonial
 *           gold seal materializes, gets STAMPED (shockwave + rays + sparks),
 *           and a white-hot flash hands off to the forge hero below.
 *
 * Runs once per session. Reduced-motion users (and any map failure) fall
 * straight through. Filler photos for now — swap PHOTOS for headshots later.
 */

// Filler tiles — cycled chapter photos. These use the small /thumb/ variants
// (~512px) because the intro never shows a tile larger than ~256px; loading the
// full-size gallery photos here would cost ~14MB on first paint.
// Replace with member headshots when available (same array, same order works).
const PHOTOS = [
  'p07', 'p09', 'p13', 'p15', 'p17', 'p18', 'p19', 'p21', 'p26', 'p27', 'p28',
  'q02', 'q05', 'q06', 'q07', 'q15', 'q16', 'q17', 'q22', 'q26', 'q31', 'q33', 'q34',
].map((n) => `/assets/photos/thumb/${n}.webp`);

const GOLD = '#D9B450';
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Stylized chapter nodes (normalized 100×60 space), hub = St. Louis at center.
const HUB = { x: 50, y: 33 };
const NODES = [
  { x: 13, y: 15 }, { x: 31, y: 9 }, { x: 50, y: 7 }, { x: 71, y: 11 }, { x: 88, y: 19 },
  { x: 91, y: 39 }, { x: 73, y: 50 }, { x: 50, y: 53 }, { x: 28, y: 51 }, { x: 11, y: 40 },
];

// ── downstream timeline, ms AFTER Act 2 (nation) begins ────────────
const T = { implode: 3000, sigil: 3950, stamp: 7450, flash: 8350, done: 9150, safety: 11500 };

function rand(seed) {
  const x = Math.sin(seed * 99.71) * 43758.5453;
  return x - Math.floor(x);
}
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function BrotherhoodIntro() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('tke-intro-seen') === '1'
  );
  // cosmos → nation → implode → sigil → stamp → flash → done
  const [phase, setPhase] = useState('cosmos');
  const phaseRef = useRef('cosmos');
  const setP = (p) => { phaseRef.current = p; setPhase(p); };
  const [label, setLabel] = useState('EARTH');

  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const coordsRef = useRef(null);
  const downstream = useRef(false);
  const dsTimers = useRef([]);

  // Descent progress (0→1). OrbitFill reads this every frame so the photos peel
  // out of orbit and fill the screen in lock-step with the zoom (no slideshow).
  const pv = useMotionValue(0);

  const finish = () => {
    try { sessionStorage.setItem('tke-intro-seen', '1'); } catch { /* private mode */ }
    setDone(true);
  };

  // The brothers that orbit Earth and then fill the screen one at a time.
  const fillPhotos = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const n = 20;
    return Array.from({ length: n }, (_, i) => PHOTOS[i % PHOTOS.length]);
  }, []);

  // ── ACT 1: satellite descent, feeding pv each frame ───────────────
  useEffect(() => {
    if (done || reduce) { if (reduce) finish(); return; }
    let cancelled = false, map, flyRaf;
    const safety = setTimeout(() => !cancelled && phaseRef.current === 'cosmos' && (pv.set(1), setP('nation')), 9500);

    (async () => {
      let maplibregl;
      try { maplibregl = (await import('maplibre-gl')).default; }
      catch { return !cancelled && (pv.set(1), setP('nation')); }
      if (cancelled || !mapEl.current) return;
      try {
        map = new maplibregl.Map({
          container: mapEl.current,
          style: {
            version: 8, projection: { type: 'globe' },
            sources: { sat: { type: 'raster', tiles: [ESRI], tileSize: 256, maxzoom: 19 } },
            layers: [
              { id: 'space', type: 'background', paint: { 'background-color': '#050304' } },
              { id: 'sat', type: 'raster', source: 'sat' },
            ],
          },
          center: [78, 26], zoom: 1.45, interactive: false, attributionControl: false, fadeDuration: 0,
        });
        mapRef.current = map;
      } catch { return !cancelled && (pv.set(1), setP('nation')); }

      map.on('error', () => {});
      map.on('move', () => {
        const z = map.getZoom();
        setLabel(z < 3.2 ? 'EARTH' : z < 5.4 ? 'NORTH AMERICA' : 'UNITED STATES');
        const c = map.getCenter();
        if (coordsRef.current)
          coordsRef.current.textContent =
            `${Math.abs(c.lat).toFixed(2)}° ${c.lat >= 0 ? 'N' : 'S'} · ${Math.abs(c.lng).toFixed(2)}° ${c.lng >= 0 ? 'E' : 'W'}`;
      });
      map.on('load', () => {
        if (cancelled) return;
        const lerp = (a, b, e) => a + (b - a) * e;
        const keys = [
          { p: 0.0, lng: 74, lat: 24, zoom: 1.5 },
          { p: 0.5, lng: -96, lat: 39, zoom: 3.0 },
          { p: 1.0, lng: -97, lat: 38.5, zoom: 3.9 },
        ];
        const at = (e) => {
          let i = 0; while (i < keys.length - 2 && e > keys[i + 1].p) i++;
          const a = keys[i], b = keys[i + 1], f = (e - a.p) / (b.p - a.p);
          return { center: [lerp(a.lng, b.lng, f), lerp(a.lat, b.lat, f)], zoom: lerp(a.zoom, b.zoom, f) };
        };
        const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const DUR = 5400, t0 = performance.now();
        const frame = (now) => {
          if (cancelled) return;
          const p = Math.min((now - t0) / DUR, 1);
          map.jumpTo(at(ease(p)));
          pv.set(p);
          if (p < 1) flyRaf = requestAnimationFrame(frame);
          else if (phaseRef.current === 'cosmos') setP('nation');
        };
        flyRaf = requestAnimationFrame(frame);
      });
    })();

    return () => { cancelled = true; clearTimeout(safety); cancelAnimationFrame(flyRaf); try { map && map.remove(); } catch { /* already removed */ } };
  }, []);

  // ── downstream acts — scheduled ONCE when nation begins ───────────
  useEffect(() => {
    if (done || reduce || phase !== 'nation' || downstream.current) return;
    downstream.current = true;
    const at = (ms, fn) => dsTimers.current.push(setTimeout(fn, ms));
    at(T.implode, () => setP('implode'));
    at(T.sigil, () => { try { mapRef.current && mapRef.current.remove(); } catch { /* noop */ } mapRef.current = null; setP('sigil'); });
    at(T.stamp, () => setP('stamp'));
    at(T.flash, () => setP('flash'));
    at(T.done, finish);
    at(T.safety, finish);
  }, [phase]);

  useEffect(() => () => dsTimers.current.forEach(clearTimeout), []);

  if (done) return null;

  const cosmos = phase === 'cosmos';
  const nationMounted = phase === 'nation' || phase === 'implode';
  const orbitMounted = cosmos || nationMounted;
  const sigilVisible = phase === 'sigil' || phase === 'stamp' || phase === 'flash';
  const stamping = phase === 'stamp' || phase === 'flash';

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-[#050304]">
      {/* satellite map (Act 1 backdrop) */}
      <div ref={mapEl} className="absolute inset-0 h-full w-full"
        style={{ opacity: sigilVisible ? 0 : 1, transition: 'opacity 0.6s ease' }} />
      {!sigilVisible && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: nationMounted
            ? 'radial-gradient(circle at 50% 50%, rgba(5,3,4,0.35) 30%, rgba(5,3,4,0.9) 95%)'
            : 'radial-gradient(circle at 50% 46%, transparent 38%, rgba(5,3,4,0.6) 88%)' }} />
      )}

      <Embers />

      {/* ── ACT 1: cosmos HUD ────────────────────────────────────── */}
      <AnimatePresence>
        {cosmos && (
          <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }} className="absolute inset-0 pointer-events-none z-[4]">
            <p className="absolute top-[7.5vh] left-6 text-white/70 text-[10px] sm:text-xs tracking-[0.35em] font-semibold font-heading">
              TKE // EPSILON ALPHA
            </p>
            <div className="absolute inset-x-0 bottom-[13%] text-center px-4">
              <p className="font-heading text-white font-bold tracking-tight leading-none"
                style={{ fontSize: 'clamp(1.4rem, 5vw, 3rem)', textShadow: '0 2px 22px rgba(0,0,0,0.85)' }}>{label}</p>
              <p ref={coordsRef} className="text-primary/85 text-[11px] sm:text-sm tracking-[0.25em] mt-3 font-semibold"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>26.00° N · 78.00° E</p>
              <div className="mx-auto mt-4 h-px w-24 sm:w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <p className="text-white/55 text-[10px] sm:text-xs tracking-[0.4em] uppercase font-semibold mt-4">
                A Brotherhood Across the Nation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACT 1½→2: photos orbit Earth, then fill the screen one at
              a time, all driven by the descent (one rAF loop) ────────── */}
      {orbitMounted && fillPhotos.length > 0 && (
        <OrbitFill photos={fillPhotos} pv={pv} phase={phase} />
      )}

      {/* chapter network radiating from St. Louis */}
      <AnimatePresence>{phase === 'nation' && <ChapterNetwork />}</AnimatePresence>

      {/* nation headline */}
      <AnimatePresence>
        {phase === 'nation' && (
          <motion.div key="nation-copy" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -14, transition: { duration: 0.5 } }}
            className="absolute inset-x-0 bottom-[9%] flex flex-col items-center text-center px-5 pointer-events-none z-[4]">
            <WordReveal lines={[['From', 'every', 'corner'], ['of', 'the', 'country.']]} accentLine={1} delay={0.5} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACT 3: the seal ──────────────────────────────────────── */}
      <AnimatePresence>
        {sigilVisible && (
          <motion.div key="sigil" className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'radial-gradient(circle at 50% 50%, #1a0807, #0a0505 70%, #050303)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{ width: '60vmin', height: '60vmin', background: 'radial-gradient(circle, rgba(217,180,80,0.35), rgba(214,42,30,0.12) 45%, transparent 70%)' }}
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.92, 1.04, 0.92] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{ width: '92vmin', height: '92vmin', background: 'radial-gradient(circle, rgba(214,42,30,0.55), rgba(214,42,30,0) 62%)' }}
              initial={{ scale: 0, opacity: 0 }} animate={stamping ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            <AnimatePresence>{stamping && <StampBurst key="burst" />}</AnimatePresence>
            <motion.div initial={{ rotate: -22, scale: 0.82, opacity: 0 }}
              animate={stamping ? { rotate: 0, scale: [1, 1.08, 1.02], opacity: 1 } : { rotate: 0, scale: 1, opacity: 1 }}
              transition={stamping ? { duration: 0.5, ease: 'easeOut' } : { duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ filter: 'drop-shadow(0 0 26px rgba(217,180,80,0.4))' }} className="relative">
              <Sigil play={sigilVisible} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* film grain */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }} />
      {/* letterbox */}
      <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 bg-black pointer-events-none z-[5]"
        initial={{ height: 0 }} animate={{ height: phase === 'flash' ? 0 : '7vh' }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-0 bg-black pointer-events-none z-[5]"
        initial={{ height: 0 }} animate={{ height: phase === 'flash' ? 0 : '7vh' }} transition={{ duration: 0.8, ease: 'easeOut' }} />

      {/* flash → forge */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div key="flash" className="absolute inset-0 bg-white pointer-events-none z-[6]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeIn' }} />
        )}
      </AnimatePresence>

      <p className="absolute bottom-2 left-3 text-[9px] text-white/30 pointer-events-none z-10">Imagery © Esri, Maxar, Earthstar Geographics</p>
      <button onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-white/45 hover:text-white text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors">
        Skip ›
      </button>
    </div>
  );
}

/* ── orbiting brothers that fill the screen one at a time ──────────────
 * One rAF loop drives everything in 2D screen space: each photo circles the
 * globe (front bigger, back faded so it reads as passing behind Earth), then —
 * staggered by the descent progress `pv` — peels out of orbit and flies to its
 * grid cell, until the wall covers the page. On implode it vacuums to center.
 * ──────────────────────────────────────────────────────────────────── */
function OrbitFill({ photos, pv, phase }) {
  const refs = useRef([]);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const cfg = useMemo(() => {
    const W = window.innerWidth, H = window.innerHeight;
    const cols = W < 560 ? 4 : 5;
    const rows = Math.ceil(photos.length / cols);
    return {
      W, H, cols, rows, cellW: W / cols, cellH: H / rows,
      cx: W / 2, cy: H * 0.47,
      RX: Math.min(W * 0.34, 500), RY: Math.min(H * 0.16, 150),
    };
  }, [photos.length]);

  useEffect(() => {
    const N = photos.length;
    const { cx, cy, RX, RY, cols, cellW, cellH } = cfg;
    const OMEGA = 2.0;                     // orbit speed (rad/s) → a few loops
    const winStart = 0.4, winEnd = 0.92;   // pv window for the staggered fill (all land by p≈0.96)
    const span = winEnd - winStart;
    const fillDur = (span / N) * 1.5;      // short per-photo fill → lands one at a time
    let raf, t0 = performance.now(), impStart = null;

    const loop = (now) => {
      const t = (now - t0) / 1000;
      const p = pv.get();
      const ph = phaseRef.current;
      let imp = 0;
      if (ph === 'implode' || ph === 'sigil' || ph === 'stamp' || ph === 'flash') {
        if (impStart == null) impStart = now;
        imp = easeIO(Math.min((now - impStart) / 750, 1));
      }
      for (let i = 0; i < N; i++) {
        const node = refs.current[i];
        if (!node) continue;
        const theta = i * (2 * Math.PI / N) + OMEGA * t;
        const depth = Math.cos(theta);                     // 1 = front, -1 = behind globe
        const ox = cx + RX * Math.sin(theta);
        const oy = cy + RY * Math.cos(theta);
        const oScale = 0.3 + 0.3 * ((depth + 1) / 2);      // smaller on the ring → cleaner orbit
        const oOpacity = depth >= 0 ? 1 : Math.max(0, 1 + depth * 1.5); // back fades behind the globe
        const col = i % cols, row = Math.floor(i / cols);
        const gx = (col + 0.5) * cellW, gy = (row + 0.5) * cellH;
        let e = (p - (winStart + (i / N) * span)) / fillDur; // staggered, tied to the zoom
        e = easeIO(e < 0 ? 0 : e > 1 ? 1 : e);
        let x = ox + (gx - ox) * e;
        let y = oy + (gy - oy) * e;
        let s = oScale + (1 - oScale) * e;
        let op = oOpacity + (1 - oOpacity) * e;
        const z = Math.round((depth + 1) * 40) + Math.round(e * 300);
        if (imp > 0) {                                       // vacuum into the seal
          x += (cx - x) * imp; y += (cy - y) * imp;
          s *= (1 - imp * 0.97); op *= (1 - imp * 0.9);
        }
        node.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) scale(${s})`;
        node.style.opacity = op;
        node.style.zIndex = String(1000 + z);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cfg, pv, photos.length]);

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-[3]">
      {photos.map((src, i) => (
        <div key={i} ref={(el) => (refs.current[i] = el)} className="absolute left-0 top-0 overflow-hidden"
          style={{ width: cfg.cellW + 1, height: cfg.cellH + 1, opacity: 0, willChange: 'transform, opacity',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', outline: '1px solid rgba(217,180,80,0.18)' }}>
          <img src={src} alt="" loading="eager" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#7a1410] mix-blend-color opacity-25" />
        </div>
      ))}
    </div>
  );
}

/* ── chapter network: glowing arcs from St. Louis to every corner ──── */
function ChapterNetwork() {
  const arcs = useMemo(() => NODES.map((n, i) => {
    const mx = (HUB.x + n.x) / 2 + (n.y - HUB.y) * 0.18;
    const my = (HUB.y + n.y) / 2 - (n.x - HUB.x) * 0.18;
    return { id: i, n, d: `M ${HUB.x} ${HUB.y} Q ${mx} ${my} ${n.x} ${n.y}` };
  }), []);
  return (
    <motion.svg key="net" aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
      viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}
      transition={{ duration: 0.6, delay: 0.4 }}>
      <defs>
        <radialGradient id="net-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(214,42,30,0.45)" /><stop offset="100%" stopColor="rgba(214,42,30,0)" />
        </radialGradient>
      </defs>
      {arcs.map((a) => (
        <g key={a.id}>
          <motion.path d={a.d} fill="none" stroke={GOLD} strokeWidth="0.35" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ pathLength: { duration: 1.0, delay: 0.6 + a.id * 0.07, ease: 'easeOut' }, opacity: { duration: 0.3, delay: 0.6 + a.id * 0.07 } }} />
          <circle r="0.7" fill="#fff">
            <animateMotion dur="1.6s" begin={`${1.0 + a.id * 0.07}s`} repeatCount="indefinite" path={a.d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
          </circle>
          <motion.circle cx={a.n.x} cy={a.n.y} r="0.9" fill={GOLD}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.5 + a.id * 0.07 }} style={{ filter: 'drop-shadow(0 0 2px #D9B450)' }} />
        </g>
      ))}
      <circle cx={HUB.x} cy={HUB.y} r="4" fill="url(#net-glow)" />
      <motion.circle cx={HUB.x} cy={HUB.y} r="1.4" fill="#fff" stroke={GOLD} strokeWidth="0.4"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 200 }} />
      <motion.text x={HUB.x} y={HUB.y - 2.6} textAnchor="middle" fill="#fff" fontSize="1.7"
        style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 700, letterSpacing: '0.12em' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>EPSILON ALPHA</motion.text>
    </motion.svg>
  );
}

/* ── word-by-word headline ─────────────────────────────────────────── */
function WordReveal({ lines, accentLine, delay = 0 }) {
  const wrap = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: delay } } };
  const word = { hidden: { y: '115%' }, visible: { y: 0, transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] } } };
  return (
    <motion.h2 variants={wrap} initial="hidden" animate="visible" className="font-heading text-white font-bold leading-[0.98]"
      style={{ fontSize: 'clamp(2rem, 7vw, 5rem)', letterSpacing: '-0.02em', textShadow: '0 6px 44px rgba(0,0,0,0.9)' }}>
      {lines.map((ln, li) => (
        <span key={li} className="block overflow-hidden py-[0.04em]">
          <span className="inline-flex gap-[0.24em] justify-center">
            {ln.map((w, wi) => (
              <motion.span key={wi} variants={word} className={`inline-block ${li === accentLine ? 'text-primary' : ''}`}
                style={li === accentLine ? { textShadow: '0 0 38px rgba(214,42,30,0.5)' } : undefined}>{w}</motion.span>
            ))}
          </span>
        </span>
      ))}
    </motion.h2>
  );
}

/* ── drifting ember particles ──────────────────────────────────────── */
function Embers({ count = 18 }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, left: rand(i + 2) * 100, size: 1.5 + rand(i + 5) * 3, dur: 6 + rand(i + 8) * 7,
    delay: rand(i + 11) * 8, drift: (rand(i + 14) - 0.5) * 90, gold: rand(i + 19) > 0.5,
  })), [count]);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {bits.map((b) => (
        <motion.span key={b.id} className="absolute rounded-full"
          style={{ left: `${b.left}%`, bottom: '-4%', width: b.size, height: b.size,
            background: b.gold ? 'rgba(217,180,80,0.9)' : 'rgba(214,42,30,0.9)',
            boxShadow: b.gold ? '0 0 8px rgba(217,180,80,0.8)' : '0 0 8px rgba(214,42,30,0.8)' }}
          initial={{ y: 0, x: 0, opacity: 0 }} animate={{ y: '-108vh', x: b.drift, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }} />
      ))}
    </div>
  );
}

/* ── stamp impact: shockwave rings + starburst rays + spark burst ──── */
function StampBurst() {
  const sparks = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + rand(i) * 0.3, d = 160 + rand(i + 30) * 180;
    return { id: i, x: Math.cos(a) * d, y: Math.sin(a) * d, s: 2 + rand(i + 40) * 3 };
  }), []);
  return (
    <div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ width: '120vmin', height: '120vmin', background: 'repeating-conic-gradient(from 0deg, rgba(255,235,200,0) 0deg 7deg, rgba(217,180,80,0.45) 7deg 8deg)' }}
        initial={{ scale: 0.2, opacity: 0, rotate: 0 }} animate={{ scale: 1.2, opacity: [0, 0.7, 0], rotate: 14 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      {[0, 0.12].map((d, i) => (
        <motion.div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ width: 200, height: 200, borderColor: 'rgba(217,180,80,0.8)' }}
          initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 4.5, opacity: 0 }} transition={{ duration: 0.9, delay: d, ease: 'easeOut' }} />
      ))}
      {sparks.map((s) => (
        <motion.span key={s.id} className="absolute rounded-full"
          style={{ left: 0, top: 0, width: s.s, height: s.s, background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }} animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.4 }} transition={{ duration: 0.75, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

/* ── the seal ──────────────────────────────────────────────────────── */
function Sigil({ play }) {
  const draw = (delay, duration = 1.4) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: play ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    transition: { pathLength: { duration, delay, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.3, delay } },
  });
  const fade = (delay) => ({
    initial: { opacity: 0 }, animate: play ? { opacity: 1 } : { opacity: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' },
  });
  return (
    <div className="relative w-[80vmin] max-w-[500px] aspect-square flex items-center justify-center">
      <motion.div className="absolute inset-0 rounded-full border border-dashed" style={{ borderColor: 'rgba(217,180,80,0.35)' }}
        animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute inset-[7%] rounded-full"
        style={{ background: 'repeating-conic-gradient(from 0deg, rgba(217,180,80,0) 0deg 11deg, rgba(217,180,80,0.4) 11deg 12deg)', WebkitMask: 'radial-gradient(transparent 63%, #000 64%, #000 67%, transparent 68%)', mask: 'radial-gradient(transparent 63%, #000 64%, #000 67%, transparent 68%)' }}
        animate={{ rotate: -360 }} transition={{ duration: 34, repeat: Infinity, ease: 'linear' }} />
      <svg viewBox="0 0 400 400" className="relative w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tke-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F6E6A8" /><stop offset="0.5" stopColor="#D9B450" /><stop offset="1" stopColor="#A87B22" />
          </linearGradient>
          <radialGradient id="tke-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(217,180,80,0.5)" /><stop offset="60%" stopColor="rgba(214,42,30,0.18)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <path id="tke-top-arc" d="M 60 200 a 140 140 0 0 1 280 0" fill="none" />
          <path id="tke-bot-arc" d="M 64 200 a 136 136 0 0 0 272 0" fill="none" />
        </defs>
        <motion.circle cx="200" cy="200" r="150" fill="url(#tke-core)" initial={{ opacity: 0 }}
          animate={play ? { opacity: [0.3, 0.65, 0.3] } : { opacity: 0 }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }} />
        <motion.circle cx="200" cy="200" r="192" fill="none" stroke="url(#tke-gold)" strokeWidth="2.5" {...draw(0, 1.6)} />
        <motion.circle cx="200" cy="200" r="178" fill="none" stroke="url(#tke-gold)" strokeWidth="1.2" {...draw(0.3, 1.6)} />
        <motion.circle cx="200" cy="200" r="118" fill="none" stroke="url(#tke-gold)" strokeWidth="1.8" {...draw(0.7, 1.4)} />
        <motion.path d="M 200 322 l 5 9 l 9 5 l -9 5 l -5 9 l -5 -9 l -9 -5 l 9 -5 z" fill={GOLD} stroke="none" {...fade(1.8)} />
        <motion.path d="M 86 200 l 4 7 l 7 4 l -7 4 l -4 7 l -4 -7 l -7 -4 l 7 -4 z" fill={GOLD} stroke="none" {...fade(1.9)} />
        <motion.path d="M 314 200 l 4 7 l 7 4 l -7 4 l -4 7 l -4 -7 l -7 -4 l 7 -4 z" fill={GOLD} stroke="none" {...fade(1.9)} />
        <motion.text {...fade(1.85)} fill={GOLD} style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 600, letterSpacing: '0.2em' }} fontSize="21">
          <textPath href="#tke-top-arc" startOffset="50%" textAnchor="middle">TAU KAPPA EPSILON</textPath>
        </motion.text>
        <motion.text {...fade(2.0)} fill={GOLD} style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 500, letterSpacing: '0.26em' }} fontSize="13.5">
          <textPath href="#tke-bot-arc" startOffset="50%" textAnchor="middle">EPSILON ALPHA · EST. 1955</textPath>
        </motion.text>
        <motion.text x="200" y="218" textAnchor="middle" fill="url(#tke-gold)"
          style={{ fontFamily: 'var(--font-heading), serif', fontWeight: 700, letterSpacing: '0.04em' }} fontSize="94" {...fade(1.7)}>ΤΚΕ</motion.text>
        <motion.line x1="150" y1="150" x2="250" y2="150" stroke="url(#tke-gold)" strokeWidth="1.5" {...draw(1.3, 0.8)} />
        <motion.line x1="150" y1="250" x2="250" y2="250" stroke="url(#tke-gold)" strokeWidth="1.5" {...draw(1.4, 0.8)} />
      </svg>
    </div>
  );
}
