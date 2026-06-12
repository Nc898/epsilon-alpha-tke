import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

const LAST_UPDATED = 'June 12, 2026';

const SECTIONS = [
  {
    heading: 'Who we are',
    body: (
      <>
        <p>
          This website is operated by the Epsilon Alpha Chapter of Tau Kappa Epsilon at Saint
          Louis University ("TKE Epsilon Alpha," "we," "us," or "our"). This policy explains what
          information we collect through this site, how we use it, and how you can contact us
          about it.
        </p>
      </>
    ),
  },
  {
    heading: 'Information we collect',
    body: (
      <>
        <p>We collect information directly from you when you interact with the site:</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>
            <strong className="text-foreground">Event registration (e.g. car show signup):</strong>{' '}
            name, email address, phone number, vehicle information (year, make, model, class),
            and donation amount.
          </li>
          <li>
            <strong className="text-foreground">Payments:</strong> when you register or donate,
            payment is processed by Stripe. We do not collect or store your card number, bank
            details, or other payment credentials — Stripe handles that directly and shares with
            us only the information needed to confirm your registration (e.g. amount paid and
            payment status).
          </li>
          <li>
            <strong className="text-foreground">Contact form:</strong> name, email address, and
            the message you send us.
          </li>
          <li>
            <strong className="text-foreground">Email updates:</strong> if you sign up for event
            reminders or chapter news, we collect your email address to send those messages.
          </li>
          <li>
            <strong className="text-foreground">Member directory:</strong> names, photos, and
            roles of current chapter members may be displayed publicly on this site. This
            information is provided by the chapter, not collected from site visitors.
          </li>
        </ul>
        <p className="mt-3">
          We do not currently use cookies, advertising trackers, or third-party analytics. If we
          add analytics in the future (such as Vercel Analytics), we'll update this policy.
        </p>
      </>
    ),
  },
  {
    heading: 'How we use your information',
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>To process and confirm event registrations and donations.</li>
        <li>To send confirmation emails and event reminders you've signed up for.</li>
        <li>To respond to messages sent through the contact form.</li>
        <li>To plan and run chapter events (e.g. contacting registrants about the car show).</li>
      </ul>
    ),
  },
  {
    heading: 'Who we share it with',
    body: (
      <>
        <p>We don't sell your information. We share it only with the services that help us run this site:</p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li><strong className="text-foreground">Stripe</strong> — payment processing for registrations and donations.</li>
          <li><strong className="text-foreground">Supabase</strong> — secure database storage for registration and contact form data.</li>
          <li><strong className="text-foreground">Resend</strong> — sending confirmation and reminder emails.</li>
          <li><strong className="text-foreground">Vercel</strong> — website hosting.</li>
        </ul>
        <p className="mt-3">
          Each of these providers processes data only as needed to provide their service to us
          and is bound by their own privacy and security practices.
        </p>
      </>
    ),
  },
  {
    heading: 'Data retention',
    body: (
      <p>
        We keep registration and contact records for as long as needed for chapter recordkeeping
        (e.g. event history, donation tracking) and to comply with our national fraternity's
        requirements. You can ask us to delete your information at any time — see "Your choices"
        below.
      </p>
    ),
  },
  {
    heading: 'Your choices',
    body: (
      <p>
        You can ask us to access, correct, or delete the personal information we hold about you,
        or to stop sending you emails, by contacting us at{' '}
        <a href="mailto:tke.epsilonalpha@slu.edu" className="text-primary underline underline-offset-2 hover:text-primary/80">
          tke.epsilonalpha@slu.edu
        </a>
        . We'll respond as soon as we're able.
      </p>
    ),
  },
  {
    heading: "Children's privacy",
    body: (
      <p>
        This site is intended for college students, alumni, families, and members of the public
        interested in our chapter and philanthropy events. We do not knowingly collect
        information from children under 13.
      </p>
    ),
  },
  {
    heading: 'Changes to this policy',
    body: (
      <p>
        We may update this policy as the site evolves (for example, if we add analytics or new
        features). We'll update the "last updated" date below when we do.
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <p>
        Questions about this policy or your information? Email us at{' '}
        <a href="mailto:tke.epsilonalpha@slu.edu" className="text-primary underline underline-offset-2 hover:text-primary/80">
          tke.epsilonalpha@slu.edu
        </a>{' '}
        or visit our{' '}
        <Link to="/contact" className="text-primary underline underline-offset-2 hover:text-primary/80">contact page</Link>
        .
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="pt-24">
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        watermark="ΤΚΕ"
        lead="How TKE Epsilon Alpha collects, uses, and protects your information on this site."
        spin={null}
      />

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <div key={s.heading}>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-3">
                  {s.heading}
                </h2>
                <div className="text-muted-foreground leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
