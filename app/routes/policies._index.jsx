import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Policies – Puchica',
    description:
      'Shipping, returns, privacy, and terms for orders placed at Puchica.ca. Canadian-owned. 30-day easy returns.',
    pathname: '/policies',
    langKey: params?.locale,
  });
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {country, language} = context.storefront.i18n;
  const data = await context.storefront.query(POLICIES_QUERY, {variables: {country, language}});

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

  return (
    <div className="pk-policies-index pk-inner">
      <header className="pk-policies-index__head">
        <h1>{t('policies_h')}</h1>
        <p>{t('policies_sub')}</p>
      </header>
      <ul className="pk-policies-index__list">
        {policies.map((policy) => (
          <li key={policy.id}>
            <Link to={`/policies/${policy.handle}`} className="pk-policies-index__link">
              <span className="pk-policies-index__link-title">{policy.title}</span>
              <span className="pk-policies-index__link-arrow" aria-hidden>→</span>
            </Link>
          </li>
        ))}
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
