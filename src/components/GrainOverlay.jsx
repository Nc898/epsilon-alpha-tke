// Static film-grain overlay — one fixed div site-wide. SVG turbulence noise,
// no animation (animated grain costs real frame budget for little gain).
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{ backgroundImage: `url("${NOISE}")`, opacity: 0.05, mixBlendMode: 'overlay' }}
    />
  );
}
