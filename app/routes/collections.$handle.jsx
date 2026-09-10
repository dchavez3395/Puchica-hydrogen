import {redirect, useLoaderData} from 'react-router';
import {CacheNone, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {SectionRenderer} from '~/sections/registry';
import {COLLECTION_ITEM_FRAGMENT} from '~/lib/fragments';
import {SECTION_FRAGMENT} from '~/lib/sections';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';
import {
  filterLaunchProducts,
  resolveDiscoveryMarket,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';

/**
 * A real category page, replacing the 301 that used to live here.
 *
 * The redirect was correct while every historical collection described a
 * retired catalogue, but it also meant the store had no category template at
 * all: `/collections/<handle>` bounced to `/collections/all` and dropped any
 * `?price=` filter with it — which quietly broke the budget cards that
 * `collections.all.jsx` explicitly points at these routes to handle.
 *
 * Page furniture comes from metaobjects (see app/lib/sections.js), so the
 * heading, supporting copy and any category tiles are admin-editable. The
 * product grid below them is the same launch-gated cohort every other surface
 * renders — a collection may list whatever a merchant likes, but only approved,
 * sellable offers reach a customer.
 *
 * @type {Route.MetaFunction}
 */
export const meta = ({data, params}) => {
  const collection = data?.collection;
  const handle = params?.handle || '';
  return puchicaMeta({
    title: collection?.seo?.title || collection?.title || handle,
    description:
      collection?.seo?.description || collection?.description || undefined,
    type: 'website',
    pathname: `/collections/${handle}`,
    langKey: params?.locale,
    // An empty category is a crawl liability, not a page. Same reasoning as
    // /collections/all: index it only once it has something to show.
    noindex: !data?.products?.nodes?.length,
  });
};

/**
 * Shopify accepts a `ProductFilter` list on `Collection.products` (unlike the
 * top-level `products` connection), so price ranges genuinely work here.
 * Anything unparseable is ignored rather than surfaced as an active filter
 * that silently does nothing — the failure mode already documented at length
 * in collections.all.jsx.
 *
 * @param {URL} url
 */
function priceFilters(url) {
  const raw = url.searchParams.get('price');
  if (!raw) return [];
  const [minRaw, maxRaw] = raw.split('-');
  const min = Number(minRaw);
  const max = Number(maxRaw);
  const price = {};
  if (Number.isFinite(min)) price.min = min;
  if (Number.isFinite(max)) price.max = max;
  return Object.keys(price).length ? [{price}] : [];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, params, request}) {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return redirect('/', {
      headers: {'Cache-Control': 'no-store, max-age=0'},
    });
  }

  const handle = params?.handle;
  if (!handle) throw new Response('Not found', {status: 404});

  const {country: resolvedCountry, language} = context.storefront.i18n;
  // Same reasoning as /collections/all: a commercially suspended market must
  // not blank this page, because crawlers arrive from that market's IPs.
  const country = resolveDiscoveryMarket(resolvedCountry);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      country,
      language,
      filters: priceFilters(new URL(request.url)),
      ...paginationVariables,
    },
    cache: CacheNone(),
  });

  if (!collection) throw new Response('Not found', {status: 404});

  const nodes = filterLaunchProducts(collection.products?.nodes, country);

  return {
    country,
    collection,
    sections: collection.sections?.references?.nodes ?? [],
    products: {
      nodes,
      pageInfo: collection.products?.pageInfo,
    },
  };
}

export default function CollectionRoute() {
  /** @type {LoaderReturnData} */
  const {collection, sections, products} = useLoaderData();
  const t = useT();
  const nodes = products?.nodes ?? [];

  return (
    <div className="pk-collection">
      <SectionRenderer sections={sections} />

      {nodes.length ? (
        <PaginatedResourceSection
          connection={products}
          ariaLabel={collection?.title}
          resourcesClassName="pk-collection__grid"
        >
          {({node, index}) => (
            <ProductItem
              key={node.id}
              product={node}
              loading={index < 8 ? 'eager' : undefined}
            />
          )}
        </PaginatedResourceSection>
      ) : (
        <p className="pk-collection__empty">{t('all_empty_title')}</p>
      )}
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query CollectionByHandle(
    $handle: String!
    $country: CountryCode!
    $language: LanguageCode!
    $filters: [ProductFilter!]
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo { title description }
      sections: metafield(namespace: "custom", key: "sections") {
        references(first: 12) {
          nodes { ...Section }
        }
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
      ) {
        nodes { ...CollectionItem }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
  ${SECTION_FRAGMENT}
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
