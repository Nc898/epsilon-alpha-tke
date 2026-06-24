import { Building2 } from 'lucide-react';

function SponsorLogo({ sponsor, duplicate = false }) {
  const content = sponsor.logo ? (
    <img src={sponsor.logo} alt={duplicate ? '' : sponsor.name} loading="lazy" decoding="async" className="max-h-12 max-w-[170px] object-contain" />
  ) : (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Building2 className="h-5 w-5" />
      <span className="whitespace-nowrap text-sm font-semibold">{sponsor.name}</span>
    </div>
  );

  const className = 'flex h-24 min-w-[220px] items-center justify-center rounded-2xl border border-border bg-card px-7 grayscale transition-all hover:border-primary/30 hover:grayscale-0';

  if (sponsor.website) {
    return (
      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className={className} aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined}>
        {content}
      </a>
    );
  }

  return <div className={className} aria-hidden={duplicate || undefined}>{content}</div>;
}
export default function SponsorLogoRail({ sponsors }) {
  if (!sponsors.length) return null;
  const shouldRotate = sponsors.length > 1;

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className={`flex w-max gap-5 py-2 ${shouldRotate ? 'animate-marquee' : 'mx-auto'}`} style={shouldRotate ? { animationDuration: '36s' } : undefined}>
        {sponsors.map((sponsor) => <SponsorLogo key={sponsor.id} sponsor={sponsor} />)}
        {shouldRotate && sponsors.map((sponsor) => <SponsorLogo key={`duplicate-${sponsor.id}`} sponsor={sponsor} duplicate />)}
      </div>
    </div>
  );
}
