import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Wraps a CTA so it subtly pulls toward the cursor. No-op for reduced motion
 * (and harmless on touch, where mousemove never fires).
 */
export default function Magnetic({ children, strength = 0.22, className }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 280, damping: 18, mass: 0.5 });

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
