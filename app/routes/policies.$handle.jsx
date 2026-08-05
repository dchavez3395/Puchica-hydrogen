import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

// Map Shopify policy handle → localized title. The <body> itself is
// admin-side (Shopify Markets translations are owned by the merchant);
// we localize the page title so search engines index the FR/ES pages
// under the right language and visitors understand which document
// they're reading.
const POLICY_TITLES = {
  'privacy-policy': {
    en: 'Privacy Policy',
    fr: 'Politique de confidentialité',
    es: 'Política de privacidad',
  },
  'shipping-policy': {
    en: 'Shipping Policy',
    fr: 'Politique d’expédition',
    es: 'Política de envío',
  },
  'refund-policy': {
    en: 'Refund Policy',
    fr: 'Politique de remboursement',
    es: 'Política de reembolso',
  },
  'terms-of-service': {
    en: 'Terms of Service',
    fr: 'Conditions d’utilisation',
    es: 'Términos del servicio',
  },
  'subscription-policy': {
    en: 'Subscription Policy',
    fr: 'Politique d’abonnement',
    es: 'Política de suscripción',
  },
};

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({matches, data, params}) => {
  const policy = data?.policy;
  const handle = policy?.handle;
  const root = matches?.find((m) => m.id === 'root');
  const langCode = (root?.data?.selectedLocale?.language || 'EN').toLowerCase();
  const langKey = ['fr', 'es'].includes(langCode) ? langCode : 'en';
  const localized = handle && POLICY_TITLES[handle]?.[langKey];
  const title = localized || policy?.title || 'Policy';
  // Description: sentence-aware first ~160 chars of the policy body.
  // Slicing on a sentence boundary avoids broken search snippets like
  // "1. Acceptance of Thes" — Google rewrites those anyway, but a clean
  // snippet helps click-through. Falls back to a generic blurb if the
  // body is empty.
  //
  // (The Storefront API's `ShopPolicy` type does not expose `seo` the
  // way Product/Collection do, so there's no admin-editable description
  // to prefer over the body.)
  const description = policySummary(policy?.body) || `Read the ${title} from Puchica.`;
  return puchicaMeta({
    title: `${title} – Puchica`,
    description,
    pathname: `/policies/${handle || ''}`,
    langKey: params?.locale,
  });
};

// Map policy handle → dictionary key for the visible <h1>.
const POLICY_H1_KEYS = {
  'privacy-policy': 'footer_privacy_policy',
  'shipping-policy': 'footer_shipping_policy',
  'refund-policy': 'footer_refund_policy',
  'terms-of-service': 'footer_terms_of_service',
  'subscription-policy': 'footer_subscription_policy',
};

/**
 * Strip HTML and produce a description from the first 1-2 sentences of
 * the policy body, capped near 160 characters at the nearest sentence
 * or word boundary. Returns "" if there's nothing usable.
 */
function policySummary(body) {
  if (!body) return '';
  const plain = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'of',
  'on', 'or', 'so', 'the', 'to', 'with', 'yet',
]);
function trimTrailingStopword(sliced) {
  const tail = sliced.split(/\s+/).pop()?.toLowerCase().replace(/[^a-z]/g, '');
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
  const data = await context.storefront.query(POLICY_CONTENT_QUERY);

  const policy = POLICIES_INDEX.reduce((found, key) => {
    if (found) return found;
    const candidate = data.shop?.[key];
    return candidate?.handle === handle ? candidate : null;
  }, null);

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {
    policy,
    isRefundPolicy: data.shop?.refundPolicy?.id === policy.id,
  };
}

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
            <h1>{t(POLICY_H1_KEYS[policy?.handle] || '') || policy.title}</h1>
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
