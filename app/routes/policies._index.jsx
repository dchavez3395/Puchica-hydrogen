import {useLoaderData, Link} from 'react-router';
import {puchicaMeta} from '~/lib/seo';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return puchicaMeta({
    title: 'Policies – Puchica',
    description:
      'Puchica policies: shipping, returns, privacy, and terms. Free shipping over $50. Easy 30-day returns.',
    pathname: '/policies',
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

  return (
    <div className="policies">
      <h1>Policies</h1>
      <div>
        {policies.map((policy) => (
          <fieldset key={policy.id}>
            <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
          </fieldset>
        ))}
      </div>
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
