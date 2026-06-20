import { useId } from 'react';
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/**
 * Scroll-velocity directional motion blur.
 *
 * Wraps its children and applies a *vertical* Gaussian blur whose strength
 * scales with how fast the page is scrolling — the "speed blur" you see on
 * award-grade sites. Uses an SVG filter (directional, unlike CSS `blur()`
 * which is isotropic) with an expanded filter region so the blur isn't clipped
 * at the element edges. A spring smooths the velocity so the blur eases in/out
 * instead of snapping. Disabled entirely for reduced-motion users.
 *
 *   <ScrollBlur max={7}><PhotoGrid /></ScrollBlur>
 */
export default function ScrollBlur({ children, max = 6, className }) {
  const reduce = useReducedMotion();
  const filterId = `scrollblur-${useId().replace(/[:]/g, '')}`;

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 250, damping: 42, mass: 0.6 });
  // Symmetric map: blur grows with |velocity| in either direction, capped.
  const amount = useTransform(smooth, [-4000, 0, 4000], [max, 0, max], { clamp: true });
  const stdDeviation = useTransform(amount, (a) => `0 ${a.toFixed(2)}`);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <>
      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter
            id={filterId}
            x="-5%"
            y="-25%"
            width="110%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <motion.feGaussianBlur in="SourceGraphic" stdDeviation={stdDeviation} />
          </filter>
        </defs>
      </svg>
      <div className={className} style={{ filter: `url(#${filterId})`, willChange: 'filter' }}>
        {children}
      </div>
    </>
  );
}
