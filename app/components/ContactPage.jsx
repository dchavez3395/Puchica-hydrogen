/**
 * Rich contact page. Renders inside the generic `pages.$handle` route when
 * the merchant's page handle is `contact` — we ignore the (empty) Shopify
 * body and lay out the contact channels, support expectations, and FAQ
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
import {useT} from '~/lib/t';
import {useParams} from 'react-router';
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

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

/* ---------- inline icons (not in the shared Icons module) ---------- */

function IconClock(props) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconArrowRight(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

/* ---------- the page ---------- */

export function ContactPage() {
  const t = useT();
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return <ContainmentContact />;
  }
  const instagram = socialUrl(/instagram\.com/);
  const facebook = socialUrl(/facebook\.com/);
  const tiktok = socialUrl(/tiktok\.com/);
  const igHandle = handleFromUrl(instagram);
  const fbHandle = handleFromUrl(facebook, {facebook: true});
  const tiktokHandle = handleFromUrl(tiktok);

  // FAQ items — questions + answers come from the dictionary so the
  // "we ship anywhere" copy stays in sync with the about/contact
  // shipping-reach panel.
  const FAQ = [
    {q: t('contact_faq_1_q'), a: t('contact_faq_1_a')},
    {q: t('contact_faq_2_q'), a: t('contact_faq_2_a')},
    {q: t('contact_faq_3_q'), a: t('contact_faq_3_a')},
    {q: t('contact_faq_4_q'), a: t('contact_faq_4_a')},
    {q: t('contact_faq_5_q'), a: t('contact_faq_5_a')},
  ];

  return (
    <div className="pk-contact">
      {/* Hero — same gradient language as the collection hero so the
       * site feels coherent. Uses --soft variant under 700px (smaller
       * padding handled by the .pk-col-hero media query already). */}
      <header className="pk-col-hero pk-contact__hero">
        <span className="pk-col-hero__glow" aria-hidden="true" />
        <span className="pk-col-hero__eyebrow">
          {t('contact_hero_eyebrow')}
        </span>
        <h1 className="pk-col-hero__title">{t('contact_hero_title')}</h1>
        <p className="pk-col-hero__sub">{t('contact_hero_sub')}</p>
      </header>

      {/* Contact channels — three social cards, one per platform. Email
       * lives at the bottom of the page (the "Still have a question?"
       * CTA below) so the channel row stays uniform. */}
      <section
        className="pk-contact__channels"
        aria-label={t('contact_channels_aria')}
      >
        {instagram ? (
          <article className="pk-contact-card">
            <div className="pk-contact-card__icon" aria-hidden="true">
              <IconInstagram size={22} />
            </div>
            <h2 className="pk-contact-card__title">{t('contact_ig_title')}</h2>
            <p className="pk-contact-card__body">{t('contact_ig_body')}</p>
            <a
              className="pk-contact-card__cta"
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {igHandle || t('contact_ig_fallback')}
              <IconArrowRight />
            </a>
          </article>
        ) : null}

        {facebook ? (
          <article className="pk-contact-card">
            <div className="pk-contact-card__icon" aria-hidden="true">
              <IconFacebook size={22} />
            </div>
            <h2 className="pk-contact-card__title">{t('contact_fb_title')}</h2>
            <p className="pk-contact-card__body">{t('contact_fb_body')}</p>
            <a
              className="pk-contact-card__cta"
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              {fbHandle || t('contact_fb_fallback')}
              <IconArrowRight />
            </a>
          </article>
        ) : null}

        {tiktok ? (
          <article className="pk-contact-card">
            <div className="pk-contact-card__icon" aria-hidden="true">
              <IconTiktok size={22} />
            </div>
            <h2 className="pk-contact-card__title">
              {t('contact_tiktok_title')}
            </h2>
            <p className="pk-contact-card__body">{t('contact_tiktok_body')}</p>
            <a
              className="pk-contact-card__cta"
              href={tiktok}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tiktokHandle || t('contact_tiktok_fallback')}
              <IconArrowRight />
            </a>
          </article>
        ) : null}

        {/* X card removed: no X profile. If we add one later, the
         * pattern is identical to Instagram/Facebook/TikTok. */}
      </section>

      {/* What to expect — three short reassurance chips. Renders as a
       * flex row on desktop, wraps on mobile. */}
      <section
        className="pk-contact__promises"
        aria-label={t('contact_promises_aria')}
      >
        <h2 className="pk-contact__section-head">
          <span className="pk-contact__eyebrow">
            {t('contact_promises_eyebrow')}
          </span>
          <span className="pk-contact__title">
            {t('contact_promises_title')}
          </span>
        </h2>
        <ul className="pk-contact__promises-list">
          <li>
            <span className="pk-contact__promise-icon" aria-hidden="true">
              <IconCheck />
            </span>
            <div>
              <strong>{t('contact_promise_1_strong')}</strong>
              <p>{t('contact_promise_1_body')}</p>
            </div>
          </li>
          <li>
            <span className="pk-contact__promise-icon" aria-hidden="true">
              <IconClock />
            </span>
            <div>
              <strong>{t('contact_promise_2_strong')}</strong>
              <p>{t('contact_promise_2_body')}</p>
            </div>
          </li>
          <li>
            <span className="pk-contact__promise-icon" aria-hidden="true">
              <IconPackage />
            </span>
            <div>
              <strong>{t('contact_promise_3_strong')}</strong>
              <p>{t('contact_promise_3_body')}</p>
            </div>
          </li>
        </ul>
      </section>

      {/* FAQ — single column, generous spacing, Q in violet accent. */}
      <section className="pk-contact__faq" aria-label={t('contact_faq_aria')}>
        <h2 className="pk-contact__section-head">
          <span className="pk-contact__eyebrow">
            {t('contact_faq_eyebrow')}
          </span>
          <span className="pk-contact__title">{t('contact_faq_title')}</span>
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
      </section>

      {/* Bottom CTA — final nudge, mirrors the hero. */}
      <section className="pk-contact__cta">
        <h2>{t('contact_cta_title')}</h2>
        <p>{t('contact_cta_body')}</p>
        <a
          className="pk-btn pk-btn--primary"
          href={`mailto:${CONTACT_EMAIL}?subject=Hi%20Puchica%20team`}
        >
          {t('contact_cta_button', {email: CONTACT_EMAIL})}
          <IconArrowRight />
        </a>
      </section>
    </div>
  );
}

