import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  presentProductDepartment,
  presentProductTitle,
} from '~/lib/product-presentation';
import {useT} from '~/lib/t';
import {useRouteLoaderData} from 'react-router';
import {findApprovedVariant} from '~/lib/launch-catalog';

/**
 * Focused landing experience for Puchica's travel-organization launch.
 * Products are launch-filtered in each route loader before they reach here.
 *
 * @param {{products?: Array<Record<string, any>>, campaign?: boolean}} props
 */
export function SmallSpaceLanding(props) {
  const {products = [], campaign = false} = props;
  const t = useT();
  const rootData = useRouteLoaderData('root');
  const market = rootData?.selectedLocale?.country || 'CA';
  const rankedProducts = [...products].sort(compareLaunchPriority);
  const heroPrimary = rankedProducts[0];
  // The overlay identifies the same product shown in the hero image. Pairing a
  // different product here made the visual read like a misleading product card.
  const heroFeature = heroPrimary;
  const heroFeatureVariant = findApprovedVariant(heroFeature, market);
  const heroDisplayTitle = heroFeature
    ? presentProductTitle(
        heroFeature.title,
        heroFeatureVariant,
        heroFeature.handle,
        t,
      )
    : '';
  // Lead with the approved variant image, not the product-level gallery cover.
  // The latter can show colours or configurations that are not offered in the
  // selected market and made the hero/card pairing look like two products.
  const heroImage = heroFeatureVariant?.image || heroPrimary?.featuredImage;
  const productSectionId = campaign ? 'shop-travel-organizers' : 'travel-edit';
  const isFullEdit = rankedProducts.length >= 3;
  const heroDescription = isFullEdit
    ? t('launch_home_hero_body_full')
    : rankedProducts.length === 1
      ? t('launch_home_hero_body_single')
      : t('launch_home_hero_body_focused');

  return (
    <>
      <section
        className="pk-campaign-hero"
        aria-labelledby="organization-title"
      >
        <div className="pk-campaign-hero__copy">
          <p className="pk-campaign__eyebrow">{t('launch_home_eyebrow')}</p>
          <h1 id="organization-title">{t('launch_home_title')}</h1>
          <p>{heroDescription}</p>
        </div>

        <div className="pk-campaign-hero__visual">
          {heroImage ? (
            <Image
              className="pk-campaign-lifestyle"
              data={heroImage}
              alt={heroImage.altText || heroDisplayTitle}
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
              aria-label={t('launch_home_shop_product', {
                title: heroDisplayTitle,
              })}
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
                <small>{t('launch_home_featured')}</small>
                <strong>{heroDisplayTitle}</strong>
                {heroFeatureVariant?.price ? (
                  <span className="pk-campaign-feature__price">
                    <CurrencyMoney data={heroFeatureVariant.price} />
                  </span>
                ) : null}
                <span className="pk-campaign-feature__link">
                  {t('launch_home_view_organizer')}{' '}
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
              {t('launch_home_shop_edit')}
            </a>
            <Link
              className="pk-campaign-text-link"
              to="/collections/all"
              prefetch="intent"
            >
              {t('launch_home_browse_collection')}{' '}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul
            className="pk-campaign-proof"
            aria-label={t('launch_home_assurances_aria')}
          >
            <li>
              <span aria-hidden="true">✓</span>{' '}
              {t('launch_home_assurance_checkout')}
            </li>
            <li>
              <span aria-hidden="true">✓</span>{' '}
              {t('launch_home_assurance_details')}
            </li>
            <li>
              <span aria-hidden="true">✓</span>{' '}
              {t('launch_home_assurance_shipping')}
            </li>
          </ul>
        </div>
      </section>

      <OrganizationProductSection
        id={productSectionId}
        eyebrow={
          isFullEdit
            ? t('launch_home_section_eyebrow_full')
            : t('launch_home_section_eyebrow_focused')
        }
        title={
          isFullEdit
            ? t('launch_home_section_title_full')
            : t('launch_home_section_title_focused')
        }
        body={
          isFullEdit
            ? t('launch_home_section_body_full')
            : t('launch_home_section_body_focused')
        }
        products={rankedProducts}
        market={market}
        linkLabel={t('launch_home_view_all')}
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
 *   market: string;
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
  market,
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
          const variant = findApprovedVariant(product, market);
          const image = variant?.image || product.featuredImage;
          const displayTitle = presentProductTitle(
            product.title,
            variant,
            product.handle,
            t,
          );
          const department = presentProductDepartment(product, t);

          return (
            <Link
              className="pk-campaign-editorial-card"
              key={product.id}
              to={`/products/${product.handle}`}
              prefetch="intent"
              aria-label={t('launch_home_view_product', {title: displayTitle})}
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
                    {t('launch_home_view_organizer')}{' '}
                    <span aria-hidden="true">→</span>
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
  // Keep the homepage aligned with the current three-product organic launch
  // cohort. These are the supplier-screened products we can support with the
  // simplest one-person fulfillment routine.
  if (/travel toiletry organizer/i.test(title)) return 0;
  if (/3-piece packing cube/i.test(title)) return 1;
  if (/travel jewelry case/i.test(title)) return 2;
  return 10;
}

/** @param {Record<string, any>} a @param {Record<string, any>} b */
function compareLaunchPriority(a, b) {
  return launchPriority(a) - launchPriority(b);
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
        sku
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
