import {useEffect, useState} from 'react';
import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {
  IconTruck,
  IconReturn,
  IconShield,
  IconChevronRight,
} from '~/components/Icons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta, canonical, SITE_URL, breadcrumbJsonLd, JsonLdScript} from '~/lib/seo';
import {getJudgemeBadge} from '~/lib/judgeme';
import {ReviewStars, JudgemeReviews} from '~/components/JudgemeReviews';
import {recordRecentlyViewed} from '~/lib/recentlyViewed';
import {useT} from '~/lib/t';
import {
  isLaunchReadyProduct,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';
import {presentProductTitle} from '~/lib/product-presentation';
import {DICTIONARIES} from '~/lib/dictionaries';

/** @type {Route.MetaFunction} */
export const meta = ({data, matches, params}) => {
  if (!data?.product) return [{title: 'Puchica'}];
  // Derive the langKey from the root loader (selectedLocale.language), falling
  // back to params.locale, then 'en'. Mirrors _index.jsx and policies._index.jsx
  // so canonical/og:url and the meta copy stay aligned across all 4 locales.
  const root = matches?.find((m) => m?.id === 'root');
  const langCode = (
    root?.data?.selectedLocale?.language ||
    params?.locale ||
    'en'
  ).toLowerCase();
  const langKey = ['fr', 'es', 'pt-br'].includes(langCode) ? langCode : 'en';
  const dict = DICTIONARIES[langKey] || DICTIONARIES.en;
  const seo = data.product.seo || {};
  const productTitle = presentProductTitle(data.product.title);
  const storedDescription = seo.description || '';
  // Title: prefer Shopify SEO title, otherwise build "<product> – Puchica"
  // using the locale's title suffix. The suffix is shared (" – Puchica") in
  // all 4 locales because the brand is global.
  const title =
    seo.title || `${data.product.title}${dict.pdp_meta_title_suffix}`;
  // Canada-only store: strip any U.S.-only shipping copy and avoid leaking
  // "United States" into the Canada-only meta fallback. The regex also catches
  // any lingering "U.S./United States" mentions so the live description never
  // contradicts the Canada-only market position.
  const description =
    (/u\.?s\.? shipping only|united states/i.test(storedDescription)
      ? ''
      : storedDescription) ||
    (data.product.description || '').slice(0, 160) ||
    // Fallback string from the dictionary, with {title} interpolated via
    // the same helper useT() uses so React node values flow through if a
    // caller ever passes one.
    dict.pdp_meta_description_fallback.replace(/\{title\}/g, productTitle);
  const image = data.product.featuredImage?.url;
  const pathname = `/products/${data.product.handle}`;
  return puchicaMeta({title, description, image, type: 'product', pathname, langKey});
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    throw new Response(null, {
      status: 404,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }
  const {product, reviews} = await loadCriticalData(args);
  return {product, reviews};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');
  const {country, language} = storefront.i18n;

  const productResp = await storefront.query(PRODUCT_QUERY, {
    variables: {country, handle, language, selectedOptions: getSelectedProductOptions(request)},
  });

  const product = productResp.product;
  if (!product?.id) throw new Response(null, {status: 404});
  if (!isLaunchReadyProduct(product)) {
    throw new Response(null, {status: 404});
  }

  const reviews = await getJudgemeBadge(handle);
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, reviews};
}

export default function Product() {
  const {product, reviews} = useLoaderData();
  const t = useT();
  const need = getProductNeed(product, t);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const displayTitle = presentProductTitle(title, selectedVariant);
  const summary = productSummary(product.description);
  const galleryImages = buildGallery(product, selectedVariant);
  const jsonLd = buildJsonLd(product, selectedVariant, reviews, galleryImages);

  // Record the view for the search sheet's "recently viewed" row.
  // Keyed on product.id so variant switches don't re-record.
  useEffect(() => {
    recordRecentlyViewed({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage,
      price: product.selectedOrFirstAvailableVariant?.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return (
    <div className="pk-product">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <JsonLdScript data={breadcrumbJsonLd(buildBreadcrumbItems(product, displayTitle, t))} />

      {/* ── Product hero band — full-bleed warm header with volcanic
          texture, breadcrumbs, festival stripe separator. Contains
          the breadcrumbs + gallery + buy column. */}
      <div className="pk-product__hero-band">
        <div className="pk-product__hero-band-inner">
          <nav className="pk-breadcrumbs pk-product__crumbs" aria-label={t('breadcrumb_aria')}>
            <Link to="/">{t('breadcrumb_home')}</Link>
            <span className="pk-breadcrumbs__sep">/</span>
            <Link to="/collections/all">{t('breadcrumb_shop')}</Link>
            {need ? (
              <>
                <span className="pk-breadcrumbs__sep">/</span>
                <Link to={need.url}>{need.label}</Link>
              </>
            ) : null}
            <span className="pk-breadcrumbs__sep">/</span>
            <span className="pk-breadcrumbs__current" aria-current="page">{displayTitle}</span>
          </nav>

          <div className="pk-product__top">
            <div className="pk-product__mobile-heading">
              {need ? (
                <p className="pk-product__category">{need.label}</p>
              ) : null}
              <h1 className="pk-product__title">{displayTitle}</h1>
              {reviews && reviews.count > 0 ? (
                <ReviewStars rating={reviews.rating} count={reviews.count} />
              ) : null}
              <div className="pk-product__price-row">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>
            </div>
            <ProductImage
              images={galleryImages}
              initialIndex={0}
              productTitle={title}
              modelUrl={product.model3dUrl?.value || null}
              accentColor={product.accentColor?.value || null}
            />

            <div className="pk-product__info">
          <div className="pk-product__desktop-heading">
          {/* Buy column in funnel order (audit §4): category → title →
              rating → price (+ save %) → options/qty/ATC → promise →
              trust → accordions. No scroll reveals — the buy column
              is the money UI; it must never be hidden by an observer. */}
          {need ? (
            <p className="pk-product__category">{need.label}</p>
          ) : null}

          {/* Each breakpoint exposes one semantic page title. The matching
              mobile/desktop wrapper is `display:none` at the opposite
              breakpoint, so assistive technology receives one visible H1
              while sighted desktop shoppers no longer see an aria-hidden
              title with no corresponding page heading. */}
          <h1 className="pk-product__title">{displayTitle}</h1>

          {reviews && reviews.count > 0 ? (
            <ReviewStars rating={reviews.rating} count={reviews.count} />
          ) : null}

          {summary ? <p className="pk-product__lede">{summary}</p> : null}

          <div className="pk-product__price-cluster">
            <div className="pk-product__price-row">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
              {savePercent(selectedVariant) ? (
                <span className="pk-product__badge pk-product__badge--save">
                  {t('product_badge_save', {pct: savePercent(selectedVariant)})}
                </span>
              ) : null}
              {selectedVariant?.availableForSale === false && (
                <span className="pk-product__badge pk-product__badge--sold">
                  {t('product_badge_sold_out')}
                </span>
              )}
            </div>
          </div>
          </div>

          {summary ? (
            <p className="pk-product__lede pk-product__lede--mobile">{summary}</p>
          ) : null}

          <div className="pk-product__form-wrap" id="product-form">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              product={{handle: product.handle, title: product.title, featuredImage: product.featuredImage}}
            />
          </div>

          {/* ── Trust block: 4 rows of promise, neutral hairline chips. */}
          <div className="pk-product__trust" aria-label={t('product_perks_aria')}>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon" aria-hidden>
                <IconTruck size={16} />
              </span>
              <span className="pk-product__trust-copy">
                <strong>{t('product_trust_shipping')}</strong>
                <em>{t('product_trust_shipping_sub')}</em>
              </span>
            </div>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon" aria-hidden>
                <IconReturn size={16} />
              </span>
              <span className="pk-product__trust-copy">
                <strong>{t('product_trust_returns')}</strong>
                <em>{t('product_trust_returns_sub')}</em>
              </span>
            </div>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon" aria-hidden>
                <IconShield size={16} />
              </span>
              <span className="pk-product__trust-copy">
                <strong>{t('product_trust_secure')}</strong>
                <em>{t('product_trust_secure_sub')}</em>
              </span>
            </div>
          </div>

          {/* ── Accordions — description first (it's the purchase
              decision content), then specs, then policy copy. Inside
              the buy column so everything a shopper needs to decide
              lives in one scannable column (audit §4). */}
            </div>
          </div>
        </div>
      </div>

      <section className="pk-product__details-section" aria-labelledby="product-details-heading">
        <div className="pk-product__details-story">
          <div className="pk-product__details-intro">
            <p className="pk-product__category">{need?.label || t('breadcrumb_shop')}</p>
            <h2 id="product-details-heading">{t('product_story_title')}</h2>
            {galleryImages[1] ? (
              <div className="pk-product__details-visual">
                <Image
                  data={galleryImages[1]}
                  alt={galleryImages[1].altText || displayTitle}
                  aspectRatio="4/3"
                  sizes="(min-width: 60em) 34rem, 100vw"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
          <div className="pk-pdetails">
            <div className="pk-product__description-card">
              <div
                className="pk-pdetails__desc"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </div>
          </div>
          <div className="pk-product__details-shipping">
            <DetailsAccordion title={t('product_tab_shipping')}>
              <Shipping t={t} />
            </DetailsAccordion>
          </div>
        </div>
      </section>

      {reviews?.count > 0 ? (
        <JudgemeReviews
          externalId={reviews.externalId}
          productTitle={product.title}
        />
      ) : null}

      <MobileCart product={product} selectedVariant={selectedVariant} t={t} />

      <Analytics.ProductView
        data={{
          products: [{
            id: product.id,
            title: product.title,
            price: selectedVariant?.price?.amount || '0',
            vendor: product.vendor,
            variantId: selectedVariant?.id || '',
            variantTitle: selectedVariant?.title || '',
            quantity: 1,
          }],
        }}
      />
    </div>
  );
}

/* ── Accordion — semantic <details> so keyboard a11y comes for free ── */
function DetailsAccordion({title, children, defaultOpen = false}) {
  return (
    <details className="pk-accordion" open={defaultOpen || undefined}>
      <summary className="pk-accordion__trigger">
        <span>{title}</span>
        <span className="pk-accordion__indicator" aria-hidden="true">
          <IconChevronRight size={18} className="pk-accordion__chevron" />
        </span>
      </summary>
      <div className="pk-accordion__body">{children}</div>
    </details>
  );
}

/* ── Save % — sale math for the price badge. Whole percents only;
   anything under 5% reads as noise, so it's suppressed. */
function savePercent(variant) {
  const price = Number(variant?.price?.amount);
  const compare = Number(variant?.compareAtPrice?.amount);
  if (!price || !compare || compare <= price) return null;
  const pct = Math.round((1 - price / compare) * 100);
  return pct >= 5 ? pct : null;
}

/* ── Specs table ── */
/* ── Shipping & Returns copy ── */
function Shipping({t}) {
  const helpBody = t('product_help_body');
  const contactLinkText = t('product_help_contact_link');
  const helpParts = helpBody.split(contactLinkText);
  return (
    <div className="pk-pdetails__shipping">
      <h3>{t('product_shipping_h')}</h3>
      <p>{t('product_shipping_body')}</p>
      <h3>{t('product_returns_h')}</h3>
      <p>{t('product_returns_body')}</p>
      <h3>{t('product_help_h')}</h3>
      <p>
        {helpParts[0]}
        <Link to="/pages/contact">{contactLinkText}</Link>
        {helpParts[1] ?? ''}
      </p>
    </div>
  );
}

/* ── Sticky mobile ATC ── */
function MobileCart({product, selectedVariant, t}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const form = document.getElementById('product-form');
    if (!form) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(form.getBoundingClientRect().bottom < 0);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [product.id, selectedVariant?.id]);

  if (!selectedVariant || !visible) return null;

  return (
    <div className="pk-mob-cart" data-visible="true">
      <div className="pk-mob-cart__left">
        <p className="pk-mob-cart__title">{product.title}</p>
        <span className="pk-mob-cart__price">
          <ProductPrice
            price={selectedVariant.price}
            compareAtPrice={selectedVariant.compareAtPrice}
          />
        </span>
      </div>
      <div className="pk-mob-cart__btn">
        <AddToCartButton
          disabled={!selectedVariant.availableForSale}
          lines={selectedVariant.availableForSale ? [{
            merchandiseId: selectedVariant.id,
            quantity: 1,
            selectedVariant,
          }] : []}
          addedLabel={null}
      >
        {selectedVariant.availableForSale ? t('product_add_to_cart') : t('product_sold_out')}
        </AddToCartButton>
      </div>
    </div>
  );
}

/* ── helpers ── */

function buildGallery(product, selectedVariant) {
  const list = [];
  const seen = new Set();
  const push = (img) => {
    if (img?.url && !seen.has(img.url)) { seen.add(img.url); list.push(img); }
  };
  push(selectedVariant?.image);
  push(product.featuredImage);
  if (Array.isArray(product.images?.nodes)) product.images.nodes.forEach(push);
  return list;
}

function buildBreadcrumbItems(product, title, t) {
  const items = [{name: t('breadcrumb_home'), url: '/'}, {name: t('breadcrumb_shop'), url: '/collections/all'}];
  const need = getProductNeed(product, t);
  if (need) {
    items.push({name: need.label, url: need.url});
  }
  items.push({name: title, url: `/products/${product.handle}`});
  return items;
}

function getProductNeed(product, t) {
  const haystack = `${product?.productType || ''} ${product?.title || ''}`;
  if (/cable|cord|charger|electronic/i.test(haystack)) {
    return {
      label: t('megamenu_intent_cable_title'),
      url: '/search?q=cable%20organizer',
    };
  }
  if (/travel|packing|luggage|bag|pouch/i.test(haystack)) {
    return {
      label: t('megamenu_intent_travel_title'),
      url: '/search?q=packing%20cubes',
    };
  }
  return {
    label: t('megamenu_intent_home_title'),
    url: '/search?q=under%20sink%20organizer',
  };
}

function productSummary(description) {
  const clean = String(description || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const firstSentence = clean.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return firstSentence || clean.slice(0, 180).trim();
}

function buildJsonLd(product, selectedVariant, reviews, galleryImages) {
  const productUrl = canonical(`/products/${product.handle}`);
  const price = selectedVariant?.price;
  // Expose the full gallery (deduped, capped) so Google rich results / Merchant
  // listings can show multiple images — falls back to the featured image.
  const images = Array.isArray(galleryImages)
    ? [...new Set(galleryImages.map((i) => i?.url).filter(Boolean))].slice(0, 10)
    : [];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: (product.description || '').slice(0, 5000),
    image: images.length
      ? images
      : product.featuredImage?.url
        ? [product.featuredImage.url]
        : undefined,
    sku: selectedVariant?.sku || product.handle,
    seller: {'@type': 'Organization', name: 'Puchica', url: SITE_URL},
    aggregateRating: reviews?.count > 0
      ? {'@type': 'AggregateRating', ratingValue: reviews.rating, reviewCount: reviews.count}
      : undefined,
    offers: price ? {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: price.currencyCode,
      price: price.amount,
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    } : undefined,
  };
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    # quantityAvailable intentionally omitted: the dev Storefront API
    # token lacks unauthenticated_read_product_inventory and the field
    # would fail every request. Stock-driven UI null-checks before
    # rendering, so the page degrades to no stock signal.
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id title vendor handle descriptionHtml description productType availableForSale tags
    encodedVariantExistence encodedVariantAvailability
    featuredImage { id url altText width height }
    images(first: 10) {
      nodes { id url altText width height }
    }
    # Optional product-level metafields. The 3D viewer toggles on
    # the model_3d_url key; without it the toggle stays hidden so
    # we don't show a broken button. The hero gallery picks up the
    # accent_color metafield for the soft gradient behind the hero.
    model3dUrl: metafield(namespace: "custom", key: "model_3d_url") { value }
    accentColor: metafield(namespace: "custom", key: "accent_color") { value }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch { color image { previewImage { url } } }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode!
    $handle: String!
    $language: LanguageCode!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...Product }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
