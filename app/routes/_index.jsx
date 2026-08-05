import {CacheNone} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {TRENDING_QUERY, TrendingLanding} from '~/components/TrendingLanding';
import {NewsletterFooter} from '~/sections/newsletter-footer/newsletter-footer';
import {filterLaunchProducts} from '~/lib/launch-catalog';
import {error as logError} from '~/lib/logger';
import {
  JsonLdScript,
  organizationJsonLd,
  puchicaMeta,
  websiteJsonLd,
} from '~/lib/seo';

/** @type {Route.MetaFunction} */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Trending finds under $200 - Puchica',
    description:
      'Shop trending finds under $200 — practical products with real reviews. Audio, kitchen, fitness, home, and outdoor picks with shipping shown at checkout.',
    pathname: '/',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  try {
    const data = await context.storefront.query(TRENDING_QUERY, {
      variables: {country, language},
      cache: CacheNone(),
    });

    return {
      products: filterLaunchProducts(
        data?.launchProducts?.nodes ?? [],
      ),
    };
  } catch (error) {
    logError('home trending query failed', error);
    return {products: []};
  }
}

export default function Index() {
  const {products} = useLoaderData();

  return (
      <div className="pk-home pk-campaign pk-campaign--home">
        <JsonLdScript data={organizationJsonLd({})} />
        <JsonLdScript data={websiteJsonLd({})} />
        <TrendingLanding products={products} />
        <NewsletterFooter />
      </div>
    );
}

/** @typedef {import('./+types/_index').Route} Route */
