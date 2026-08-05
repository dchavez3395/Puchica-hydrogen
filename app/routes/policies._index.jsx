import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 */
// Localized strings for the policies index page. <body> is admin-side,
// so we localize the chrome (page title, description) per locale.
const POLICIES_INDEX_SEO = {
  en: {
    title: 'Policies – Puchica',
    description:
      'Read Puchica policies covering shipping, returns, privacy, and terms of service.',
  },
  fr: {
    title: 'Politiques – Puchica',
    description:
      'Consultez les politiques de Puchica : livraison, retours, confidentialité et conditions d’utilisation.',
  },
  es: {
    title: 'Políticas – Puchica',
    description:
      'Consulta las políticas de Puchica: envío, devoluciones, privacidad y términos del servicio.',
  },
  'pt-br': {
    title: 'Políticas – Puchica',
    description:
      'Consulte as políticas da Puchica: envios, devoluções, privacidade e termos de serviço.',
  },
};

export const meta = ({matches, params}) => {
  const root = matches?.find((m) => m?.id === 'root')?.data;
  const lang = root?.selectedLocale?.language || params?.locale || 'en';
  const seo = POLICIES_INDEX_SEO[lang] || POLICIES_INDEX_SEO.en;
  return puchicaMeta({
    title: seo.title,
    description: seo.description,
    pathname: '/policies',
    langKey: lang,
  });
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {country, language} = context.storefront.i18n;
  const data = await context.storefront.query(POLICIES_QUERY, {
    variables: {country, language},
  });

  const shopPolicies = data.shop;
  const policies = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy) => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();
  const t = useT();

  // Map Shopify policy handle → localized dictionary key.
  // Falls back to policy.title (admin-side) when a key is missing.
  const titleFor = (handle) => {
    const map = {
      'privacy-policy': 'footer_privacy_policy',
      'shipping-policy': 'footer_shipping_policy',
      'refund-policy': 'footer_refund_policy',
      'terms-of-service': 'footer_terms_of_service',
      'subscription-policy': 'footer_subscription_policy',
    };
    const key = map[handle];
    return key ? t(key) : null;
  };

  return (
    <div className="pk-policies-index pk-inner">
      <header className="pk-policies-index__head">
        <h1>{t('policies_h')}</h1>
        <p>{t('policies_sub')}</p>
      </header>
      <ul className="pk-policies-index__list">
        {policies.map((policy) => {
          const localized = titleFor(policy.handle);
          return (
            <li key={policy.id}>
              <Link
                to={`/policies/${policy.handle}`}
                className="pk-policies-index__link"
              >
                <span className="pk-policies-index__link-title">
                  {localized || policy.title}
                </span>
                <span className="pk-policies-index__link-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies($country: CountryCode!, $language: LanguageCode!) @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('./+types/policies._index').Route} Route */
/** @typedef {import('storefrontapi.generated').PoliciesQuery} PoliciesQuery */
/** @typedef {import('storefrontapi.generated').PolicyItemFragment} PolicyItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
