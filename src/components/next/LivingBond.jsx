import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { MEMORIES, ERA_MARKERS, PRINCIPLES } from '@/lib/chapterMemories';
import { getLenis } from '@/lib/useLenis';

/**
 * THE LIVING BOND — homepage cinematic entrance.
 *
 * Individual lives become connections; connections become brotherhood;
 * brotherhood becomes TKE. One heartbeat of light → cherry-red threads connect
 * real chapter photographs into a living constellation → a journey through the
 * chapter's generations (LOVE · CHARITY · ESTEEM) → the network draws itself
 * into the TKE triangle ("Bound for life") → it contracts into a single line
 * that traces the Gateway Arch → a portal of red light opens into the existing
 * homepage hero.
 *
 * Built with CSS 3D transforms + SVG threads + framer-motion (no WebGL, no new
 * deps): transform/opacity only, so it is smooth, accessible, and degrades
 * gracefully. Runs once per session (a short reveal after that); respects
 * reduced motion; skippable by click, Escape, or scroll. ~11.5s end to end.
 */

const CHERRY = '#D62A1E';
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const SEQUENCE = ['spark', 'connect', 'constellation', 'words', 'triangle', 'principles', 'arch', 'portal'];
const DURATIONS = { spark: 1300, connect: 1400, constellation: 1700, words: 1900, triangle: 1700, principles: 1400, arch: 1400, portal: 800 };

const rand = (s) => { const x = Math.sin(s * 99.71) * 43758.5453; return x - Math.floor(x); };

