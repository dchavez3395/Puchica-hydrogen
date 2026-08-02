import {CacheNone} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {
  SMALL_SPACE_QUERY,
  SmallSpaceLanding,
} from '~/components/SmallSpaceLanding';
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
    title: 'Puchica - Small-space organization for home and travel',
    description:
      'Practical organizers for crowded drawers, tangled cables, packed bags, and everyday life on the go.',
    pathname: '/',
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
    logError('home small-space query failed', error);
    return {products: []};
  }
}

export default function Index() {
  const {products} = useLoaderData();

  return (
    <div className="pk-home pk-campaign pk-campaign--home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />
      <SmallSpaceLanding products={products} />
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
