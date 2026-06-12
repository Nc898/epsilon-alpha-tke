import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ children, delay = 0, y = 32, className, as = 'div' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
