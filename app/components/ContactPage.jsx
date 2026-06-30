/**
 * Rich contact page. Renders inside the generic `pages.$handle` route when
 * the merchant's page handle is `contact` — we ignore the (empty) Shopify
 * body and lay out the contact channels, response-time promise, and FAQ
 * ourselves.
 *
 * Why no contact form: a working form needs a backend (Resend, Postmark,
 * Shopify Customer Note API, etc.) — none are wired up here. The honest
 * version of this page is "here's every way to reach us, pick one" with
 * the email address as a `mailto:` link. If the user later wires up an
 * email service, swap the email card's CTA for a form.
 *
 * Update `CONTACT_EMAIL` below if the support address changes — it's the
 * only place the address is hard-coded.
 */

import {
  IconCheck,
  IconInstagram,
  IconFacebook,
  IconTiktok,
  IconPackage,
} from '~/components/Icons';
import {SOCIAL_PROFILES} from '~/lib/brand';

/**
 * Support email. Used in:
 * - the email channel card (as a `mailto:` link)
 * - the meta description fallback (so search snippets can show it)
 *
 * Swap this string if the support address changes; the rest of the
 * component derives from it.
 */
const CONTACT_EMAIL = 'hello@puchica.ca';

/**
 * Find a social profile URL by domain substring. Returns `null` if the
 * platform isn't in the user's `SOCIAL_PROFILES` list — the channel card
 * is then hidden so we never link to a profile that doesn't exist.
 */
function socialUrl(matcher) {
  const profile = SOCIAL_PROFILES.find((u) => matcher.test(u));
  return profile || null;
}

/**
 * Derive a human-readable handle from a profile URL — what's shown
 * inside the channel card CTA. For most networks that's the last path
 * segment (e.g. `instagram.com/puchica.canada` → `@puchica.canada`).
 * Facebook share links are an exception: the path is a share id, not a
 * page slug, so we just show "Puchica" for those.
 */
function handleFromUrl(url, {facebook = false} = {}) {
  if (!url) return null;
  if (facebook) return 'Puchica';
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop();
    return last ? `@${last.replace(/^@/, '')}` : null;
  } catch {
    return null;
  }
}

const FAQ = [
  {
    q: 'Where is my order?',
    a: 'Your tracking link is in the shipping confirmation email — usually within 1–2 business days of ordering. If tracking shows no movement for 5+ business days, email us and we’ll chase it down.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Within 2 hours of placing it, yes — just reply to your order confirmation. After that the order is being prepared for shipment and changes aren’t possible, but returns are always free once it arrives.',
  },
  {
    q: 'How do returns work?',
    a: 'A pre-paid return label ships in every box. Repack the item, peel the label, drop it off. Refunds land on the original payment method within 5–7 business days of us receiving it.',
  },
  {
    q: 'Do you ship outside Canada and the US?',
    a: 'Right now, Canada and the US only. If you’re elsewhere and really want something, email us — we’ll see what we can do.',
  },
  {
    q: 'Are the products in the photos exactly what I get?',
    a: 'Yes. The product photos on each listing are the actual product we ship — what you see is what you get.',
  },
];

/* ---------- inline icons (not in the shared Icons module) ---------- */

