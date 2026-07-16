import {useEffect, useRef, useState} from 'react';
import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {error as logError} from '~/lib/logger';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {
  IconTruck,
  IconReturn,
  IconShield,
  IconShare,
  IconCheck,
  IconChevronRight,
  IconSparkles,
  IconPackage,
} from '~/components/Icons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta, canonical, SITE_URL, breadcrumbJsonLd, JsonLdScript} from '~/lib/seo';
import {getJudgemeBadge} from '~/lib/judgeme';
import {ReviewStars, JudgemeReviews} from '~/components/JudgemeReviews';
import {recordRecentlyViewed} from '~/lib/recentlyViewed';
import {useT} from '~/lib/t';

/** @type {Route.MetaFunction} */
export const meta = ({data, params}) => {
  if (!data?.product) return [{title: 'Puchica'}];
  const seo = data.product.seo || {};
  const title = seo.title || `${data.product.title} – Puchica`;
  const description =
    seo.description ||
    (data.product.description || '').slice(0, 160) ||
    `Shop ${data.product.title} from Puchica.`;
  const image = data.product.featuredImage?.url;
  const pathname = `/products/${data.product.handle}`;
  return puchicaMeta({title, description, image, type: 'product', pathname, langKey: params?.locale});
};

/** @param {Route.LoaderArgs} args */
export async function loader(args) {
  const {product, recommendations, reviews} = await loadCriticalData(args);
  return {product, recommendations, reviews};
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

  let recs = null;
  try {
    recs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: {country, language, productId: product.id},
    });
  } catch (recErr) {
    logError('productRecommendations failed', recErr);
  }

  const reviews = await getJudgemeBadge(handle);
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, recommendations: recs, reviews};
}

