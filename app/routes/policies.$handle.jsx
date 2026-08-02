import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, params}) => {
  const policy = data?.policy;
  const title = policy?.title || 'Policy';
  const usesEnglishPrivacyFallback = Boolean(data?.isPrivacyFallback);
  const requestedLang = params?.locale || 'en';
  const effectiveLang = usesEnglishPrivacyFallback ? 'en' : requestedLang;
  // Description: sentence-aware first ~160 chars of the policy body.
  // Slicing on a sentence boundary avoids broken search snippets like
  // "1. Acceptance of Thes" — Google rewrites those anyway, but a clean
  // snippet helps click-through. Falls back to a generic blurb if the
  // body is empty.
  //
  // (The Storefront API's `ShopPolicy` type does not expose `seo` the
  // way Product/Collection do, so there's no admin-editable description
  // to prefer over the body.)
  const description =
    policySummary(policy?.body) || `Read the ${title} from Puchica.`;
  return puchicaMeta({
    title: `${title} – Puchica`,
    description,
    noindex: usesEnglishPrivacyFallback && requestedLang !== 'en',
    pathname: `/policies/${policy?.handle || ''}`,
    langKey: effectiveLang,
  });
};

/**
 * Strip HTML and produce a description from the first 1-2 sentences of
 * the policy body, capped near 160 characters at the nearest sentence
 * or word boundary. Returns "" if there's nothing usable.
 */
function policySummary(body) {
  if (!body) return '';
  const plain = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  // Look at the first 200 chars; cut at the first sentence terminator
  // if we find one after at least 60 chars (avoids "1." being treated
  // as a sentence end inside "1. Acceptance ...").
  const cap = plain.slice(0, 200);
  const sentenceEnd = cap.search(/[.!?]\s/);
  let out;
  if (sentenceEnd >= 60) {
    out = cap.slice(0, sentenceEnd + 1);
  } else {
    // The Shopify policy bodies are often one long noun phrase with no
    // period for the first few hundred chars ("Last updated: ... Puchica
    // operates this store and website, including all related ..., in").
    // A naive 160-char cut leaves a dangling preposition. Trim one more
    // word back if the cut ends on a stopword.
    const CUT = 160;
    let end = cap.lastIndexOf(' ', CUT);
    if (end < 80) end = CUT;
    out = trimTrailingStopword(cap.slice(0, end));
  }
  return out.trim();
}

// Words that look bad at the end of a search snippet — prepositions,
// articles, conjunctions. When the cut lands on one, step back one word.
const TRAILING_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'so',
  'the',
  'to',
  'with',
  'yet',
]);
function trimTrailingStopword(sliced) {
  const tail = sliced
    .split(/\s+/)
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z]/g, '');
  if (tail && TRAILING_STOPWORDS.has(tail)) {
    const prevSpace = sliced.lastIndexOf(' ');
    if (prevSpace > 60) return sliced.slice(0, prevSpace);
  }
  return sliced;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const handle = params.handle;
  if (!handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  // Query all named policy slots and pick the one whose handle matches
  // the URL. The store may put a shipping-style policy under the
  // subscriptionPolicy slot instead of shippingPolicy — Shopify lets
  // merchants configure that — so we look across all of them rather
  // than assuming a 1:1 mapping between URL slug and Shop field name.
  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    // Policy edits are legal/trust-critical and must not remain behind a stale
    // Storefront API response after an Admin update.
    cache: context.storefront.CacheNone(),
  });

  const policy = POLICIES_INDEX.reduce((found, key) => {
    if (found) return found;
    const candidate = data.shop?.[key];
    return candidate?.handle === handle ? candidate : null;
  }, null);

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  const isPrivacyFallback =
    policy.handle === 'privacy-policy' && containsTemplateCode(policy.body);
  if (isPrivacyFallback) {
    // Server-side operational signal only: never log policy body, request
    // details, cookies, or customer data.
    console.error(
      '[puchica] raw privacy-policy template blocked; static fallback served',
    );
  }
  const safePolicy = isPrivacyFallback
    ? {
        body: PRIVACY_POLICY_FALLBACK,
        handle: policy.handle,
        id: policy.id,
        title: policy.title,
        url: policy.url,
      }
    : policy;

  return {
    policy: safePolicy,
    isPrivacyFallback,
    isRefundPolicy: data.shop?.refundPolicy?.id === policy.id,
  };
}

function containsTemplateCode(body = '') {
  return /\{[{%]|[}%]\}/.test(body);
}

