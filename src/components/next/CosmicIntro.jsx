import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';

/**
 * Cinematic "cosmic descent" intro for /home-next:
 *   warp starfield → glowing Earth → HUD wayfinding (UNITED STATES → MISSOURI →
 *   ST. LOUIS → SAINT LOUIS UNIVERSITY, with live coordinates) → arrival on the
 *   SLU gate photo → white-hot flash that reveals the forge hero beneath.
 * One run per browser session; reduced-motion users skip straight to the page.
 */
const STAGES = [
  { at: 0.30, name: 'UNITED STATES' },
  { at: 0.48, name: 'MISSOURI' },
  { at: 0.62, name: 'ST. LOUIS' },
  { at: 0.76, name: 'SAINT LOUIS UNIVERSITY' },
];

const PLANET = {
  borderRadius: '9999px',
  background: 'radial-gradient(circle at 36% 30%, #531a13, #1c0809 52%, #0c0405 73%)',
  boxShadow:
    'inset -18px -10px 70px rgba(0,0,0,0.9), inset 12px 8px 46px rgba(214,42,30,0.18), 0 0 90px 14px rgba(214,42,30,0.22)',
};

export default function CosmicIntro() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('tke-cosmic-seen') === '1'
  );
  const [stage, setStage] = useState('EARTH');
  const progress = useMotionValue(0);
  const overlayO = useMotionValue(1);
  const canvasRef = useRef(null);
  const coordsRef = useRef(null);

  const globeScale = useTransform(progress, [0.04, 0.3, 0.78, 0.9], [0.12, 1, 1.75, 2.6]);
  const globeOpacity = useTransform(progress, [0.04, 0.16, 0.72, 0.84], [0, 1, 1, 0]);
  const surfaceRotate = useTransform(progress, [0, 1], [-30, 70]);
  const reticleO = useTransform(progress, [0.28, 0.34, 0.72, 0.8], [0, 1, 1, 0]);
  const reticleScale = useTransform(progress, [0.28, 0.8], [1.8, 0.7]);
  const photoO = useTransform(progress, [0.76, 0.86, 1], [0, 1, 1]);
  const photoScale = useTransform(progress, [0.76, 1], [1.32, 1.06]);
  const flashO = useTransform(progress, [0.9, 0.965, 1], [0, 0.96, 1]);
  const hudO = useTransform(progress, [0.08, 0.16, 0.86, 0.92], [0, 1, 1, 0]);
  const starsO = useTransform(progress, [0.66, 0.8], [1, 0]);

  const finish = () => {
    try { sessionStorage.setItem('tke-cosmic-seen', '1'); } catch { /* private mode */ }
    setDone(true);
  };

  // timeline
  useEffect(() => {
    if (done) return;
    if (reduce) { finish(); return; }
    const unsub = progress.on('change', (v) => {
      let name = 'EARTH';
      for (const s of STAGES) if (v >= s.at) name = s.name;
      setStage((prev) => (prev === name ? prev : name));
      const t = Math.min(Math.max((v - 0.28) / 0.5, 0), 1);
      const la = 41.4 + (38.627 - 41.4) * t;
      const ln = -96.2 + (-90.231 + 96.2) * t;
      if (coordsRef.current) coordsRef.current.textContent =
        `${la.toFixed(4)}° N · ${Math.abs(ln).toFixed(4)}° W`;
    });
    const controls = animate(progress, 1, {
      duration: 6.4,
      ease: [0.5, 0, 0.25, 1],
      onComplete: () => animate(overlayO, 0, { duration: 0.55, ease: 'easeOut', onComplete: finish }),
    });
    return () => { controls.stop(); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, reduce]);

  // warp starfield
  useEffect(() => {
    if (done || reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, raf;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);
    const N = 460;
    const stars = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: Math.random() * w,
    }));
    const draw = () => {
      const p = progress.get();
      const speed = (1.5 + p * 70) * dpr;
      ctx.fillStyle = 'rgba(5,3,4,0.32)';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      for (const s of stars) {
        const z0 = s.z;
        s.z -= speed;
        if (s.z < 1) { s.z = w; s.x = (Math.random() - 0.5) * w; s.y = (Math.random() - 0.5) * h; }
        const k = 220 * dpr / s.z, k0 = 220 * dpr / z0;
        const d = 1 - s.z / w;
        const g = 200 + Math.floor(40 * (1 - p));
        ctx.strokeStyle = `rgba(255,${g},${160},${d})`;
        ctx.lineWidth = Math.max(d * 2.2 * dpr, 0.4);
        ctx.beginPath();
        ctx.moveTo(s.x * k0, s.y * k0);
        ctx.lineTo(s.x * k, s.y * k);
        ctx.stroke();
      }
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, reduce]);

  if (done) return null;

  return (
    <motion.div style={{ opacity: overlayO }} className="fixed inset-0 z-[200] bg-[#050304] overflow-hidden">
      <motion.div style={{ opacity: starsO }} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </motion.div>

      {/* Earth */}
      <motion.div style={{ scale: globeScale, opacity: globeOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ width: '46vmin', height: '46vmin' }}>
          <div className="absolute inset-0" style={PLANET} />
          {/* rotating surface highlight (sells the spin) */}
          <motion.div style={{ rotate: surfaceRotate }} className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(115deg, transparent 40%, rgba(255,120,60,0.12) 52%, transparent 64%)' }} />
          </motion.div>
          {/* atmosphere rim */}
          <div className="absolute -inset-[6%] rounded-full pointer-events-none"
            style={{ boxShadow: '0 0 60px 6px rgba(214,42,30,0.35), inset 0 0 40px rgba(255,140,80,0.18)' }} />
        </div>
      </motion.div>

      {/* targeting reticle */}
      <motion.div style={{ opacity: reticleO, scale: reticleScale }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[34vmin] h-[34vmin]">
          <div className="absolute inset-0 rounded-full border border-primary/50" />
          <div className="absolute inset-[18%] rounded-full border border-primary/30" />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/30" />
          <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-primary/30" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_16px_4px_rgba(214,42,30,0.8)]" />
        </div>
      </motion.div>

      {/* SLU gate arrival */}
      <motion.div style={{ opacity: photoO }} className="absolute inset-0 overflow-hidden">
        <motion.img src="/assets/slu-gate.jpg" alt="" aria-hidden="true"
          style={{ scale: photoScale }} className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, transparent 35%, rgba(5,3,4,0.65))' }} />
      </motion.div>

      {/* HUD wayfinding */}
      <motion.div style={{ opacity: hudO }} className="absolute inset-x-0 bottom-[13%] text-center px-4 pointer-events-none">
        <p className="font-heading text-white font-bold tracking-tight leading-none"
          style={{ fontSize: 'clamp(1.4rem, 5vw, 3rem)', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          {stage}
        </p>
        <p ref={coordsRef} className="text-primary/80 text-[11px] sm:text-sm tracking-[0.25em] mt-3 font-semibold"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          41.4000° N · 96.2000° W
        </p>
        <div className="mx-auto mt-4 h-px w-24 sm:w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </motion.div>

      {/* white-hot flash that hands off to the forge */}
      <motion.div style={{ opacity: flashO }} className="absolute inset-0 pointer-events-none bg-white" />

      <button onClick={finish}
        className="absolute bottom-6 right-6 z-10 text-white/45 hover:text-white text-[11px] tracking-[0.25em] uppercase font-semibold transition-colors">
        Skip ›
      </button>
    </motion.div>
  );
}
