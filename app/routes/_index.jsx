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
import {TrustBar} from '~/sections/trust-bar/trust-bar';
import {Reviews} from '~/sections/reviews/reviews';
import {NewsletterFooter} from '~/sections/newsletter-footer/newsletter-footer';
import {
  HOME_BEST_SELLERS_QUERY,
  HOME_NEW_ARRIVALS_QUERY,
  HOME_CATEGORIES_QUERY,
} from '~/lib/fragments';

/** @type {Route.MetaFunction} */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Puchica – The good stuff. All in one place.',
    description:
      'Puchica: 6,000+ products across home, beauty, tech, pet, and more. Curated in Toronto. Free shipping across Canada, 30-day returns.',
    pathname: '/',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  // Phase 1 redesign: the homepage collapsed from 11 deferred
  // queries to 3. The remaining 5 sections need no data (hero,
  // lifestyle, trust, reviews, newsletter) — they're driven by
  // hard-coded copy and the section component's own state.
  return loadDeferredData(args);
}

function loadDeferredData({context}) {
  const {country, language} = context.storefront.i18n;

  // Pull product nodes from `collection.products` and unwrap. Each
  // query uses a different alias so the data object on the route
  // is self-describing.
  const unwrapProducts = (alias) => (res) =>
    res?.[alias]?.products?.nodes ?? [];

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

  return {bestSellers, newArrivals, categories};
}

export default function Index() {
  const data = useLoaderData();

  return (
    <>
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      <HeroSplit />

      <Suspense fallback={null}>
        <Await resolve={data.categories}>
          {(nodes) => <ShopByCategory collections={nodes ?? []} />}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.bestSellers}>
          {(products) => <BestSellers products={products ?? []} />}
        </Await>
      </Suspense>

      <LifestyleBanner />

      <Suspense fallback={null}>
        <Await resolve={data.newArrivals}>
          {(products) => <NewArrivals products={products ?? []} />}
        </Await>
      </Suspense>

      <TrustBar />

      <Reviews />

      <NewsletterFooter />
    </>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