const CONTAINMENT_CONTACT_COPY = {
  en: {
    eyebrow: 'Contact Puchica',
    title: 'We are here while the catalog is being reviewed.',
    body: 'Email is the clearest way to reach us. If your message concerns an earlier order or product, include the relevant number or link.',
    email: 'Email hello@puchica.ca',
    note: 'Shopping is currently paused. We will not ask you to place a test order or send payment outside Shopify.',
  },
  fr: {
    eyebrow: 'Contacter Puchica',
    title: 'Nous restons disponibles pendant la vérification du catalogue.',
    body: 'Le courriel est le moyen le plus clair de nous joindre. Pour une commande ou un produit antérieur, ajoutez le numéro ou le lien pertinent.',
    email: 'Écrire à hello@puchica.ca',
    note: 'Les achats sont actuellement suspendus. Nous ne vous demanderons pas de passer une commande test ni de payer hors de Shopify.',
  },
  es: {
    eyebrow: 'Contacta a Puchica',
    title: 'Seguimos aquí mientras revisamos el catálogo.',
    body: 'El correo es la forma más clara de contactarnos. Si escribes sobre un pedido o producto anterior, incluye el número o enlace relevante.',
    email: 'Escribe a hello@puchica.ca',
    note: 'Las compras están en pausa. No te pediremos un pedido de prueba ni un pago fuera de Shopify.',
  },
  'pt-br': {
    eyebrow: 'Fale com a Puchica',
    title: 'Continuamos aqui enquanto revisamos o catálogo.',
    body: 'O e-mail é a forma mais clara de contato. Se a mensagem for sobre um pedido ou produto anterior, inclua o número ou link relevante.',
    email: 'Escreva para hello@puchica.ca',
    note: 'As compras estão pausadas. Não pediremos um pedido de teste nem pagamento fora da Shopify.',
  },
};

function ContainmentContact() {
  const {locale} = useParams();
  const language = ['fr', 'es', 'pt-br'].includes(locale) ? locale : 'en';
  const copy = CONTAINMENT_CONTACT_COPY[language];

  return (
    <div className="pk-hold">
      <section className="pk-hold__hero" aria-labelledby="contact-hold-title">
        <div className="pk-hold__hero-copy">
          <p className="pk-hold__eyebrow">{copy.eyebrow}</p>
          <h1 id="contact-hold-title">{copy.title}</h1>
          <p className="pk-hold__lead">{copy.body}</p>
          <p className="pk-hold__focus">{copy.note}</p>
          <div className="pk-hold__actions">
            <a className="pk-hold__button pk-hold__button--primary" href={`mailto:${CONTACT_EMAIL}`}>
              {copy.email}
            </a>
          </div>
        </div>
        <div className="pk-hold__art" aria-hidden="true">
          <span className="pk-hold__art-label">Puchica</span>
          <span className="pk-hold__shape pk-hold__shape--one" />
          <span className="pk-hold__shape pk-hold__shape--two" />
          <span className="pk-hold__shape pk-hold__shape--three" />
        </div>
      </section>
    </div>
  );
}

/* ---------- the page ---------- */
