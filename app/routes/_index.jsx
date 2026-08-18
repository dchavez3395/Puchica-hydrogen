import {CacheNone} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {
  SMALL_SPACE_QUERY,
  SmallSpaceLanding,
} from '~/components/SmallSpaceLanding';
import {
  filterLaunchProducts,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';
import {error as logError} from '~/lib/logger';
import {launchMetaCopy} from '~/lib/launch-meta';
import {
  JsonLdScript,
  organizationJsonLd,
  puchicaMeta,
  websiteJsonLd,
} from '~/lib/seo';

export const meta = ({data, params}) => {
  const copy = launchMetaCopy(params?.locale, data?.country);
  return puchicaMeta({
    title: STOREFRONT_CONTAINMENT_ACTIVE
      ? 'Puchica — Store review in progress'
      : copy.home.title,
    description:
      STOREFRONT_CONTAINMENT_ACTIVE
        ? 'Puchica is completing a storefront review. Shopping will return after the release checks are complete.'
        : copy.home.description,
    pathname: '/',
    langKey: params?.locale,
  });
};

export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  if (STOREFRONT_CONTAINMENT_ACTIVE) return {country, products: []};

  try {
    const data = await context.storefront.query(SMALL_SPACE_QUERY, {
      variables: {country, language},
      cache: CacheNone(),
    });

    return {
      country,
      products: filterLaunchProducts(
        data?.launchProducts?.nodes ?? [],
        country,
      ),
    };
  } catch (error) {
    logError('home travel edit query failed', error);
    return {country, products: []};
  }
}

export default function Index() {
  const {products} = useLoaderData();

  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return (
      <main className="pk-home pk-campaign pk-campaign--home">
        <section className="pk-campaign-hero" aria-labelledby="review-title">
          <div className="pk-campaign-hero__copy">
            <p className="pk-campaign__eyebrow">Puchica storefront review</p>
            <h1 id="review-title">We are tightening the last details.</h1>
            <p>
              Shopping is temporarily paused while we verify product and
              checkout details across Canada and the United States.
            </p>
            <p>
              Questions? <a href="mailto:hello@puchica.ca">hello@puchica.ca</a>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="pk-home pk-campaign pk-campaign--home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />
      <SmallSpaceLanding products={products} />
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