function buildLayout(W, H, count) {
  const base = Math.min(W, H);
  const GA = Math.PI * (3 - Math.sqrt(5));
  const memories = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const a = i * GA;
    const rr = 0.5 + 0.55 * Math.sqrt(t); // open center, reach toward the edges
    memories.push({
      x: Math.cos(a) * rr * W * 0.46,
      y: Math.sin(a) * rr * H * 0.44,
      scale: i % 3 === 0 ? 1 : i % 3 === 1 ? 0.82 : 0.66,
      layer: i % 3,
    });
  }
  // First three: a clear triad at mid radius — the opening "first connections".
  // Inverted orientation (one below, two above) so it foreshadows the TKE mark.
  const triA = [Math.PI / 2, -Math.PI / 6, -(Math.PI * 5) / 6];
  for (let i = 0; i < Math.min(3, count); i++) {
    memories[i] = { x: Math.cos(triA[i]) * W * 0.2, y: Math.sin(triA[i]) * H * 0.22, scale: 0.95, layer: 0 };
  }
  // Spacing relaxation so the memories breathe instead of clumping. The triad
  // is anchored (it pushes others but never moves) so the opening inverted
  // triangle keeps its spread.
  const minD = base * 0.26 + 120;
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
      const dx = memories[j].x - memories[i].x, dy = memories[j].y - memories[i].y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < minD) {
        const push = (minD - d) / 2, ux = dx / d, uy = dy / d;
        if (i >= 3) { memories[i].x -= ux * push; memories[i].y -= uy * push; }
        if (j >= 3) { memories[j].x += ux * push; memories[j].y += uy * push; }
      }
    }
  }
  const clampX = W * 0.47, clampY = H * 0.45;
  memories.forEach((m) => { m.x = Math.max(-clampX, Math.min(clampX, m.x)); m.y = Math.max(-clampY, Math.min(clampY, m.y)); });

  // Inverted equilateral triangle (apex DOWN — like the TKE mark). Two vertices
  // across the top, one point at the bottom; photos line the three edges.
  // Lifted slightly so the shape (whose mass sits high) reads centered on the
  // page, with room for the copy below the apex.
  const side = base * 0.66;
  const h = (side * Math.sqrt(3)) / 2;
  const lift = base * 0.06;
  const V = {
    tl: { x: -side / 2, y: -h / 3 - lift },
    tr: { x: side / 2, y: -h / 3 - lift },
    apex: { x: 0, y: (2 / 3) * h - lift },
  };
  const edges = [[V.tl, V.tr], [V.tr, V.apex], [V.apex, V.tl]];
  // Even distribution per edge, padded away from the vertices (which belong to
  // the principle markers), each photo rotated to lie along its edge so the
  // frames themselves draw the triangle.
  const per = [Math.ceil(count / 3)];
  per.push(Math.ceil((count - per[0]) / 2));
  per.push(count - per[0] - per[1]);
  const rots = [0, -60, 60]; // top edge level; slanted edges match their slope
  const tri = [];
  const pad = 0.075; // keep photos clear of the vertices (and of each other at the apex)
  edges.forEach(([p, q], e) => {
    for (let k = 0; k < per[e]; k++) {
      const local = pad + (1 - 2 * pad) * ((k + 0.5) / per[e]);
      tri.push({ x: p.x + (q.x - p.x) * local, y: p.y + (q.y - p.y) * local, rot: rots[e] });
    }
  });

  // Connect each photo to its two nearest neighbours → the living web.
  const pairs = [];
  for (let i = 0; i < count; i++) {
    const near = memories
      .map((m, j) => ({ j, d: (m.x - memories[i].x) ** 2 + (m.y - memories[i].y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d);
    for (let k = 0; k < 2; k++) if (near[k].j > i) pairs.push([i, near[k].j]);
  }

  const arch = { aw: base * 0.27, atop: -base * 0.2, ab: base * 0.27 };
  return { memories, tri, V, edges, pairs, arch, base, side };
}

export default function LivingBond({ replayToken = 0 }) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(
    () => typeof window !== 'undefined' && replayToken === 0 && sessionStorage.getItem('tke-livingbond-seen') === '1'
  );
  const short = useMemo(
    () => replayToken === 0 && typeof window !== 'undefined' && sessionStorage.getItem('tke-livingbond-seen') === '1',
    [replayToken]
  );
  // Dev-only: `?bond=<phase>` pins a beat with animations pre-settled, so a
  // beat can be inspected even when the tab is hidden (rAF paused).
  const forced = useMemo(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return null;
    const p = new URLSearchParams(window.location.search).get('bond');
    return p && SEQUENCE.includes(p) ? p : null;
  }, []);
  const dbg = !!forced;

  const [phase, setPhase] = useState(forced || 'spark');
  const phaseRef = useRef(forced || 'spark');
  const idxRef = useRef(0);
  const timerRef = useRef(null);
  const setP = (p) => { phaseRef.current = p; setPhase(p); };

  const [dims, setDims] = useState(() =>
    typeof window === 'undefined' ? { W: 1280, H: 800 } : { W: window.innerWidth, H: window.innerHeight }
  );
  const count = dims.W >= 1024 ? 14 : dims.W >= 640 ? 11 : 7;
  const size = dims.W >= 1024 ? 150 : dims.W >= 640 ? 120 : 96;
  const layout = useMemo(() => buildLayout(dims.W, dims.H, Math.min(count, MEMORIES.length)), [dims, count]);

  // Pointer parallax (desktop only; mobile leaves these at rest → no parallax).
  const pmx = useMotionValue(0);
  const pmy = useMotionValue(0);
  const sx = useSpring(pmx, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(pmy, { stiffness: 60, damping: 18, mass: 0.6 });

  const [wave, setWave] = useState(null); // principle group currently revealed

  const finish = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try { sessionStorage.setItem('tke-livingbond-seen', '1'); } catch { /* private mode */ }
    setDone(true);
  };

  // ── timeline ──────────────────────────────────────────────────────
  useEffect(() => {
    if (done) return;
    if (forced) return; // dev inspection — phase pinned, no timers
    // Reduced motion or a repeat visit → calm, short reveal, then hero.
    if (reduce || short) {
      setP('short');
      timerRef.current = setTimeout(finish, reduce ? 900 : 1300);
      return () => timerRef.current && clearTimeout(timerRef.current);
    }

    const goTo = (i) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      idxRef.current = i;
      if (i >= SEQUENCE.length) return finish();
      const name = SEQUENCE[i];
      setP(name);
      timerRef.current = setTimeout(() => goTo(i + 1), DURATIONS[name]);
    };
    goTo(0);

    // Scroll / swipe / key advance the beats; Escape skips entirely.
    let lastJump = 0;
    const advance = () => {
      const now = performance.now();
      if (now - lastJump < 280) return;
      lastJump = now;
      if (phaseRef.current === 'short') return finish();
      goTo(idxRef.current + 1);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') return finish();
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') advance();
    };
    window.addEventListener('wheel', advance, { passive: true });
    window.addEventListener('touchmove', advance, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('wheel', advance);
      window.removeEventListener('touchmove', advance);
      window.removeEventListener('keydown', onKey);
    };
  }, [done, reduce, short, replayToken]);

  // Drive the principle wave during the 'principles' beat.
  useEffect(() => {
    if (phase !== 'principles') { setWave(null); return; }
    const groups = PRINCIPLES.map((p) => p.group);
    const ts = groups.map((g, i) => setTimeout(() => setWave(g), (DURATIONS.principles / groups.length) * i));
    return () => ts.forEach(clearTimeout);
  }, [phase]);

  // Lock scroll while the cinematic is visible; always restore.
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    getLenis()?.stop();
    return () => { document.body.style.overflow = prev; getLenis()?.start(); };
  }, [done]);

  // Resize / orientation.
  useEffect(() => {
    if (done) return;
    const onResize = () => setDims({ W: window.innerWidth, H: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); };
  }, [done]);

  if (done) return null;

  const onMove = (e) => {
    if (dims.W < 1024) return;
    pmx.set((e.clientX / dims.W - 0.5) * 2);
    pmy.set((e.clientY / dims.H - 0.5) * 2);
  };

  const isShort = phase === 'short';
  const photosMounted = !isShort;
  const particleCount = dims.W >= 1024 ? 16 : 8;

  // Portal to <body> so a transformed ancestor (Layout's page-transition
  // motion.div) can't become the containing block for our fixed overlay.
  return createPortal(
    <div
      role="group"
      aria-label="Chapter introduction animation"
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% 50%, #131011, #0a0809 60%, #060506)' }}
      onMouseMove={onMove}
    >
      {/* faint drifting particles */}
      <Particles count={particleCount} />

      {/* center-origin stage */}
      <div className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
        {/* threads */}
        <Threads layout={layout} phase={phase} W={dims.W} H={dims.H} sx={sx} sy={sy} cherry={CHERRY} dbg={dbg} />

        {/* photographs */}
        {photosMounted && layout.memories.map((pos, i) => (
          <Memory
            key={MEMORIES[i].id}
            index={i}
            mem={MEMORIES[i]}
            pos={pos}
            tri={layout.tri[i]}
            phase={phase}
            size={size}
            sx={sx}
            sy={sy}
            wave={wave}
            dbg={dbg}
          />
        ))}

        {/* TKE wordmark filling the inverted triangle — the symbol revealed as
            built from the chapter's people. */}
        {(phase === 'triangle' || phase === 'principles') && (
          <TkeWordmark layout={layout} dbg={dbg} />
        )}
      </div>

      {/* heartbeat spark */}
      <AnimatePresence>
        {phase === 'spark' && (
          <motion.div key="spark" className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <motion.span aria-hidden="true" className="rounded-full"
              style={{ width: 12, height: 12, background: CHERRY, boxShadow: `0 0 24px 6px ${CHERRY}` }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.p className="font-heading text-white/70 mt-10 text-sm sm:text-base tracking-[0.2em]"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: [0, 1, 1, 0], y: 0 }}
              transition={{ duration: DURATIONS.spark / 1000, times: [0, 0.3, 0.75, 1] }}>
              Every brotherhood begins with one.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* short / reduced-motion reveal */}
      <AnimatePresence>
        {isShort && (
          <motion.div key="short" className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <span aria-hidden="true" className="rounded-full mb-6" style={{ width: 10, height: 10, background: CHERRY, boxShadow: `0 0 20px 5px ${CHERRY}` }} />
            <p className="font-heading text-white font-bold" style={{ fontSize: 'clamp(1.6rem,5vw,2.8rem)', letterSpacing: '-0.01em' }}>
              Bound for <span className="text-primary">life.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* generational year markers */}
      <AnimatePresence>
        {(phase === 'constellation' || phase === 'words') && (
          <EraMarkers key="eras" markers={ERA_MARKERS} base={layout.base} />
        )}
      </AnimatePresence>

      {/* LOVE / CHARITY / ESTEEM emerging from the network */}
      <AnimatePresence>
        {phase === 'words' && <WordsBeat key="words" words={PRINCIPLES.map((p) => p.word)} cherry={CHERRY} dur={DURATIONS.words} />}
      </AnimatePresence>

      {/* triangle copy — below the apex so it doesn't fight the TKE mark */}
      <AnimatePresence>
        {phase === 'triangle' && (
          <motion.div key="tri-copy" className="absolute inset-x-0 bottom-[6%] flex items-center justify-center text-center px-6 pointer-events-none z-[5]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TriangleCopy dur={DURATIONS.triangle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* principle corner labels */}
      <AnimatePresence>
        {phase === 'principles' && (
          <PrincipleCorners key="corners" V={layout.V} principles={PRINCIPLES} wave={wave} cherry={CHERRY} />
        )}
      </AnimatePresence>

      {/* portal flash → hero */}
      <AnimatePresence>
        {phase === 'portal' && (
          <motion.div key="flash" className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${CHERRY}, #120607 70%)` }}
            initial={{ opacity: 0, scale: 0.2 }} animate={{ opacity: [0, 0.9, 1], scale: 3 }}
            transition={{ duration: DURATIONS.portal / 1000, ease: 'easeIn' }} />
        )}
      </AnimatePresence>

      {/* film grain */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }} />

      {/* skip */}
      <button
        onClick={finish}
        className="absolute bottom-6 right-6 z-10 rounded-full px-4 py-2 text-[11px] tracking-[0.25em] uppercase font-semibold text-white/55 hover:text-white border border-white/15 hover:border-white/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Skip intro ›
      </button>
    </div>,
    document.body
  );
}

/* ── a single floating "memory" ─────────────────────────────────────── */
function Memory({ index, mem, pos, tri, phase, size, sx, sy, wave, dbg }) {
  const inTriangle = phase === 'triangle' || phase === 'principles';
  // Layered parallax while the constellation floats; damped to the thread
  // layer's strength once the triangle forms, so photos stay on their edges.
  const mult = pos.layer === 0 ? 26 : pos.layer === 1 ? 15 : 8;
  const multRef = useRef(mult);
  multRef.current = inTriangle ? 10 : mult;
  const px = useTransform(sx, (v) => v * multRef.current);
  const py = useTransform(sy, (v) => v * multRef.current);
  const [hover, setHover] = useState(false);

  const visibleConnect = index < 3;
  const lit = phase === 'principles' && wave === mem.group;

  let target;
  if (phase === 'spark') target = { x: 0, y: 0, scale: 0.5, opacity: 0, rotate: 0 };
  else if (phase === 'connect') target = visibleConnect ? { x: pos.x, y: pos.y, scale: pos.scale, opacity: 1, rotate: 0 } : { x: 0, y: 0, scale: 0.5, opacity: 0, rotate: 0 };
  else if (phase === 'constellation' || phase === 'words') target = { x: pos.x, y: pos.y, scale: pos.scale, opacity: 1, rotate: 0 };
  else if (inTriangle) target = { x: tri.x, y: tri.y, scale: lit ? 0.58 : 0.46, opacity: 1, rotate: tri.rot };
  else target = { x: 0, y: 0, scale: 0.12, opacity: 0, rotate: 0 }; // arch / portal

  const spring = inTriangle
    ? { type: 'spring', stiffness: 55, damping: 16, mass: 0.9 }
    : { duration: phase === 'arch' || phase === 'portal' ? 0.7 : 1.0, ease: [0.16, 1, 0.3, 1] };

  return (
    <motion.div
      className="absolute"
      style={{ left: 0, top: 0, marginLeft: -size / 2, marginTop: -(size * 0.66) / 2, zIndex: pos.layer === 0 ? 30 : pos.layer === 1 ? 20 : 10 }}
      initial={dbg ? false : { x: 0, y: 0, scale: 0.5, opacity: 0, rotate: 0 }}
      animate={target}
      transition={spring}
    >
      <motion.div style={{ x: px, y: py }}>
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="relative rounded-md overflow-hidden"
          style={{
            width: size, height: size * 0.66, willChange: 'transform',
            boxShadow: lit || hover
              ? `0 10px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(214,42,30,0.6), 0 0 26px rgba(214,42,30,0.45)`
              : inTriangle
                ? '0 10px 30px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.3)'
                : '0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.12)',
            transition: 'box-shadow 0.4s ease',
          }}
        >
          <img src={mem.thumb} alt={mem.alt} loading={mem.importance ? 'eager' : 'lazy'} decoding="async"
            className="absolute inset-0 h-full w-full object-cover" />
          {/* edge vignette + glass reflection (kept light so the photo reads;
              global film grain is applied once at the overlay level) */}
          <div aria-hidden="true" className="absolute inset-0" style={{ boxShadow: 'inset 0 0 12px rgba(0,0,0,0.28)' }} />
          <div aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), transparent 45%)' }} />
          {(mem.caption || mem.year) && hover && (
            <div className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] text-white/90 bg-gradient-to-t from-black/70 to-transparent">
              {mem.caption}{mem.caption && mem.year ? ' · ' : ''}{mem.year || ''}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── the TKE wordmark ───────────────────────────────────────────────── */
/* Hand-traced SVG letterforms that echo the official TKE mark: heavy
   collegiate letters with flared serifs, white with a dark keyline, on a
   slight forward slant — no webfont added. Drawn on a 100-unit-high grid
   (T=84, K=100, E=76 wide; 18-unit gaps → 296 total). */
const TKE_PATHS = [
  { d: 'M0 0H84V14L70 36L62 26H57V78L66 90V100H18V90L27 78V26H22L14 36L0 14Z', dx: 0 },
  { d: 'M0 0H52L38 14V40L66 12L62 0H100L84 14L60 48L94 86L100 100H62L66 88L46 62L38 68V86L52 100H0L8 88V12Z', dx: 102 },
  { d: 'M0 0H76V22L60 12H36V40H52L62 30V70L52 52H36V88H60L76 78V100H0L10 88V12Z', dx: 220 },
];

function TkeWordmark({ layout, dbg }) {
  const { V, side } = layout;
  // Sized to fill the upper band of the triangle edge-to-edge, like the logo.
  const w = side * 0.68;
  const h = (w * 100) / 296;
  const top = V.tl.y + side * 0.08;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: -w / 2, top, width: w, height: h, zIndex: 40, filter: 'drop-shadow(0 10px 32px rgba(0,0,0,0.7))' }}
      initial={dbg ? false : { opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg viewBox="-16 -8 328 116" width="100%" height="100%" role="img" aria-label="TKE" className="overflow-visible">
        <g transform="translate(6 0) skewX(-7)" fill="#fff" stroke="#141011" strokeWidth="5"
          paintOrder="stroke" strokeLinejoin="miter" strokeMiterlimit="6">
          {TKE_PATHS.map((p, i) => (
            <path key={i} d={p.d} transform={`translate(${p.dx} 0)`} />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}

/* ── threads (SVG, center-origin) ───────────────────────────────────── */
function Threads({ layout, phase, sx, sy, cherry, dbg }) {
  const px = useTransform(sx, (v) => v * 10);
  const py = useTransform(sy, (v) => v * 10);
  const { memories, edges, pairs, arch } = layout;
  const web = phase === 'constellation' || phase === 'words';
  const tri = phase === 'triangle' || phase === 'principles';
  const archPhase = phase === 'arch' || phase === 'portal';
  const archD = `M ${-arch.aw} ${arch.ab} C ${-arch.aw} ${arch.atop}, ${arch.aw} ${arch.atop}, ${arch.aw} ${arch.ab}`;

  return (
    <motion.svg
      aria-hidden="true"
      className="absolute pointer-events-none overflow-visible"
      style={{ left: 0, top: 0, x: px, y: py }}
      width="1" height="1" viewBox="0 0 1 1"
    >
      {/* first connections */}
      {phase === 'connect' && memories.slice(0, 3).map((m, i) => (
        <motion.line key={`c${i}`} x1="0" y1="0" x2={m.x} y2={m.y} stroke={cherry} strokeWidth="1.2"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.8, delay: i * 0.25, ease: 'easeOut' }} />
      ))}

      {/* living web */}
      {web && pairs.map(([i, j], k) => (
        <motion.line key={`w${k}`} x1={memories[i].x} y1={memories[i].y} x2={memories[j].x} y2={memories[j].y}
          stroke={cherry} strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 0.9, delay: 0.1 + (k % 6) * 0.06, ease: 'easeOut' }} />
      ))}

      {/* triangle edges */}
      {tri && edges.map(([p, q], i) => (
        <motion.line key={`e${i}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={cherry} strokeWidth="1.6"
          initial={dbg ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 0.9, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${cherry})` }} />
      ))}

      {/* gateway arch — one continuous line */}
      {archPhase && (
        <>
          <motion.path d={archD} fill="none" stroke={cherry} strokeWidth="1.8" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${cherry})` }} />
          {/* portal at the apex */}
          {phase === 'portal' && (
            <motion.circle cx="0" cy={arch.atop} r={arch.aw * 0.5} fill={cherry}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }} style={{ filter: `drop-shadow(0 0 24px ${cherry})` }} />
          )}
        </>
      )}
    </motion.svg>
  );
}

/* ── drifting particles ─────────────────────────────────────────────── */
function Particles({ count }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, left: rand(i + 3) * 100, size: 1 + rand(i + 6) * 2.2, dur: 9 + rand(i + 9) * 9,
    delay: rand(i + 12) * 8, drift: (rand(i + 15) - 0.5) * 60, red: rand(i + 21) > 0.6,
  })), [count]);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {bits.map((b) => (
        <motion.span key={b.id} className="absolute rounded-full"
          style={{ left: `${b.left}%`, bottom: '-3%', width: b.size, height: b.size,
            background: b.red ? 'rgba(214,42,30,0.7)' : 'rgba(200,204,210,0.5)' }}
          initial={{ y: 0, opacity: 0 }} animate={{ y: '-106vh', x: b.drift, opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.8, 1] }} />
      ))}
    </div>
  );
}

/* ── generational year markers, engraved into depth ─────────────────── */
function EraMarkers({ markers, base }) {
  const spots = [
    { x: -0.34, y: -0.3, s: 0.7 }, { x: 0.36, y: -0.16, s: 0.55 },
    { x: -0.3, y: 0.32, s: 0.6 }, { x: 0.32, y: 0.34, s: 0.8 },
  ];
  return (
    <div aria-hidden="true" className="absolute left-1/2 top-1/2 pointer-events-none" style={{ width: 0, height: 0 }}>
      {markers.map((m, i) => (
        <motion.span key={m} className="absolute font-heading font-bold text-outline-light select-none leading-none"
          style={{ left: spots[i % 4].x * base, top: spots[i % 4].y * base, fontSize: `${spots[i % 4].s * (base * 0.16)}px`, color: 'transparent', opacity: 0.0 }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.16, 0] }}
          transition={{ duration: 2.4, delay: 0.4 + i * 0.7, ease: 'easeInOut' }}>
          {m}
        </motion.span>
      ))}
    </div>
  );
}

/* ── LOVE / CHARITY / ESTEEM emerge from the lines (once each) ───────── */
function WordsBeat({ words, cherry, dur }) {
  const per = (dur / 1000) / words.length;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {words.map((w, i) => (
        <motion.div key={w} className="absolute flex flex-col items-center"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: per, delay: i * per, times: [0, 0.25, 0.7, 1] }}>
          <motion.span className="font-heading font-bold text-white" style={{ fontSize: 'clamp(2rem,7vw,4.5rem)', letterSpacing: '0.04em' }}
            initial={{ y: 14 }} animate={{ y: 0 }} transition={{ duration: per * 0.6, delay: i * per, ease: [0.16, 1, 0.3, 1] }}>
            {w}
          </motion.span>
          <motion.span className="block h-px mt-3" style={{ background: cherry, boxShadow: `0 0 8px ${cherry}` }}
            initial={{ width: 0 }} animate={{ width: ['0%', '60%', '60%', '0%'] }}
            transition={{ duration: per, delay: i * per }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ── triangle center copy ───────────────────────────────────────────── */
function TriangleCopy({ dur }) {
  const [second, setSecond] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSecond(true), dur * 0.5); return () => clearTimeout(t); }, [dur]);
  return (
    <AnimatePresence mode="wait">
      <motion.p key={second ? 'b' : 'a'} className="font-heading font-bold text-white"
        style={{ fontSize: 'clamp(1.1rem,3vw,1.9rem)', letterSpacing: '-0.01em', textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
        {second ? <>Bound for <span className="text-primary">life.</span></> : 'Not joined for a moment.'}
      </motion.p>
    </AnimatePresence>
  );
}

/* ── principle corner labels ────────────────────────────────────────── */
function PrincipleCorners({ V, principles, wave, cherry }) {
  const verts = [V.tl, V.tr, V.apex];
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ width: 0, height: 0 }}>
      {principles.map((p, i) => {
        const on = wave === p.group;
        return (
          <motion.div key={p.word} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: verts[i].x, top: verts[i].y }}
            initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0.5 }} transition={{ duration: 0.4 }}>
            <motion.span className="rounded-full mb-2" style={{ width: 10, height: 10, background: cherry }}
              animate={{ boxShadow: on ? `0 0 26px 6px ${cherry}` : `0 0 8px 1px ${cherry}`, scale: on ? 1.3 : 1 }}
              transition={{ duration: 0.4 }} />
            <span className="font-heading font-bold text-white text-xs sm:text-sm tracking-[0.25em]">{p.word}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
