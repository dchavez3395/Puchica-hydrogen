import {Image} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {puchicaMeta} from '~/lib/seo';
import {filterLaunchProducts} from '~/lib/launch-catalog';

/** @type {Route.MetaFunction} */
export const meta = () => {
  return puchicaMeta({
    title: 'Useful Home Finds Under One Roof - Puchica',
    description:
      'Shop practical home, kitchen, pet, and everyday finds from Puchica with clear delivery information, published policies, and secure checkout.',
    pathname: '/campaigns/home-finds',
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  const data = await context.storefront.query(CAMPAIGN_HOME_FINDS_QUERY, {
    variables: {country, language},
  });

  return {
    heroProducts: filterLaunchProducts(data?.heroProducts?.products?.nodes ?? []),
    homeProducts: filterLaunchProducts(data?.homeProducts?.products?.nodes ?? []),
    petProducts: filterLaunchProducts(data?.petProducts?.products?.nodes ?? []),
  };
}

export default function HomeFindsCampaign() {
  const {heroProducts, homeProducts, petProducts} = useLoaderData();
  const heroPrimary = heroProducts[0] ?? homeProducts[0];
  const heroTiles = [
    heroProducts[1],
    heroProducts[2],
    petProducts[0],
  ].filter(Boolean);

  return (
    <main className="pk-campaign pk-campaign--home">
      <section className="pk-campaign-hero" aria-labelledby="home-finds-title">
        <div className="pk-campaign-hero__copy">
          <p className="pk-campaign__eyebrow">Puchica Home Finds</p>
          <h1 id="home-finds-title">
            Practical finds for the rooms you use every day.
          </h1>
          <p>
            Start with our most useful home, kitchen, pet, and everyday picks. Real
            products, clear prices, secure Shopify checkout, and published policies.
          </p>
          <div className="pk-campaign-hero__actions">
            <a
              className="pk-campaign-btn pk-campaign-btn--primary"
              href="#shop-home-finds"
            >
              Shop the picks
            </a>
            <Link
              className="pk-campaign-btn pk-campaign-btn--secondary"
              to="/collections/all"
            >
              Browse the store
            </Link>
          </div>
          <ul className="pk-campaign-proof" aria-label="Store benefits">
            <li>
              <strong>Delivery options</strong>
              <span>Options shown at checkout</span>
            </li>
            <li>
              <strong>Published policies</strong>
              <span>Review details before you buy</span>
            </li>
            <li>
              <strong>Secure checkout</strong>
              <span>Powered by Shopify</span>
            </li>
          </ul>
        </div>

        <div className="pk-campaign-hero__visual" aria-label="Featured products">
          {heroPrimary ? (
            <Link
              className="pk-campaign-feature"
              to={`/products/${heroPrimary.handle}`}
              prefetch="intent"
            >
              {heroPrimary.featuredImage ? (
                <Image
                  data={heroPrimary.featuredImage}
                  alt={heroPrimary.featuredImage.altText || heroPrimary.title}
                  aspectRatio="4/5"
                  sizes="(min-width: 900px) 38vw, 92vw"
                  loading="eager"
                />
              ) : null}
              <span>
                <small>Featured find</small>
                <strong>{heroPrimary.title}</strong>
              </span>
            </Link>
          ) : null}
          <div className="pk-campaign-tiles">
            {heroTiles.map((product) => (
              <Link
                key={product.id}
                className="pk-campaign-tile"
                to={`/products/${product.handle}`}
                prefetch="intent"
              >
                {product.featuredImage ? (
                  <Image
                    data={product.featuredImage}
                    alt={product.featuredImage.altText || product.title}
                    aspectRatio="1/1"
                    sizes="160px"
                    loading="eager"
                  />
                ) : null}
                <span>{product.productType || 'Shop'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pk-campaign-band" aria-label="Why shop this edit">
        <div>
          <strong>Useful first</strong>
          <span>
            Practical home, kitchen, pet, and everyday picks you can understand
            quickly.
          </span>
        </div>
        <div>
          <strong>Easy to compare</strong>
          <span>
            Clear prices, product photos, and direct add-to-cart from the grid.
          </span>
        </div>
        <div>
          <strong>Protected checkout</strong>
          <span>
            Secure Shopify checkout, delivery options at checkout, and published
            policy details.
          </span>
        </div>
      </section>

      <CampaignProductSection
        id="shop-home-finds"
        eyebrow="Home & Kitchen"
        title="Start with the useful stuff"
        body="A focused grid for shoppers who want practical home finds without digging through the full catalog first."
        products={homeProducts}
        ctaTo="/collections/home-kitchen"
        ctaLabel="Shop Home & Kitchen"
      />

      <section
        className="pk-campaign-split"
        aria-labelledby="campaign-angle-title"
      >
        <div>
          <p className="pk-campaign__eyebrow">Why this edit</p>
          <h2 id="campaign-angle-title">Small fixes for everyday life.</h2>
          <p>
            Start with products that solve familiar little problems around the
            home, then branch into pet supplies, everyday finds, and seasonal picks when
            you are ready to browse.
          </p>
        </div>
        <ul>
          <li>
            <strong>Home helpers</strong>
            <span>
              Cleaning, organizing, kitchen, and comfort picks in one place.
            </span>
          </li>
          <li>
            <strong>Pet extras</strong>
            <span>
              Simple toys and supplies that are easy to shop at a glance.
            </span>
          </li>
          <li>
            <strong>Deal hunting</strong>
            <span>
              Sale items are nearby when you want a lower-price first buy.
            </span>
          </li>
        </ul>
      </section>

      <CampaignProductSection
        eyebrow="Pet & everyday picks"
        title="Small buys with clear use cases"
        body="Pet products and household extras work well as first buys because the value is easy to understand in one image."
        products={petProducts}
        ctaTo="/collections/pet-supplies"
        ctaLabel="Shop Pet Supplies"
      />
    </main>
  );
}

function CampaignProductSection({
  id,
  eyebrow,
  title,
  body,
  products,
  ctaTo,
  ctaLabel,
}) {
  if (!products?.length) return null;

  return (
    <section className="pk-campaign-products" id={id}>
      <div className="pk-campaign-products__head">
        <div>
          <p className="pk-campaign__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <Link className="pk-campaign-link" to={ctaTo}>
          {ctaLabel}
        </Link>
      </div>
      <div className="pk-campaign-grid">
        {products.slice(0, 8).map((product, index) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </section>
  );
}

const CAMPAIGN_PRODUCT_FRAGMENT = `#graphql
  fragment CampaignProduct on Product {
    id
    handle
    title
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    options(first: 1) {
      name
      values
      optionValues {
        name
        swatch {
          color
          image {
            previewImage {
              url
              altText
            }
          }
        }
      }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        title
        requiresShipping
        image {
          id
          altText
          url
          width
          height
        }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions {
          name
          value
        }
        product {
          id
          handle
          title
          vendor
        }
      }
    }
  }
`;

const CAMPAIGN_HOME_FINDS_QUERY = `#graphql
  ${CAMPAIGN_PRODUCT_FRAGMENT}
  query CampaignHomeFinds(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    heroProducts: collection(handle: "home-kitchen") {
      products(first: 6, sortKey: BEST_SELLING) {
        nodes { ...CampaignProduct }
      }
    }
    homeProducts: collection(handle: "home-kitchen") {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes { ...CampaignProduct }
      }
    }
    petProducts: collection(handle: "pet-supplies") {
      products(first: 8, sortKey: BEST_SELLING) {
        nodes { ...CampaignProduct }
      }
    }
  }
`;

/** @typedef {import('./+types/campaigns.home-finds').Route} Route */
