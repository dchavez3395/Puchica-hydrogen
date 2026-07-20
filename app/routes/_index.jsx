import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {error as logError} from '~/lib/logger';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';
import {
  HeroSplit,
} from '~/sections/hero-split/hero-split';
import {ShopByCategory} from '~/sections/shop-by-category/shop-by-category';
import {BestSellers} from '~/sections/best-sellers/best-sellers';
import {LifestyleBanner} from '~/sections/lifestyle-banner/lifestyle-banner';
import {NewArrivals} from '~/sections/new-arrivals/new-arrivals';
import {SportsOutdoors} from '~/sections/sports-outdoors/sports-outdoors';
import {WorldCup} from '~/sections/world-cup/world-cup';
import {TrustBar} from '~/sections/trust-bar/trust-bar';
import {Reviews} from '~/sections/reviews/reviews';
import {NewsletterFooter} from '~/sections/newsletter-footer/newsletter-footer';
import {
  HOME_BEST_SELLERS_QUERY,
  HOME_NEW_ARRIVALS_QUERY,
  HOME_CATEGORIES_QUERY,
  HOME_SPORTS_QUERY,
  HOME_WORLD_CUP_QUERY,
} from '~/lib/fragments';

/** @type {Route.MetaFunction} */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Puchica – The good stuff. All in one place.',
    description:
      'Puchica: active departments across home, beauty, tech, pet, outdoor, and more. Curated in Toronto. Shipping across Canada, 30-day returns.',
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
  // them block SSR. Trust bar, reviews, and newsletter still
  // need no data -- they're driven by hard-coded copy and
  // section state.
  return loadDeferredData(args);
}

function loadDeferredData({context}) {
  const {country, language} = context.storefront.i18n;

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

  const bestSellers = context.storefront
    .query(HOME_BEST_SELLERS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('bestSellers'))
    .catch((e) => {
      logError('home best-sellers query failed', e);
      return [];
    });

  const newArrivals = context.storefront
    .query(HOME_NEW_ARRIVALS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('newArrivals'))
    .catch((e) => {
      logError('home new-arrivals query failed', e);
      return [];
    });

  const categories = context.storefront
    .query(HOME_CATEGORIES_QUERY, {variables: {country, language}})
    .then((res) => res?.categories?.nodes ?? [])
    .catch((e) => {
      logError('home categories query failed', e);
      return [];
    });

  const sports = context.storefront
    .query(HOME_SPORTS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('sports'))
    .catch((e) => {
      logError('home sports query failed', e);
      return [];
    });

  const worldCup = context.storefront
    .query(HOME_WORLD_CUP_QUERY, {variables: {country, language}})
    .then(unwrapProducts('worldCup'))
    .catch((e) => {
      logError('home world-cup query failed', e);
      return [];
    });

  return {bestSellers, newArrivals, categories, sports, worldCup};
}

export default function Index() {
  const data = useLoaderData();

  return (
    <div className="pk-home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      <Suspense fallback={<HeroSplit />}>
        <Await resolve={data.bestSellers}>
          {(products) => <HeroSplit products={products ?? []} />}
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

      <Suspense fallback={<LifestyleBanner />}>
        <Await resolve={data.bestSellers}>
          {(products) => (
            <LifestyleBanner
              image={pickLifestyleImage(products)}
              link={pickLifestyleLink(products)}
            />
          )}
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

      <Suspense fallback={<WorldCup />}>
        <Await resolve={data.worldCup}>
          {(products) => <WorldCup products={products ?? []} />}
        </Await>
      </Suspense>

      <TrustBar />

      <Reviews />

      <NewsletterFooter />
    </div>
  );
}

/**
 * Pick a lifestyle image from a *different* best-seller so the
 * hero and lifestyle never duplicate. Falls back to the second,
 * then the first, so the lifestyle section still gets an image
 * even when fewer than 3 best-sellers exist.
 */
function pickLifestyleImage(products) {
  return products?.[2]?.featuredImage
    ?? products?.[1]?.featuredImage
    ?? products?.[0]?.featuredImage
    ?? null;
}

function pickLifestyleLink(products) {
  const handle = products?.[2]?.handle
    ?? products?.[1]?.handle
    ?? products?.[0]?.handle;
  return handle ? `/products/${handle}` : '/collections/home-kitchen';
}

/** @typedef {import('./+types/_index').Route} Route */
