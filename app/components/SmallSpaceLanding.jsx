import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  presentProductDepartment,
  presentProductTitle,
} from '~/lib/product-presentation';
import {useT} from '~/lib/t';

/**
 * Focused landing experience for Puchica's travel-organization launch.
 * Products are launch-filtered in each route loader before they reach here.
 *
 * @param {{products?: Array<Record<string, any>>, campaign?: boolean}} props
 */
export function SmallSpaceLanding(props) {
  const {products = [], campaign = false} = props;
  const rankedProducts = [...products].sort(compareLaunchPriority);
  const heroPrimary = rankedProducts[0];
  const heroFeature = rankedProducts[1] || heroPrimary;
  const heroFeatureVariant = getFirstAvailableVariant(heroFeature);
  const heroImage = heroPrimary?.featuredImage;
  const productSectionId = campaign ? 'shop-travel-organizers' : 'travel-edit';

  return (
    <>
      <section
        className="pk-campaign-hero"
        aria-labelledby="organization-title"
      >
        <div className="pk-campaign-hero__copy">
          <p className="pk-campaign__eyebrow">The Puchica travel edit</p>
          <h1 id="organization-title">Pack with less rummaging.</h1>
          <p>
            Three practical organizers for clothing, cables, and toiletries—a
            useful packing system without an endless catalog.
          </p>
        </div>

        <div className="pk-campaign-hero__visual">
          {heroImage ? (
            <Image
              className="pk-campaign-lifestyle"
              data={heroImage}
              alt={heroImage.altText || heroPrimary.title}
              sizes="(min-width: 761px) 56vw, 100vw"
              loading="eager"
              {...{fetchpriority: 'high'}}
            />
          ) : (
            <div className="pk-campaign-lifestyle" aria-hidden="true" />
          )}
          {heroFeature ? (
            <Link
              className="pk-campaign-feature"
              to={`/products/${heroFeature.handle}`}
              prefetch="intent"
              aria-label={`Shop ${heroFeature.title}`}
            >
              {heroFeatureVariant?.image || heroFeature.featuredImage ? (
                <Image
                  className="pk-campaign-feature__image"
                  data={heroFeatureVariant?.image || heroFeature.featuredImage}
                  alt=""
                  aspectRatio="1/1"
                  sizes="96px"
                  loading="eager"
                />
              ) : null}
              <span className="pk-campaign-feature__body">
                <small>Part of the three-piece edit</small>
                <strong>{heroFeature.title}</strong>
                {heroFeatureVariant?.price ? (
                  <span className="pk-campaign-feature__price">
                    <CurrencyMoney data={heroFeatureVariant.price} />
                  </span>
                ) : null}
                <span className="pk-campaign-feature__link">
                  View the organizer <span aria-hidden="true">→</span>
                </span>
              </span>
            </Link>
          ) : null}
        </div>

        <div className="pk-campaign-hero__footer">
          <div className="pk-campaign-hero__actions">
            <a
              className="pk-campaign-btn pk-campaign-btn--primary"
              href={`#${productSectionId}`}
            >
              Shop the travel edit
            </a>
            <Link
              className="pk-campaign-text-link"
              to="/collections/all"
              prefetch="intent"
            >
              Browse the collection <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="pk-campaign-proof" aria-label="Shopping assurances">
            <li>
              <span aria-hidden="true">✓</span> Secure Shopify checkout
            </li>
            <li>
              <span aria-hidden="true">✓</span> Canada &amp; U.S. delivery
              routes
            </li>
            <li>
              <span aria-hidden="true">✓</span> Shipping shown at checkout
            </li>
          </ul>
        </div>
      </section>

      <OrganizationProductSection
        id={productSectionId}
        eyebrow="Three ways to pack smarter"
        title="A small travel system that works together"
        body="Separate clothing, keep chargers contained, and give toiletries a dedicated place. Start with the piece that solves your biggest packing headache."
        products={rankedProducts}
        linkLabel="View all travel organizers"
        linkTo="/collections/all"
      />
    </>
  );
}

/**
 * @param {{
 *   id?: string;
 *   eyebrow: string;
 *   title: string;
 *   body: string;
 *   products: Array<object>;
 *   linkLabel: string;
 *   linkTo: string;
 * }} props
 */
function OrganizationProductSection({
  id,
  eyebrow,
  title,
  body,
  products,
  linkLabel,
  linkTo,
}) {
  const t = useT();
  if (!products.length) return null;

  return (
    <section className="pk-campaign-products" id={id}>
      <div className="pk-campaign-products__head">
        <div>
          <p className="pk-campaign__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <Link className="pk-campaign-link" to={linkTo} prefetch="intent">
          {linkLabel}
        </Link>
      </div>
      <div className="pk-campaign-editorial-grid">
        {products.slice(0, 3).map((product, index) => {
          const variant = getFirstAvailableVariant(product);
          const image = variant?.image || product.featuredImage;
          const displayTitle = presentProductTitle(product.title, variant);
          const department = presentProductDepartment(product, t);

          return (
            <Link
              className="pk-campaign-editorial-card"
              key={product.id}
              to={`/products/${product.handle}`}
              prefetch="intent"
              aria-label={`View ${displayTitle}`}
            >
              <span className="pk-campaign-editorial-card__media">
                {image ? (
                  <Image
                    data={image}
                    alt={image.altText || displayTitle}
                    aspectRatio="4/3"
                    sizes="(min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                ) : null}
              </span>
              <span className="pk-campaign-editorial-card__body">
                <span className="pk-campaign-editorial-card__department">
                  {department}
                </span>
                <strong className="pk-campaign-editorial-card__title">
                  {displayTitle}
                </strong>
                <span className="pk-campaign-editorial-card__footer">
                  {variant?.price ? (
                    <span className="pk-campaign-editorial-card__price">
                      <CurrencyMoney data={variant.price} />
                    </span>
                  ) : null}
                  <span className="pk-campaign-editorial-card__cta">
                    View organizer <span aria-hidden="true">→</span>
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** @param {Record<string, any>} product */
function launchPriority(product) {
  const title = product?.title ?? '';
  if (/3-piece packing cube/i.test(title)) return 0;
  if (/travel cable organizer/i.test(title)) return 1;
  if (/travel toiletry organizer/i.test(title)) return 2;
  return 10;
}

/** @param {Record<string, any>} a @param {Record<string, any>} b */
function compareLaunchPriority(a, b) {
  return launchPriority(a) - launchPriority(b);
}

/** @param {Record<string, any> | undefined} product */
function getFirstAvailableVariant(product) {
  return product?.variants?.nodes?.find((variant) => variant?.availableForSale);
}

const SMALL_SPACE_PRODUCT_FRAGMENT = `#graphql
  fragment SmallSpaceProduct on Product {
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
    variants(first: 10) {
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

export const SMALL_SPACE_QUERY = `#graphql
  ${SMALL_SPACE_PRODUCT_FRAGMENT}
  query SmallSpaceLaunch(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    launchProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:puchica-catalog-approved-v1"
    ) {
      nodes { ...SmallSpaceProduct }
    }
  }
`;
