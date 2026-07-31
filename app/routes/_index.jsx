import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {CacheNone} from '@shopify/hydrogen';
import {error as logError} from '~/lib/logger';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';
import {
  HeroSplit,
} from '~/sections/hero-split/hero-split';
import {ShopByCategory} from '~/sections/shop-by-category/shop-by-category';
import {BestSellers} from '~/sections/best-sellers/best-sellers';
import {NewArrivals} from '~/sections/new-arrivals/new-arrivals';
import {SportsOutdoors} from '~/sections/sports-outdoors/sports-outdoors';
import {filterLaunchProducts, isLaunchReadyProduct} from '~/lib/launch-catalog';
function selectLaunchHeroes(products) {
  // The Shopify launch-ready tag is the source of truth. Taking the first
  // sellable products keeps the hero populated as the approved catalog
  // changes, without coupling the deployment to stale product IDs.
  return products.slice(0, 5);
}

import {
  HOME_BEST_SELLERS_QUERY,
  HOME_NEW_ARRIVALS_QUERY,
  HOME_CATEGORIES_QUERY,
  HOME_SPORTS_QUERY,
} from '~/lib/fragments';

/** @type {Route.MetaFunction} */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Puchica – The good stuff. All in one place.',
    description:
      'Puchica: active departments across home, beauty, tech, pet, outdoor, and more. Clear shipping options and secure checkout.',
    pathname: '/',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  // Phase 1 redesign collapsed the homepage from 11 deferred
  // queries to 3. The user-requested add of sports + World Cup
  // rails (July 2026) brings the count to 5. Each new query
  // reuses the existing HomeProduct fragment, runs in parallel
  // with the rest, and uses the deferred pattern so none of
  // them block SSR.
  return loadDeferredData(args);
}

function loadDeferredData({context}) {
  const {country, language} = context.storefront.i18n;
  // During catalog cleanup, the homepage must reflect a product changing from
  // Active to Draft immediately. Storefront API responses are cached by
  // default, which can otherwise leave an unavailable product in a live rail.
  // Revisit this once the launch catalog is stable and use a short cache TTL.
  const catalogQueryOptions = {
    variables: {country, language},
    cache: CacheNone(),
  };

  // Each query uses a different alias so the data object on the
  // route is self-describing. Two response shapes are in play:
  //
  //   * collection(handle: ...) { products { nodes } }
  //       -> res[alias].products.nodes
  //   * products(first: ...) { nodes }
  //       -> res[alias].nodes
  //
  // The unwrapper below accepts either, with a small precedence
  // order so the existing bestSellers shape keeps working.
  const unwrapProducts = (alias) => (res) =>
    res?.[alias]?.products?.nodes ?? res?.[alias]?.nodes ?? [];
  // A collection can retain an old product briefly after it is drafted in
  // Admin. Keep homepage rails transactional: only show a product the
  // Storefront API currently marks as sellable.
  const onlySellable = filterLaunchProducts;

  const bestSellers = context.storefront
    .query(HOME_BEST_SELLERS_QUERY, catalogQueryOptions)
    .then((res) =>
      selectLaunchHeroes(onlySellable(unwrapProducts('bestSellers')(res))),
    )
    .catch((e) => {
      logError('home best-sellers query failed', e);
      return [];
    });

  const newArrivals = context.storefront
    .query(HOME_NEW_ARRIVALS_QUERY, catalogQueryOptions)
    .then((res) => onlySellable(unwrapProducts('newArrivals')(res)))
    .catch((e) => {
      logError('home new-arrivals query failed', e);
      return [];
    });

  const categories = context.storefront
    .query(HOME_CATEGORIES_QUERY, catalogQueryOptions)
    .then((res) => [
      res?.homeKitchen,
      res?.homeDecor,
      res?.apparel,
      res?.sports,
      res?.pet,
      res?.beauty,
      res?.toys,
      res?.baby,
    ].filter((collection) =>
      collection?.products?.nodes?.some(isLaunchReadyProduct),
    ))
    .catch((e) => {
      logError('home categories query failed', e);
      return [];
    });

  const sports = context.storefront
    .query(HOME_SPORTS_QUERY, catalogQueryOptions)
    .then((res) => onlySellable(unwrapProducts('sports')(res)))
    .catch((e) => {
      logError('home sports query failed', e);
      return [];
    });

  return {bestSellers, newArrivals, categories, sports};
}

export default function Index() {
  const data = useLoaderData();

  return (
    <div className="pk-home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      <Suspense fallback={<HeroSplit />}>
        <Await resolve={Promise.all([data.bestSellers, data.categories])}>
          {([products, categories]) => (
            <HeroSplit products={products ?? []} categories={categories ?? []} />
          )}
        </Await>
      </Suspense>


      <Suspense fallback={null}>
        <Await resolve={data.categories}>
          {(nodes) => <ShopByCategory collections={nodes ?? []} />}
        </Await>
      </Suspense>


      <Suspense fallback={<BestSellers />}>
        <Await resolve={data.bestSellers}>
          {(products) => <BestSellers products={products ?? []} />}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.newArrivals}>
          {(products) => <NewArrivals products={products ?? []} />}
        </Await>
      </Suspense>

      <Suspense fallback={<SportsOutdoors />}>
        <Await resolve={data.sports}>
          {(products) => <SportsOutdoors products={products ?? []} />}
        </Await>
      </Suspense>

    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
