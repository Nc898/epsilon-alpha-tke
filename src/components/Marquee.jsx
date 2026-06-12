const DEFAULT_PHRASES = [
  'Better Men for a Better World',
  'Tau Kappa Epsilon — Epsilon Alpha',
  'Saint Louis University',
  'Proud Partners of St. Jude',
];

function Strip({ phrases }) {
  return (
    <div className="flex shrink-0 items-center">
      {phrases.map((p) => (
        <span
          key={p}
          className="flex items-center gap-8 sm:gap-12 whitespace-nowrap pr-8 sm:pr-12 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em]"
        >
          <span>{p}</span>
          <span className="text-primary-foreground/60">✦</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee({ phrases = DEFAULT_PHRASES }) {
  return (
    <div className="bg-primary text-primary-foreground py-3.5 overflow-hidden">
      <span className="sr-only">{phrases.join('. ')}.</span>
      {/* Strip rendered twice for a seamless -50% loop */}
      <div aria-hidden="true" className="flex w-max animate-marquee">
        <Strip phrases={phrases} />
        <Strip phrases={phrases} />
      </div>
    </div>
  );
}
