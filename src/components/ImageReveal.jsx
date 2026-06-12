import { motion, useReducedMotion } from 'framer-motion';

/**
 * Curtain reveal for images: clip-path opens top-to-bottom while the image
 * settles from a slight overscale. Static for reduced motion.
 */
export default function ImageReveal({ children, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={`overflow-hidden ${className ?? ''}`}>{children}</div>;

  return (
    <motion.div
      className={`overflow-hidden ${className ?? ''}`}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
    >
      <motion.div
        className="h-full"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
