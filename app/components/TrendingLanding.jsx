import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {LocalizedLink as Link} from '~/components/LocalizedLink';

/**
 * Trending landing for Puchica's high-ticket product launch.
 *
 * Replaces the legacy SmallSpaceLanding organization focus with a hero that
 * promotes the launch's three bestsellers and a featured grid of the rest of
 * the launch-ready catalog. Products are launch-filtered upstream by
 * `filterLaunchProducts()` so the tag gate is already enforced by the time
 * they reach this component.
 *
 * NOTE: The legacy `SmallSpaceLanding.jsx` is intentionally left in place —
 * `app/routes/campaigns.home-finds.jsx` still imports it. The new
 * `TrendingLanding` is only used on the homepage `/` route.
 *
 * @param {{products?: Array<Record<string, any>>}} props
 */
export function TrendingLanding(props) {
  const {products = []} = props;
  const ranked = [...products]
    .filter((product) => !HOMEPAGE_EXCLUDED_HANDLES.has(product.handle))
    .sort(compareLaunchPriority);

  const heroSpotlight = ranked[0]; // #1 bestseller (Baseus EP10, etc.)
  const heroSecondary = ranked[1]; // #2 (Pet Feeder, etc.)
  const heroTertiary = ranked[2]; // #3 (Kitchen Knives, etc.)
  const featuredRest = ranked.slice(3, 11); // next 8 for the grid

  const heroSpotlightVariant = getFirstAvailableVariant(heroSpotlight);
  const heroSecondaryVariant = getFirstAvailableVariant(heroSecondary);
  const heroTertiaryVariant = getFirstAvailableVariant(heroTertiary);

  return (
    <>
      <section className="pk-campaign-hero" aria-labelledby="trending-title">
        <div className="pk-campaign-hero__copy">
          <p className="pk-campaign__eyebrow">Trending finds · Under $200</p>
          <h1 id="trending-title">
            Trending finds under $200 — practical products with real reviews.
          </h1>
          <p>
            A focused edit of high-ticket items customers keep re-ordering:
            audio, kitchen, fitness, home, and outdoor. Real product photos,
            shipping shown at checkout, no subscriptions.
          </p>
          <div className="pk-campaign-hero__actions">
            <a
              className="pk-campaign-btn pk-campaign-btn--primary"
              href="#trending-featured"
            >
              Shop the trending edit
            </a>
            <Link
              className="pk-campaign-text-link"
              to="/collections/all"
              prefetch="intent"
            >
              Browse the full catalog <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="pk-campaign-proof" aria-label="Shopping assurances">
            <li>
              <strong>Secure Shopify checkout</strong>
              <span>Encrypted & PCI-compliant</span>
            </li>
            <li>
              <strong>Free Canadian shipping</strong>
              <span>On orders over $50</span>
            </li>
            <li>
              <strong>Real product photos</strong>
              <span>Verified reviews from buyers</span>
            </li>
          </ul>
        </div>

        <div className="pk-campaign-hero__visual">
          <div className="pk-campaign-trending-spotlight">
            {heroSpotlight ? (
              <Link
                className="pk-campaign-feature pk-campaign-feature--primary"
                to={`/products/${heroSpotlight.handle}`}
                prefetch="intent"
                aria-label={`Shop ${heroSpotlight.title}`}
              >
                {(heroSpotlightVariant?.image || heroSpotlight.featuredImage) ? (
                  <Image
                    className="pk-campaign-feature__image"
                    data={
                      heroSpotlightVariant?.image || heroSpotlight.featuredImage
                    }
                    alt=""
                    aspectRatio="1/1"
                    sizes="(min-width: 1100px) 520px, 100vw"
                    loading="eager"
                  />
                ) : null}
                <span className="pk-campaign-feature__body">
                  <small>#1 bestseller</small>
                  <strong>{heroSpotlight.title}</strong>
                  {heroSpotlightVariant?.price ? (
                    <span className="pk-campaign-feature__price">
                      <CurrencyMoney data={heroSpotlightVariant.price} />
                    </span>
                  ) : null}
                  <span className="pk-campaign-feature__link">
                    Shop the #1 pick <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            ) : null}

            <div className="pk-campaign-trending-stack">
              {heroSecondary ? (
                <Link
                  className="pk-campaign-tile"
                  to={`/products/${heroSecondary.handle}`}
                  prefetch="intent"
                  aria-label={`Shop ${heroSecondary.title}`}
                >
                  {(heroSecondaryVariant?.image ||
                    heroSecondary.featuredImage) ? (
                    <Image
                      data={
                        heroSecondaryVariant?.image ||
                        heroSecondary.featuredImage
                      }
                      alt={heroSecondary.title}
                      aspectRatio="1/1"
                      sizes="176px"
                      loading="eager"
                    />
                  ) : null}
                  <span>
                    <small>#2 bestselling</small>
                    <strong>{heroSecondary.title}</strong>
                    {heroSecondaryVariant?.price ? (
                      <span className="pk-campaign-feature__price">
                        <CurrencyMoney data={heroSecondaryVariant.price} />
                      </span>
                    ) : null}
                  </span>
                </Link>
              ) : null}

              {heroTertiary ? (
                <Link
                  className="pk-campaign-tile"
                  to={`/products/${heroTertiary.handle}`}
                  prefetch="intent"
                  aria-label={`Shop ${heroTertiary.title}`}
                >
                  {(heroTertiaryVariant?.image ||
                    heroTertiary.featuredImage) ? (
                    <Image
                      data={
                        heroTertiaryVariant?.image || heroTertiary.featuredImage
                      }
                      alt={heroTertiary.title}
                      aspectRatio="1/1"
                      sizes="176px"
                      loading="eager"
                    />
                  ) : null}
                  <span>
                    <small>#3 bestselling</small>
                    <strong>{heroTertiary.title}</strong>
                    {heroTertiaryVariant?.price ? (
                      <span className="pk-campaign-feature__price">
                        <CurrencyMoney data={heroTertiaryVariant.price} />
                      </span>
                    ) : null}
                  </span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {featuredRest.length ? (
        <section
          className="pk-campaign-products"
          id="trending-featured"
          aria-labelledby="trending-featured-heading"
        >
          <div className="pk-campaign-products__head">
            <div>
              <p className="pk-campaign__eyebrow">Featured this launch</p>
              <h2 id="trending-featured-heading">
                More trending finds worth a look
              </h2>
              <p>
                Hand-picked from the launch catalog — verified suppliers,
                shipping confirmed at checkout, returns within 30 days.
              </p>
            </div>
            <Link
              className="pk-campaign-link"
              to="/collections/all"
              prefetch="intent"
            >
              Shop all trending finds
            </Link>
          </div>
          <div className="pk-campaign-grid">
            {featuredRest.map((product, index) => (
              <TrendingProductCard
                key={product.id}
                product={product}
                eager={index < 2}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

/**
 * Single product card for the featured grid. Links to the product PDP and
 * surfaces the variant price so the customer can scan the row.
 *
 * @param {{product: Record<string, any>, eager?: boolean}} props
 */
function TrendingProductCard({product, eager = false}) {
  const variant = getFirstAvailableVariant(product);
  const image = variant?.image || product.featuredImage;

  return (
    <Link
      className="pk-campaign-card"
      to={`/products/${product.handle}`}
      prefetch="intent"
      aria-label={`View ${product.title}`}
    >
      <span className="pk-campaign-card__media">
        {image ? (
          <Image
            data={image}
            alt={image.altText || product.title}
            aspectRatio="1/1"
            sizes="(min-width: 1100px) 25vw, (min-width: 760px) 33vw, 50vw"
            loading={eager ? 'eager' : 'lazy'}
          />
        ) : null}
      </span>
      <span className="pk-campaign-card__body">
        <strong className="pk-campaign-card__title">{product.title}</strong>
        <span className="pk-campaign-card__footer">
          {variant?.price ? (
            <span className="pk-campaign-card__price">
              <CurrencyMoney data={variant.price} />
            </span>
          ) : null}
          <span className="pk-campaign-card__cta">
            View product <span aria-hidden="true">→</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * @param {Record<string, any> | undefined} product
 */
function getFirstAvailableVariant(product) {
  return product?.variants?.nodes?.find((variant) => variant?.availableForSale);
}

/**
 * Priority score for the homepage hero. Lower = earlier.
 * The first three ranks become the hero feature stack; the next eight
 * become the featured grid. Ties resolve by product creation time
 * (reverse), because the upstream loader already sorts by CREATED_AT desc.
 *
 * @param {Record<string, any>} product
 */
function launchPriority(product) {
  const title = String(product?.title ?? '');
  const haystack = `${title} ${product?.productType ?? ''}`.toLowerCase();

  // 1. Top audio bestsellers (Baseus EP10, Lenovo LP40 Pro)
  if (/baseus|earbud|earphone|headphone/i.test(haystack)) return 0;

  // 2. Pet feeder flagship
  if (/pet feeder|smart pet/i.test(title)) return 1;

  // 3. Kitchen knives flagship
  if (/kitchen knif|chef knif/i.test(title)) return 2;

  // Anything else flows in by Shopify CREATED_AT order from the loader.
  return 10;
}

/** @param {Record<string, any>} a @param {Record<string, any>} b */
function compareLaunchPriority(a, b) {
  return launchPriority(a) - launchPriority(b);
}

/**
 * Operational handles already excluded upstream by
 * `OPERATIONAL_HOLD_HANDLES` in `~/lib/launch-catalog`. Keep this as a
 * defensive second pass in case a hold-listed product slips into the
 * loader response through caching.
 */
const HOMEPAGE_EXCLUDED_HANDLES = new Set([
  '24-piece-drawer-organizer-tray-set',
  'toocki-five-clip-cable-organizer',
  'pocket-luggage-scale-50kg',
]);

const TRENDING_PRODUCT_FRAGMENT = `#graphql
  fragment TrendingProduct on Product {
    id
    handle
    title
    productType
    tags
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 10) {
      nodes {
        id
        availableForSale
        title
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

export const TRENDING_QUERY = `#graphql
  ${TRENDING_PRODUCT_FRAGMENT}
  query TrendingLanding(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    launchProducts: products(
      first: 24
      sortKey: CREATED_AT
      reverse: true
      query: "tag:puchica-launch-ready"
    ) {
      nodes { ...TrendingProduct }
    }
  }
`;