export default function Product() {
  const {product, recommendations, reviews} = useLoaderData();
  const t = useT();

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
      <JsonLdScript data={breadcrumbJsonLd(buildBreadcrumbItems(product, title, t))} />

      <nav className="pk-breadcrumbs pk-product__crumbs" aria-label={t('breadcrumb_aria')}>
        <Link to="/">{t('breadcrumb_home')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <Link to="/collections/all">{t('breadcrumb_shop')}</Link>
        {product.productType ? (
          <>
            <span className="pk-breadcrumbs__sep">/</span>
            <Link to={`/collections/${productTypeSlug(product.productType)}`}>
              {product.productType}
            </Link>
          </>
        ) : null}
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{title}</span>
      </nav>

      {/* ── Top: gallery + sticky buy box ── */}
      <div className="pk-product__top">
        <ProductImage
          images={galleryImages}
          initialIndex={0}
          productTitle={title}
          modelUrl={product.model3dUrl?.value || null}
          accentColor={product.accentColor?.value || null}
        />

        <div className="pk-product__info">
          {/* Buy column in funnel order (audit §4): category → title →
              rating → price (+ save %) → options/qty/ATC → promise →
              trust → accordions. No scroll reveals — the buy column
              is the money UI; it must never be hidden by an observer. */}
          {product.productType ? (
            <p className="pk-product__category">{product.productType}</p>
          ) : null}

          <h1 className="pk-product__title">{title}</h1>

          {reviews && reviews.count > 0 ? (
            <ReviewStars rating={reviews.rating} count={reviews.count} />
          ) : null}

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

          {/* ── FIRST15 offer badge — surfaces the discount right at the
              buy box so shoppers don't have to discover it in the
              announcement bar (audit §4: offer visibility). */}
          <div className="pk-product__offer" role="note">
            <div className="pk-product__offer-first15">
              <span className="pk-product__offer-tag" aria-hidden>FIRST15</span>
              <span className="pk-product__offer-text">
                {t('product_offer_first15_h')} — {t('product_offer_first15_body')}
              </span>
            </div>
            <div className="pk-product__offer-shipping">
              <IconTruck size={14} />
              <span>{t('product_offer_shipping_body')}</span>
            </div>
          </div>

          <div className="pk-product__form-wrap" id="product-form">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              product={{handle: product.handle, title: product.title, featuredImage: product.featuredImage}}
            />
          </div>

          {/* ── Shipping promise well — the strongest care signal,
              directly under the buy button (audit §4 buy-column order). */}
          <div className="pk-product__promise" role="note">
            <span className="pk-product__promise-icon" aria-hidden>
              <IconSparkles size={16} />
            </span>
            <p className="pk-product__promise-text">
              {t('product_perk_packed')}
            </p>
          </div>

          {/* ── Trust block: 4 rows of promise, neutral hairline chips. */}
          <div className="pk-product__trust" aria-label={t('product_perks_aria')}>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon" aria-hidden>
                <IconTruck size={16} />
              </span>
              <div>
                <strong>{t('product_shipping_h')}</strong>
                <p>{t('product_shipping_body')}</p>
              </div>
            </div>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon" aria-hidden>
                <IconReturn size={16} />
              </span>
              <div>
                <strong>{t('product_returns_h')}</strong>
                <p>{t('product_returns_body')}</p>
              </div>
            </div>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon" aria-hidden>
                <IconShield size={16} />
              </span>
              <div>
                <strong>{t('product_secure_h')}</strong>
                <p>{t('product_secure_body')}</p>
              </div>
            </div>
          </div>

          {/* ── Accordions — description first (it's the purchase
              decision content), then specs, then policy copy. Inside
              the buy column so everything a shopper needs to decide
              lives in one scannable column (audit §4). */}
          <div className="pk-pdetails">
            <DetailsAccordion title={t('product_tab_description')} defaultOpen>
              <div
                className="pk-pdetails__desc"
                dangerouslySetInnerHTML={{__html: descriptionHtml}}
              />
            </DetailsAccordion>
            <DetailsAccordion title={t('product_tab_specs')}>
              <Specs product={product} t={t} />
            </DetailsAccordion>
            <DetailsAccordion title={t('product_tab_shipping')}>
              <Shipping t={t} />
            </DetailsAccordion>
          </div>

          <ul className="pk-product__perks" aria-label="What's included">
            <li>
              <span aria-hidden><IconPackage size={16} /></span>
              <span>Carefully packed and shipped within 1–2 business days</span>
            </li>
            <li>
              <span aria-hidden><IconReturn size={16} /></span>
              <span>30-day returns — see refund policy for details</span>
            </li>
            <li>
              <span aria-hidden><IconCheck size={16} /></span>
              <span>Curated by the Puchica team — never random</span>
            </li>
          </ul>
        </div>
      </div>

      <JudgemeReviews
        externalId={reviews?.externalId}
        productTitle={product.title}
      />

      <Recommendations data={recommendations} t={t} />

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
        <IconChevronRight size={16} className="pk-accordion__chevron" />
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
function Specs({product, t}) {
  const rows = [
    product.vendor && [t('product_spec_vendor'), product.vendor],
    product.productType && [t('product_spec_category'), product.productType],
    product.handle && [t('product_spec_sku'), product.handle.toUpperCase()],
  ].filter(Boolean);

  if (rows.length === 0) {
    return <p className="pk-pdetails__empty">{t('product_specs_empty')}</p>;
  }
  return (
    <table className="pk-pdetails__table">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Shipping & Returns copy ── */
function Shipping({t}) {
  const helpBody = t('product_help_body');
  const contactLinkText = t('product_help_contact_link');
  const helpParts = helpBody.split(contactLinkText);
  return (
    <div className="pk-pdetails__shipping">
      <h4>{t('product_shipping_h')}</h4>
      <p>{t('product_shipping_body')}</p>
      <h4>{t('product_returns_h')}</h4>
      <p>{t('product_returns_body')}</p>
      <h4>{t('product_help_h')}</h4>
      <p>
        Orders are processed within 1–2 business days. Shipping options
        and delivery estimates are shown at checkout. You&apos;ll receive
        a tracking link by email when your order ships. Products may be
        fulfilled by third-party suppliers — shipping origin and timing
        can vary by item.
      </p>
      <h3>Returns</h3>
      <p>
        If something isn&apos;t right, you have 30 days from the delivery date
        to start a return. Email hello@puchica.ca with your order number
        and we&apos;ll guide you through the process. Refunds are issued
        to the original payment method within 5–7 business days of us
        receiving the return.
      </p>
      <h3>Need help?</h3>
      <p>
        Reach us anytime via the contact page. A real person on the Puchica team
        will get back to you within one business day.
      </p>
    </div>
  );
}

/* ── Share ── */
function ShareRow({product, t}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  // The Web Share API label must be resolved AFTER mount. Checking
  // navigator.share during render makes the server ("Copy link") and client
  // ("Share") disagree, which triggers a hydration mismatch that forces the
  // ENTIRE root to re-render on the client. Start false (matches SSR), upgrade
  // after hydration.
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const onShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({title: product.title, url});
      } catch {
        // User-cancelled or share API unavailable — fall through to the
        // clipboard branch below.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // Clipboard write blocked (insecure context / permission denied).
        // Fall back silently — the share row still renders the link.
      }
    }
  };

  return (
    <div className="pk-share">
      <span>{t('product_share_label')}</span>
      <button type="button" className="pk-share__btn" onClick={onShare}>
        <IconShare size={14} />
        {canShare ? t('product_share_btn') : t('product_copy_link')}
      </button>
      {copied && <span className="pk-share__copied">{t('product_link_copied')}</span>}
    </div>
  );
}

/* ── Recommendations ── */
function Recommendations({data, t}) {
  const products = data?.productRecommendations ?? [];
  if (!products.length) return null;
  return (
    <section className="pk-reco" aria-label={t('product_reco_title')}>
      <div className="pk-reco__head">
        <h2 className="pk-reco__title">{t('product_reco_title')}</h2>
        <Link to="/collections/all" className="pk-reco__see-all">
          {t('product_reco_see_all')}
          <span className="pk-reco__see-all-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="pk-reco__grid">
        {products.slice(0, 4).map((p) => (
          <div key={p.id} className="pk-reco__cell">
            <ProductItem product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Sticky mobile ATC ── */
function MobileCart({product, selectedVariant, t}) {
  const ref = useRef(null);
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

  if (!selectedVariant) return null;

  return (
    <div
      ref={ref}
      className="pk-mob-cart"
      data-visible={visible ? 'true' : 'false'}
      aria-hidden={!visible}
    >
      <div className="pk-mob-cart__left">
        <p className="pk-mob-cart__title">{product.title}</p>
        <span className="pk-mob-cart__price">
          <ProductPrice
            price={selectedVariant.price}
            compareAtPrice={selectedVariant.compareAtPrice}
          />
        </span>
      </div>
      <button
        type="button"
        className="pk-btn pk-btn--primary pk-mob-cart__btn"
        onClick={() => {
          const form = document.getElementById('product-form');
          if (form instanceof HTMLElement) {
            form.scrollIntoView({behavior: 'smooth', block: 'center'});
            window.setTimeout(() => form.querySelector('button[type="submit"]')?.click(), 280);
          }
        }}
      >
        {selectedVariant.availableForSale ? t('product_add_to_cart') : t('product_sold_out')}
      </button>
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
  if (product.productType) {
    items.push({name: product.productType, url: `/collections/${productTypeSlug(product.productType)}`});
  }
  items.push({name: title, url: `/products/${product.handle}`});
  return items;
}

function productTypeSlug(productType) {
  if (!productType) return 'all';
  return productType.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'all';
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
    brand: {'@type': 'Brand', name: 'Puchica'},
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
    id title vendor handle descriptionHtml description productType
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

const RECOMMENDED_ITEM_FRAGMENT = `#graphql
  fragment RecommendedProduct on Product {
    id handle title productType tags
    featuredImage { id url altText width height }
    images(first: 2) { nodes { id url altText width height } }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    options(first: 1) {
      name
      values
      optionValues {
        name
        swatch { color }
      }
    }
    variants(first: 1) { nodes { id availableForSale } }
  }
`;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  ${RECOMMENDED_ITEM_FRAGMENT}
  query ProductRecommendations(
    $country: CountryCode!
    $language: LanguageCode!
    $productId: ID!
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) { ...RecommendedProduct }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
