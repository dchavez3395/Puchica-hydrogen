import {CacheNone} from '@shopify/hydrogen';
import {redirect, useLoaderData} from 'react-router';
import {
  SMALL_SPACE_QUERY,
  SmallSpaceLanding,
} from '~/components/SmallSpaceLanding';
import {
  filterLaunchProducts,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';
import {error as logError} from '~/lib/logger';
import {puchicaMeta} from '~/lib/seo';

/** @type {Route.MetaFunction} */
export const meta = ({data, params}) => {
  return puchicaMeta({
    title: 'Travel organizers for easier packing — Puchica',
    description:
      data?.country === 'US'
        ? 'Shop the travel organizers currently supported for the United States.'
        : 'Shop a focused Canadian travel edit for clothing, cables, and toiletries.',
    pathname: '/campaigns/home-finds',
    langKey: params?.locale,
    noindex: !data?.products?.length,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return redirect('/', {
      status: 302,
      headers: {'Cache-Control': 'no-store, max-age=0'},
    });
  }

  const {country, language} = context.storefront.i18n;

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
    logError('home-finds campaign query failed', error);
    return {country, products: []};
  }
}

export default function HomeFindsCampaign() {
  const {products} = useLoaderData();

  return (
    <main className="pk-campaign pk-campaign--home">
      <SmallSpaceLanding products={products} campaign />
    </main>
  );
}

/** @typedef {import('./+types/campaigns.home-finds').Route} Route */
