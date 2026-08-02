import {CacheNone} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {
  SMALL_SPACE_QUERY,
  SmallSpaceLanding,
} from '~/components/SmallSpaceLanding';
import {filterLaunchProducts} from '~/lib/launch-catalog';
import {error as logError} from '~/lib/logger';
import {puchicaMeta} from '~/lib/seo';

/** @type {Route.MetaFunction} */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Small-space organization for home and travel - Puchica',
    description:
      'Shop practical organizers for drawers, cables, luggage, packing, and compact everyday spaces.',
    pathname: '/campaigns/home-finds',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  try {
    const data = await context.storefront.query(SMALL_SPACE_QUERY, {
      variables: {country, language},
      cache: CacheNone(),
    });

    return {
      products: filterLaunchProducts(
        data?.launchProducts?.nodes ?? [],
      ),
    };
  } catch (error) {
    logError('home-finds campaign query failed', error);
    return {products: []};
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
