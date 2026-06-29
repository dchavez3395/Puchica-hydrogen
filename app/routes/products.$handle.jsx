import {useEffect, useRef, useState} from 'react';
import {useLoaderData, Link} from 'react-router';
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
import {ProductForm, FreeShippingProgress} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {
  IconTruck,
  IconReturn,
  IconShield,
  IconShare,
  IconCheck,
  IconChevronRight,
  IconSparkles,
} from '~/components/Icons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta, canonical, SITE_URL, breadcrumbJsonLd, JsonLdScript} from '~/lib/seo';
import {getJudgemeBadge} from '~/lib/judgeme';
import {ReviewStars, JudgemeReviews} from '~/components/JudgemeReviews';
import {EditorialDescription} from '~/components/EditorialDescription';
import {SplitSection, SplitHeroImage, MosaicFromGallery} from '~/components/SplitSection';
import {ScrollReveal} from '~/components/ScrollReveal';
import {useT} from '~/lib/t';

/** @type {Route.MetaFunction} */
export const meta = ({data}) => {
  if (!data?.product) return [{title: 'Puchica'}];
  const seo = data.product.seo || {};
  const title = seo.title || `${data.product.title} – Puchica`;
  const description =
    seo.description ||
    (data.product.description || '').slice(0, 160) ||
    `Shop ${data.product.title} from Puchica.`;
  const image = data.product.featuredImage?.url;
  const pathname = `/products/${data.product.handle}`;
  return puchicaMeta({title, description, image, type: 'product', pathname});
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
  const jsonLd = buildJsonLd(product, selectedVariant, reviews);

  return (
    <div className="pk-product">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <JsonLdScript data={breadcrumbJsonLd(buildBreadcrumbItems(product, title))} />

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
          {product.vendor && (
            <ScrollReveal as="p" className="pk-product__vendor" variant="up">
              {product.vendor}
            </ScrollReveal>
          )}

          <ScrollReveal as="div" delay={60} variant="up">
            <h1 className="pk-product__title">{title}</h1>
          </ScrollReveal>

          {/* ── Price + free-shipping pill — owns its own cluster so the
              eye reads the price, the threshold nudge, and the badge
              as one decision unit before the buy form. */}
          <ScrollReveal
            as="div"
            className="pk-product__price-cluster"
            delay={120}
            variant="up"
          >
            <div className="pk-product__price-row">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
              {selectedVariant?.availableForSale === false && (
                <span className="pk-product__badge pk-product__badge--sold">
                  {t('product_badge_sold_out')}
                </span>
              )}
            </div>
            <FreeShippingProgress
              selectedVariant={selectedVariant}
              qty={1}
              t={t}
            />
          </ScrollReveal>

          {reviews && reviews.count > 0 ? (
            <ScrollReveal delay={180} variant="up">
              <ReviewStars rating={reviews.rating} count={reviews.count} />
            </ScrollReveal>
          ) : null}

          <ScrollReveal delay={240} variant="up">
            <div className="pk-product__form-wrap" id="product-form">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                product={{handle: product.handle, title: product.title, featuredImage: product.featuredImage}}
              />
            </div>
          </ScrollReveal>

          {/* ── Trust block: 3 rows of promise, neutral hairline chips
              (no lime-pale fill). Each row reads heading + sub-line
              inline so the block doesn't compete with the buy form. */}
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

          {/* ── Promise callout — the brand's strongest care signal
              lifted out of the perks list and given its own block. */}
          <div className="pk-product__promise" role="note">
            <span className="pk-product__promise-icon" aria-hidden>
              <IconSparkles size={16} />
            </span>
            <p className="pk-product__promise-text">
              {t('product_perk_packed')}
            </p>
          </div>

          <ul className="pk-product__perks">
            <li>
              <span className="pk-product__perk-icon" aria-hidden>
                <IconCheck size={14} />
              </span>
              <span>{t('product_perk_curated')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Editorial description — full-bleed split layout ── */}
      <EditorialDescription
        html={descriptionHtml}
        productType={product.productType}
        galleryImages={galleryImages}
        eyebrow={t('product_desc_eyebrow')}
      />

      {/* ── Highlights — alternating split row, text left / image right.
          Reuses existing trust/perk copy so we don't ship new i18n
          strings. Anchors on the second gallery image (skipping the
          hero) and falls back to the brand-accent column. */}
      <SplitSection
        align="left"
        eyebrow={t('product_highlights_eyebrow')}
        heading={product.productType || title}
        tone="default"
        className="pk-highlights"
        visual={
          galleryImages[1] ? (
            <SplitHeroImage
              image={galleryImages[1]}
              fallbackAlt={title}
            />
          ) : (
            <MosaicFromGallery images={galleryImages} title={title} />
          )
        }
      >
        <ul className="pk-highlights__list">
          <li>
            <strong>{t('product_trust_shipping')}</strong>
            <span>{t('product_trust_shipping_sub')}</span>
          </li>
          <li>
            <strong>{t('product_trust_returns')}</strong>
            <span>{t('product_trust_returns_sub')}</span>
          </li>
          <li>
            <strong>{t('product_perk_curated')}</strong>
          </li>
        </ul>
      </SplitSection>

      {/* ── Care & shipping — alternating split row, mosaic left /
          text right. Mirrors the Shipping accordion copy in a
          cleaner editorial voice. */}
      <SplitSection
        align="right"
        eyebrow={t('product_care_eyebrow')}
        heading={t('product_care_h')}
        tone="inverse"
        className="pk-care"
        visual={
          <MosaicFromGallery images={galleryImages} title={title} />
        }
      >
        <div className="pk-care__body">
          <h3>{t('product_shipping_h')}</h3>
          <p>{t('product_shipping_body')}</p>
          <h3>{t('product_returns_h')}</h3>
          <p>{t('product_returns_body')}</p>
        </div>
      </SplitSection>

      {/* ── Details accordions (semantic <details>) ── */}
      <ScrollReveal as="div" className="pk-pdetails" variant="up">
        <DetailsAccordion title={t('product_tab_specs')}>
          <Specs product={product} t={t} />
        </DetailsAccordion>
        <DetailsAccordion title={t('product_tab_shipping')}>
          <Shipping t={t} />
        </DetailsAccordion>
      </ScrollReveal>

      <ShareRow product={product} t={t} />

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
function DetailsAccordion({title, children}) {
  return (
    <details className="pk-accordion">
      <summary className="pk-accordion__trigger">
        <span>{title}</span>
        <IconChevronRight size={16} className="pk-accordion__chevron" />
      </summary>
      <div className="pk-accordion__body">{children}</div>
    </details>
  );
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
        {helpParts[0]}
        <Link to="/pages/contact">{contactLinkText}</Link>
        {helpParts[1] ?? ''}
      </p>
    </div>
  );
}

/* ── Share ── */
function ShareRow({product, t}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

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
        {typeof navigator !== 'undefined' && navigator.share ? t('product_share_btn') : t('product_copy_link')}
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
      <ScrollReveal className="pk-reco__head">
        <h2 className="pk-reco__title">{t('product_reco_title')}</h2>
        <Link to="/collections/all" className="pk-reco__see-all">
          {t('product_reco_see_all')}
          <span className="pk-reco__see-all-arrow" aria-hidden="true">→</span>
        </Link>
      </ScrollReveal>
      <div className="pk-reco__grid">
        {products.slice(0, 4).map((p, i) => (
          <ScrollReveal
            key={p.id}
            delay={i * 80}
            variant="up"
            className="pk-reco__cell"
          >
            <ProductItem product={p} index={i} />
          </ScrollReveal>
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

function buildBreadcrumbItems(product, title) {
  const items = [{name: 'Home', url: '/'}, {name: 'Shop', url: '/collections/all'}];
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

function buildJsonLd(product, selectedVariant, reviews) {
  const productUrl = canonical(`/products/${product.handle}`);
  const price = selectedVariant?.price;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: (product.description || '').slice(0, 5000),
    image: product.featuredImage?.url ? [product.featuredImage.url] : undefined,
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
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
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