function IconClock(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconArrowRight(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

/* ---------- the page ---------- */

export function ContactPage() {
  const instagram = socialUrl(/instagram\.com/);
  const facebook = socialUrl(/facebook\.com/);
  const tiktok = socialUrl(/tiktok\.com/);
  const igHandle = handleFromUrl(instagram);
  const fbHandle = handleFromUrl(facebook, {facebook: true});
  const tiktokHandle = handleFromUrl(tiktok);

  return (
    <div className="pk-contact">
      {/* Hero — same gradient language as the collection hero so the
       * site feels coherent. Uses --soft variant under 700px (smaller
       * padding handled by the .pk-col-hero media query already). */}
      <header className="pk-col-hero pk-contact__hero">
        <span className="pk-col-hero__glow" aria-hidden="true" />
        <span className="pk-col-hero__eyebrow">Get in touch</span>
        <h1 className="pk-col-hero__title">We&apos;re here to help.</h1>
        <p className="pk-col-hero__sub">
          Questions about an order, a product, or anything else? Pick the
          channel that works for you — a real person on the Puchica team will
          get back to you, usually within one business day.
        </p>
      </header>

      {/* Contact channels — three social cards, one per platform. Email
       * lives at the bottom of the page (the "Still have a question?"
       * CTA below) so the channel row stays uniform. */}
      <section className="pk-contact__channels" aria-label="Ways to reach us">
        {instagram ? (
          <article className="pk-contact-card">
            <div className="pk-contact-card__icon" aria-hidden="true">
              <IconInstagram size={22} />
            </div>
            <h2 className="pk-contact-card__title">DM on Instagram</h2>
            <p className="pk-contact-card__body">
              Fastest for a quick question. We check DMs throughout the day.
            </p>
            <a
              className="pk-contact-card__cta"
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {igHandle || 'Instagram'}
              <IconArrowRight />
            </a>
          </article>
        ) : null}

        {facebook ? (
          <article className="pk-contact-card">
            <div className="pk-contact-card__icon" aria-hidden="true">
              <IconFacebook size={22} />
            </div>
            <h2 className="pk-contact-card__title">Message on Facebook</h2>
            <p className="pk-contact-card__body">
              Another easy way to reach us. Same team, same response time.
            </p>
            <a
              className="pk-contact-card__cta"
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              {fbHandle || 'Facebook'}
              <IconArrowRight />
            </a>
          </article>
        ) : null}

        {tiktok ? (
          <article className="pk-contact-card">
            <div className="pk-contact-card__icon" aria-hidden="true">
              <IconTiktok size={22} />
            </div>
            <h2 className="pk-contact-card__title">Find us on TikTok</h2>
            <p className="pk-contact-card__body">
              New finds, behind-the-scenes, and the occasional unboxing.
            </p>
            <a
              className="pk-contact-card__cta"
              href={tiktok}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tiktokHandle || 'TikTok'}
              <IconArrowRight />
            </a>
          </article>
        ) : null}

        {/* X card removed: no X profile. If we add one later, the
         * pattern is identical to Instagram/Facebook/TikTok. */}
      </section>

      {/* What to expect — three short reassurance chips. Renders as a
       * flex row on desktop, wraps on mobile. */}
      <section className="pk-contact__promises" aria-label="What to expect">
        <h2 className="pk-contact__section-head">
          <span className="pk-contact__eyebrow">What to expect</span>
          <span className="pk-contact__title">Real people, fast replies</span>
        </h2>
        <ul className="pk-contact__promises-list">
          <li>
            <span className="pk-contact__promise-icon" aria-hidden="true">
              <IconCheck />
            </span>
            <div>
              <strong>Real person on the team</strong>
              <p>No bots, no auto-replies. Every message lands with a person.</p>
            </div>
          </li>
          <li>
            <span className="pk-contact__promise-icon" aria-hidden="true">
              <IconClock />
            </span>
            <div>
              <strong>Usually within one business day</strong>
              <p>Often faster. Worst case: one business day, weekdays 9–5 ET.</p>
            </div>
          </li>
          <li>
            <span className="pk-contact__promise-icon" aria-hidden="true">
              <IconPackage />
            </span>
            <div>
              <strong>Order help every day</strong>
              <p>Tracking questions, returns, address changes — yes, on weekends too.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* FAQ — single column, generous spacing, Q in violet accent. */}
      <section className="pk-contact__faq" aria-label="Common questions">
        <h2 className="pk-contact__section-head">
          <span className="pk-contact__eyebrow">Common questions</span>
          <span className="pk-contact__title">The short version</span>
        </h2>
        <div className="pk-contact__faq-list">
          {FAQ.map((item) => (
            <details key={item.q} className="pk-contact__faq-item">
              <summary>
                <span>{item.q}</span>
                <span className="pk-contact__faq-chev" aria-hidden="true">
                  <IconArrowRight />
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <p className="pk-contact__faq-foot">
          Don&apos;t see your question?{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>Email us</a> — we read
          everything.
        </p>
      </section>

      {/* Bottom CTA — final nudge, mirrors the hero. */}
      <section className="pk-contact__cta">
        <h2>Still have a question?</h2>
        <p>Drop us a line. We read every message and we&apos;re happy to help.</p>
        <a
          className="pk-btn pk-btn--primary"
          href={`mailto:${CONTACT_EMAIL}?subject=Hi%20Puchica%20team`}
        >
          Email {CONTACT_EMAIL}
          <IconArrowRight />
        </a>
      </section>
    </div>
  );
}

/* ---------- the page ---------- */