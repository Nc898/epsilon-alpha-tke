import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

/**
 * Red dot + trailing ring cursor. Mounted only on fine pointers without
 * reduced motion — touch devices and reduced-motion users keep the native
 * cursor untouched.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 260, damping: 24, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 260, damping: 24, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const move = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    const over = (e) => {
      if (e.target.closest(INTERACTIVE)) setHovering(true);
    };
    const out = (e) => {
      if (e.target.closest(INTERACTIVE)) setHovering(false);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [mx, my]);

  if (!enabled) return null;

  return (
    <>
      <motion.div className="cc-dot" style={{ x: mx, y: my }} aria-hidden="true" />
      <motion.div
        className="cc-ring"
        style={{ x: rx, y: ry }}
        animate={{
          scale: pressed ? 0.8 : hovering ? 2.1 : 1,
          opacity: hovering ? 0.9 : 0.55,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
    </>
  );
}