// The Admin privacy policy is maintained as reviewed static text. Keep a
// reviewed fallback so a stale response or platform regression can never
// publish Liquid variables, conditional tags, or placeholder links.
const PRIVACY_POLICY_FALLBACK = `
  <p><strong>Last updated: August 2, 2026</strong></p>
  <p>This Privacy Policy describes how Puchica (“Puchica,” “we,” “us,” or “our”) collects, uses, and shares personal information when you visit puchica.ca, make a purchase, contact us, or otherwise use our online store.</p>
  <h2>Information we collect</h2>
  <p>Depending on how you use the store, we may collect:</p>
  <ul>
    <li>Contact information, such as your name, email address, phone number, and billing or shipping address.</li>
    <li>Order information, such as the products you purchase, order value, currency, discounts, shipping method, and order status.</li>
    <li>Payment-related information. Payments are processed by Shopify and its payment providers. Puchica does not receive your full payment-card number.</li>
    <li>Device and usage information, such as IP address, browser type, device type, pages viewed, referring page, and interactions with the store.</li>
    <li>Communications and support information that you provide when you contact us.</li>
  </ul>
  <h2>How we use information</h2>
  <p>We use personal information to:</p>
  <ul>
    <li>provide the store and process, fulfill, deliver, support, cancel, return, or refund orders;</li>
    <li>communicate about orders, shipping, service updates, and support requests;</li>
    <li>prevent fraud, misuse, security incidents, and unauthorized transactions;</li>
    <li>maintain, measure, troubleshoot, and improve the store and customer experience;</li>
    <li>comply with legal, tax, accounting, and regulatory obligations; and</li>
    <li>provide marketing or advertising where permitted and in accordance with your choices.</li>
  </ul>
  <h2>How we share information</h2>
  <p>We share personal information only as reasonably needed to operate the store, including with Shopify, payment processors, suppliers and fulfillment partners, delivery carriers, customer-support providers, analytics or advertising providers enabled for the store, professional advisers, and authorities where required by law.</p>
  <p>Our service providers may process information in Canada, the United States, or other countries. Information processed in another country may be subject to the laws of that country.</p>
  <h2>Cookies and similar technologies</h2>
  <p>The store and its service providers use cookies and similar technologies for essential store functions, security, preferences, measurement, and, where enabled and permitted, marketing. The choices available to you depend on your location, browser, device, and the consent controls presented on the store. Blocking some cookies may affect store functionality.</p>
  <h2>Retention</h2>
  <p>We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including order support, fraud prevention, legal, tax, accounting, dispute, and record-keeping requirements. Retention periods vary by the information and applicable obligation.</p>
  <h2>Your choices and rights</h2>
  <p>Depending on where you live, you may have rights to request access to, correction of, deletion of, or a copy of personal information, or to object to or restrict certain processing. You may also withdraw marketing consent or use available cookie and privacy controls. These rights may be subject to legal exceptions and identity verification.</p>
  <p>To make a privacy request, email <a href="mailto:hello@puchica.ca">hello@puchica.ca</a>. Please describe the request and the country or region where you live. We may ask for information needed to verify your identity and protect your account or order information.</p>
  <h2>Children</h2>
  <p>The store is intended for adults and is not directed to children. We do not knowingly collect personal information from children in violation of applicable law. A parent or guardian who believes a child provided personal information may contact us.</p>
  <h2>Third-party links</h2>
  <p>The store may link to websites or services operated by others. Their privacy practices are governed by their own policies, and Puchica is not responsible for those practices.</p>
  <h2>Security</h2>
  <p>We use reasonable administrative and technical safeguards appropriate to an online store. No method of transmission or storage is completely secure, so absolute security cannot be guaranteed.</p>
  <h2>Changes to this policy</h2>
  <p>We may update this policy to reflect operational, legal, or service changes. The updated version will be posted with a revised “Last updated” date.</p>
  <h2>Contact</h2>
  <p>Questions or privacy requests can be sent to <a href="mailto:hello@puchica.ca">hello@puchica.ca</a>.</p>
`;

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy, isRefundPolicy} = useLoaderData();
  const t = useT();

  return (
    <div className="pk-policy">
      <div className="pk-policy__inner pk-inner">
        <Link to="/policies" className="pk-policy__back">
          <span aria-hidden>←</span>
          <span>{t('policy_back')}</span>
        </Link>
        <article className="pk-policy__article">
          <header className="pk-policy__head">
            <h1>{policy.title}</h1>
          </header>
          {isRefundPolicy ? (
            <section
              className="pk-policy__body"
              aria-labelledby="refund-summary-title"
            >
              <h2 id="refund-summary-title">{t('refund_summary_title')}</h2>
              <p>{t('refund_summary_start')}</p>
              <ul>
                <li>{t('refund_summary_shipping')}</li>
                <li>{t('refund_summary_timing')}</li>
              </ul>
              <p>
                <strong>{t('refund_summary_control')}</strong>
              </p>
            </section>
          ) : null}
          <div
            className="pk-policy__body"
            dangerouslySetInnerHTML={{__html: policy.body}}
          />
        </article>
      </div>
    </div>
  );
}

// Slots on Shop that may carry a ShopPolicy. Order matches what the
// policies index page uses. `subscriptionPolicy` is typed as
// `ShopPolicyWithDefault` (it can fall back to Shopify's default text)
// but at the field-selection level it exposes the same `Policy` shape.
const POLICIES_INDEX = [
  'privacyPolicy',
  'shippingPolicy',
  'termsOfService',
  'refundPolicy',
  'subscriptionPolicy',
];

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
// `subscriptionPolicy` is typed as `ShopPolicyWithDefault`, which is
// incompatible with the `ShopPolicy` fragment spread — query its
// fields inline instead.
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy {
    shop {
      privacyPolicy { ...Policy }
      shippingPolicy { ...Policy }
      termsOfService { ...Policy }
      refundPolicy { ...Policy }
      subscriptionPolicy { body handle id title url }
    }
  }
`;

/**
 * @typedef {import('./+types/policies.$handle').Route} Route
 */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
