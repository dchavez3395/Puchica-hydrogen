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

export const meta = ({params}) =>
  puchicaMeta({
    title: 'Puchica — Travel organizers for easier packing',
    description:
      'A focused travel-organization edit: packing cubes, a cable case, and a toiletry organizer with shipping shown at checkout.',
    pathname: '/',
    langKey: params?.locale,
  });

export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  try {
    const data = await context.storefront.query(SMALL_SPACE_QUERY, {
      variables: {country, language},
      cache: CacheNone(),
    });

    return {
      products: filterLaunchProducts(data?.launchProducts?.nodes ?? []),
    };
  } catch (error) {
    logError('home travel edit query failed', error);
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
