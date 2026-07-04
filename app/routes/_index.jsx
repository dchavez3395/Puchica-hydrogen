import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {error as logError} from '~/lib/logger';
import {puchicaMeta, organizationJsonLd, websiteJsonLd, JsonLdScript} from '~/lib/seo';
import {StoreHero} from '~/sections/store-hero/store-hero';
import {DepartmentGrid} from '~/sections/department-grid/department-grid';
import {ProductRail} from '~/components/ProductRail';
import {BestSellersGrid} from '~/sections/best-sellers/best-sellers';
import {TrustBar} from '~/sections/trust-bar/trust-bar';
import {NewsletterFooter} from '~/sections/newsletter-footer/newsletter-footer';
import {useT} from '~/lib/t';
import {
  HOME_BEST_SELLERS_QUERY,
  HOME_NEW_ARRIVALS_QUERY,
  HOME_CATEGORIES_QUERY,
  HOME_SALE_QUERY,
  HOME_FOR_YOU_QUERY,
  HOME_GIFTS_QUERY,
} from '~/lib/fragments';

/** @type {Route.MetaFunction} */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Puchica — 6,000+ Products Across Every Department',
    description:
      'Shop 6,000+ products across home, kitchen, electronics, phone cases, beauty, pet supplies, and more. Free shipping across Canada, 30-day returns, secure checkout.',
    pathname: '/',
    langKey: params?.locale,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  return loadDeferredData(args);
}

function loadDeferredData({context}) {
  const {country, language} = context.storefront.i18n;

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

  const onSale = context.storefront
    .query(HOME_SALE_QUERY, {variables: {country, language}})
    .then(unwrapProducts('onSale'))
    .catch((e) => {
      logError('home sale query failed', e);
      return [];
    });

  const forYou = context.storefront
    .query(HOME_FOR_YOU_QUERY, {variables: {country, language}})
    .then(unwrapProducts('forYou'))
    .catch((e) => {
      logError('home for-you query failed', e);
      return [];
    });

  const gifts = context.storefront
    .query(HOME_GIFTS_QUERY, {variables: {country, language}})
    .then(unwrapProducts('gifts'))
    .catch((e) => {
      logError('home gifts query failed', e);
      return [];
    });

  return {bestSellers, newArrivals, categories, onSale, forYou, gifts};
}

export default function Index() {
  const data = useLoaderData();
  const t = useT();

  return (
    <>
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />

      <StoreHero />

      <Suspense fallback={<DepartmentGridSkeleton />}>
        <Await resolve={data.categories}>
          {(nodes) => <DepartmentGrid collections={nodes ?? []} />}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.newArrivals}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_new_eyebrow')}
              heading={t('home_rail_new_heading')}
              seeAllLabel={t('home_rail_new_see_all')}
              seeAllHref="/collections/new-arrivals"
              scrollLeftAria={t('new_arrivals_scroll_left')}
              scrollRightAria={t('new_arrivals_scroll_right')}
            />
          )}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.onSale}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_sale_eyebrow')}
              heading={t('home_rail_sale_heading')}
              seeAllLabel={t('home_rail_sale_see_all')}
              seeAllHref="/collections/sale"
              scrollLeftAria={t('home_rail_sale_scroll_left')}
              scrollRightAria={t('home_rail_sale_scroll_right')}
              variant="sale"
            />
          )}
        </Await>
      </Suspense>

      <Suspense fallback={<BestSellersGrid />}>
        <Await resolve={data.bestSellers}>
          {(products) => <BestSellersGrid products={products ?? []} />}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.forYou}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_foryou_eyebrow')}
              heading={t('home_rail_foryou_heading')}
              seeAllLabel={t('home_rail_foryou_see_all')}
              seeAllHref="/collections/for-you"
              scrollLeftAria={t('home_rail_foryou_scroll_left')}
              scrollRightAria={t('home_rail_foryou_scroll_right')}
            />
          )}
        </Await>
      </Suspense>

      <Suspense fallback={null}>
        <Await resolve={data.gifts}>
          {(products) => (
            <ProductRailSection
              products={products}
              eyebrow={t('home_rail_gifts_eyebrow')}
              heading={t('home_rail_gifts_heading')}
              seeAllLabel={t('home_rail_gifts_see_all')}
              seeAllHref="/collections/gifts-under-25"
              scrollLeftAria={t('home_rail_gifts_scroll_left')}
              scrollRightAria={t('home_rail_gifts_scroll_right')}
            />
          )}
        </Await>
      </Suspense>

      <TrustBar />
      <NewsletterFooter />
    </>
  );
}

/**
 * Wrapper that renders a ProductRail inside a <section> with the
 * standard section padding + inner container.
 */
function ProductRailSection({
  products,
  eyebrow,
  heading,
  seeAllLabel,
  seeAllHref,
  scrollLeftAria,
  scrollRightAria,
  variant,
}) {
  if (!products?.length) return null;

  return (
    <section
      className={
        'pk-section pk-section--rail' +
        (variant === 'sale' ? ' pk-section--rail-sale' : '')
      }
    >
      <div className="pk-section__inner">
        <ProductRail
          products={products}
          eyebrow={eyebrow}
          heading={heading}
          seeAllLabel={seeAllLabel}
          seeAllHref={seeAllHref}
          scrollLeftAria={scrollLeftAria}
          scrollRightAria={scrollRightAria}
          maxItems={12}
        />
      </div>
    </section>
  );
}

function DepartmentGridSkeleton() {
  return (
    <section className="pk-section pk-section--departments">
      <div className="pk-section__inner">
        <div className="pk-section__head">
          <span className="pk-eyebrow">Loading</span>
          <h2 className="pk-section__h">Shop by Department</h2>
        </div>
        <ul className="pk-dept-grid">
          {Array.from({length: 15}).map((_, i) => (
            <li key={`skel-${i}`} className="pk-dept-tile pk-dept-tile--skel" />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** @typedef {import('./+types/_index').Route} Route */