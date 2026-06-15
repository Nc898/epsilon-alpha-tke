import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

const LAST_UPDATED = 'June 15, 2026';

const SECTIONS = [
  {
    heading: 'Agreement to these terms',
    body: (
      <p>
        This website is operated by the Epsilon Alpha Chapter of Tau Kappa Epsilon at Saint Louis
        University ("TKE Epsilon Alpha," "we," "us," or "our"). By using this site — including
        registering for events, making a donation, or submitting the contact form — you agree to
        these Terms of Service. If you don't agree, please don't use the site.
      </p>
    ),
  },
  {
    heading: 'Use of this site',
    body: (
      <>
        <p>
          This site is provided for chapter members, alumni, families, prospective members, and
          the public to learn about TKE Epsilon Alpha, register for events, and support our
          philanthropy. You agree to use it only for lawful purposes and not to:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li>Provide false information when registering for an event or contacting us.</li>
          <li>Attempt to access admin areas, accounts, or data you're not authorized to access.</li>
          <li>Interfere with the site's operation or security (e.g. scraping, attacking, or overloading it).</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Event registration & payments',
    body: (
      <>
        <p>
          Some events, such as the TKE for St. Jude Car Show, require registration and a paid
          entry fee. Payments are processed securely by Stripe — see our{' '}
          <Link to="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
            Privacy Policy
          </Link>{' '}
          for how payment information is handled. By registering, you confirm that the
          information you provide (including vehicle details, where applicable) is accurate.
        </p>
        <p className="mt-3">
          <strong className="text-foreground">Refunds:</strong> registration fees and donations
          are generally non-refundable. If we cancel an event outright, we'll refund paid
          registrants or offer a credit toward a future event.
        </p>
      </>
    ),
  },
  {
    heading: 'Donations',
    body: (
      <p>
        Donations made through this site benefit St. Jude Children's Research Hospital and/or
        TKE Epsilon Alpha's philanthropic activities, and are processed through the TKE
        Educational Foundation, a 501(c)(3) tax-exempt organization. Donations may be
        tax-deductible to the extent allowed by law — please keep your Stripe receipt for your
        records and consult a tax professional regarding your specific situation.
      </p>
    ),
  },
  {
    heading: 'Attending or participating in chapter events',
    body: (
      <p>
        Chapter events (such as the car show, philanthropy events, or alumni gatherings) take
        place in person and may involve inherent risks — including risk of injury, accident, or
        property damage. By registering for or attending an event, you voluntarily assume those
        risks. To the fullest extent permitted by law, TKE Epsilon Alpha, its members, officers,
        Tau Kappa Epsilon Fraternity (national), and Saint Louis University are not liable for
        injury, loss, or damage arising from your participation, except where caused by our gross
        negligence or willful misconduct. Some events may require a separate written waiver,
        which will be provided at registration or check-in if applicable.
      </p>
    ),
  },
  {
    heading: 'Content & intellectual property',
    body: (
      <>
        <p>
          The text, photos, logos, and design of this site belong to TKE Epsilon Alpha or our
          licensors (including Tau Kappa Epsilon Fraternity's name, crest, and trademarks, used
          with permission). You may view and share pages of this site for personal,
          non-commercial purposes, but you may not reproduce, redistribute, or use our logos,
          photos, or content for commercial purposes without our written permission.
        </p>
        <p className="mt-3">
          Photos displayed in our gallery and Instagram feed depict chapter members, alumni, and
          guests at chapter events. If you'd like a photo of you removed, contact us using the
          details below.
        </p>
      </>
    ),
  },
  {
    heading: 'Third-party links',
    body: (
      <p>
        This site links to third-party services (including Instagram, St. Jude's donation page,
        and Stripe's checkout). We aren't responsible for the content, policies, or practices of
        these third-party sites — please review their own terms and privacy policies.
      </p>
    ),
  },
  {
    heading: '"As is" and limitation of liability',
    body: (
      <p>
        This site and its content are provided "as is," without warranties of any kind, express
        or implied. We do our best to keep information (event dates, schedules, contact details)
        accurate and up to date, but we don't guarantee it. To the fullest extent permitted by
        law, TKE Epsilon Alpha and its members are not liable for any indirect, incidental, or
        consequential damages arising from your use of this site.
      </p>
    ),
  },
  {
    heading: 'Changes to these terms',
    body: (
      <p>
        We may update these Terms as the site evolves. We'll update the "last updated" date below
        when we do. Continued use of the site after a change means you accept the updated Terms.
      </p>
    ),
  },
  {
    heading: 'Governing law',
    body: (
      <p>
        These Terms are governed by the laws of the State of Missouri, without regard to conflict
        of law principles, and any disputes will be resolved in the state or federal courts
        located in St. Louis, Missouri.
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <p>
        Questions about these Terms? Email us at{' '}
        <a href="mailto:slutkestewardship@gmail.com" className="text-primary underline underline-offset-2 hover:text-primary/80">
          slutkestewardship@gmail.com
        </a>{' '}
        or visit our{' '}
        <Link to="/contact" className="text-primary underline underline-offset-2 hover:text-primary/80">contact page</Link>
        .
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <div className="pt-24">
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        watermark="ΤΚΕ"
        lead="The rules and disclosures that apply when you use this site, register for events, or donate."
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
