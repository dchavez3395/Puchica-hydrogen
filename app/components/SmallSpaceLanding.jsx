import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  presentProductDepartment,
  presentProductTitle,
} from '~/lib/product-presentation';
import {useT} from '~/lib/t';

/**
 * Focused landing experience for Puchica's small-space organization test.
 * Products are launch-filtered in each route loader before they reach here.
 *
 * @param {{products?: Array<Record<string, any>>, campaign?: boolean}} props
 */
export function SmallSpaceLanding(props) {
  const {products = [], campaign = false} = props;
  const rankedProducts = products
    .filter((product) => !HOMEPAGE_EXCLUDED_HANDLES.has(product.handle))
    .sort(compareLaunchPriority);
  const heroPrimary = rankedProducts[0];
  const heroVariant = getFirstAvailableVariant(heroPrimary);
  const productSectionId = campaign ? 'shop-organizers' : 'organization-finds';
  const onTheGoProducts = rankedProducts.filter(isOnTheGoProduct);
  const homeProducts = rankedProducts.filter(
    (product) => !isOnTheGoProduct(product),
  );

  return (
    <>
      <section
        className="pk-campaign-hero"
        aria-labelledby="organization-title"
      >
        <div className="pk-campaign-hero__copy">
          <p className="pk-campaign__eyebrow">
            Organizers for small-space living
          </p>
          <h1 id="organization-title">Make small spaces easier to live in.</h1>
          <p>
            Shop practical organizers for under-sink storage, loose cables,
            packing, and everyday carry.
          </p>
        </div>

        <div className="pk-campaign-hero__visual">
          <img
            className="pk-campaign-lifestyle"
            src="/lifestyle/organization-hero-v2.webp"
            alt=""
            width="1536"
            height="1024"
            loading="eager"
            {...{fetchpriority: 'high'}}
          />
          {heroPrimary ? (
            <Link
              className="pk-campaign-feature"
              to={`/products/${heroPrimary.handle}`}
              prefetch="intent"
              aria-label={`Shop ${heroPrimary.title}`}
            >
              {heroVariant?.image || heroPrimary.featuredImage ? (
                <Image
                  className="pk-campaign-feature__image"
                  data={heroVariant?.image || heroPrimary.featuredImage}
                  alt=""
                  aspectRatio="1/1"
                  sizes="96px"
                  loading="eager"
                />
              ) : null}
              <span className="pk-campaign-feature__body">
                <small>Under-sink organization</small>
                <strong>{heroPrimary.title}</strong>
                {heroVariant?.price ? (
                  <span className="pk-campaign-feature__price">
                    <CurrencyMoney data={heroVariant.price} />
                  </span>
                ) : null}
                <span className="pk-campaign-feature__link">
                  Shop the under-sink organizer{' '}
                  <span aria-hidden="true">→</span>
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
              Shop all organizers
            </a>
            <Link
              className="pk-campaign-text-link"
              to="/collections/all"
              prefetch="intent"
            >
              Browse all organizers <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="pk-campaign-proof" aria-label="Shopping assurances">
            <li>
              <span aria-hidden="true">✓</span> Secure Shopify checkout
            </li>
            <li>
              <span aria-hidden="true">✓</span> Refund policy available
            </li>
            <li>
              <span aria-hidden="true">✓</span> Shipping shown at checkout
            </li>
          </ul>
        </div>
      </section>

      <OrganizationProductSection
        id={homeProducts.length ? productSectionId : undefined}
        eyebrow="Home reset"
        title="Clear the clutter from small spaces"
        body="Organizers for cabinets, counters, drawers, and the everyday items that pile up."
        products={homeProducts}
        linkLabel="Shop home organization"
        linkTo="/search?q=under%20sink%20organizer"
      />

      <OrganizationProductSection
        id={homeProducts.length ? 'travel-organizers' : productSectionId}
        eyebrow="On the go"
        title="Pack with less rummaging"
        body="Packing cubes and pouches that keep luggage and everyday carry easier to find."
        products={onTheGoProducts}
        linkLabel="Shop packing organizers"
        linkTo="/search?q=packing%20cubes"
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
function isOnTheGoProduct(product) {
  const searchable = [
    product?.title,
    product?.productType,
    ...(product?.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ');

  return /travel|luggage|packing|carry/i.test(searchable);
}

/** @param {Record<string, any>} product */
function launchPriority(product) {
  const title = product?.title ?? '';
  if (/wheeled under-sink organizer/i.test(title)) return 0;
  if (/compression packing cube/i.test(title)) return 1;
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

const HOMEPAGE_EXCLUDED_HANDLES = new Set([
  'toocki-five-clip-cable-organizer',
  'pocket-luggage-scale-50kg',
]);

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
