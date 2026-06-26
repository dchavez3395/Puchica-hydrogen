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
import {ProductForm} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {
  IconTruck,
  IconReturn,
  IconShield,
  IconPackage,
  IconShare,
  IconCheck,
  IconChevronRight,
} from '~/components/Icons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta, canonical, SITE_URL, breadcrumbJsonLd, JsonLdScript} from '~/lib/seo';
import {getJudgemeBadge} from '~/lib/judgeme';
import {ReviewStars, JudgemeReviews} from '~/components/JudgemeReviews';

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
  } catch (err) {
    logError('productRecommendations failed', err);
  }

  const reviews = await getJudgemeBadge(handle);
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, recommendations: recs, reviews};
}

export default function Product() {
  const {product, recommendations, reviews} = useLoaderData();

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

      <nav className="pk-breadcrumbs pk-product__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <Link to="/collections/all">Shop</Link>
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
        <ProductImage images={galleryImages} initialIndex={0} productTitle={title} />

        <div className="pk-product__info">
          {product.vendor && (
            <p className="pk-product__vendor">{product.vendor}</p>
          )}

          <h1 className="pk-product__title">{title}</h1>

          <div className="pk-product__price-row">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
            {selectedVariant?.availableForSale === false && (
              <span className="pk-product__badge pk-product__badge--sold">Sold out</span>
            )}
          </div>

          {reviews && reviews.count > 0 ? (
            <ReviewStars rating={reviews.rating} count={reviews.count} />
          ) : null}

          <div className="pk-product__form-wrap" id="product-form">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>

          <div className="pk-product__trust">
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon"><IconTruck size={15} /></span>
              <span>
                <strong>Free shipping</strong>
                <em>on orders over $50</em>
              </span>
            </div>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon"><IconReturn size={15} /></span>
              <span>
                <strong>30-day returns</strong>
                <em>pre-paid label included</em>
              </span>
            </div>
            <div className="pk-product__trust-item">
              <span className="pk-product__trust-icon"><IconShield size={15} /></span>
              <span>
                <strong>Secure checkout</strong>
                <em>encrypted &amp; PCI-compliant</em>
              </span>
            </div>
          </div>

          <ul className="pk-product__perks" aria-label="Shipping &amp; service promises">
            <li>
              <span className="pk-product__perk-icon" aria-hidden><IconPackage size={14} /></span>
              Packed and shipped within 1–2 business days
            </li>
            <li>
              <span className="pk-product__perk-icon" aria-hidden><IconCheck size={14} /></span>
              Curated by the Puchica team — never random
            </li>
          </ul>
        </div>
      </div>

      {/* ── Description — full-width editorial section ── */}
      {descriptionHtml && (
        <section className="pk-pdesc">
          <div className="pk-pdesc__inner">
            <p className="pk-pdesc__eyebrow">About this product</p>
            <div
              className="pk-pdesc__body"
              dangerouslySetInnerHTML={{__html: descriptionHtml}}
            />
          </div>
        </section>
      )}

      {/* ── Details accordions ── */}
      <div className="pk-pdetails">
        <Accordion title="Specifications">
          <Specs product={product} />
        </Accordion>
        <Accordion title="Shipping &amp; Returns">
          <Shipping />
        </Accordion>
      </div>

      <ShareRow product={product} />

      <JudgemeReviews
        externalId={reviews?.externalId}
        productTitle={product.title}
      />

      <Recommendations data={recommendations} />

      <MobileCart product={product} selectedVariant={selectedVariant} />

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

/* ── Accordion ── */
function Accordion({title, children}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`pk-accordion${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="pk-accordion__trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <IconChevronRight size={16} className="pk-accordion__chevron" />
      </button>
      {open && <div className="pk-accordion__body">{children}</div>}
    </div>
  );
}

/* ── Specs table ── */
function Specs({product}) {
  const rows = [
    product.vendor && ['Vendor', product.vendor],
    product.productType && ['Category', product.productType],
    product.handle && ['SKU', product.handle.toUpperCase()],
  ].filter(Boolean);

  if (rows.length === 0) {
    return <p className="pk-pdetails__empty">No specifications available.</p>;
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
function Shipping() {
  return (
    <div className="pk-pdetails__shipping">
      <h4>Shipping</h4>
      <p>
        Most orders ship within 1–2 business days. Standard delivery takes
        5–10 business days across Canada and the US. A tracking link arrives
        by email as soon as your order ships.
      </p>
      <h4>Returns</h4>
      <p>
        Something not right? You have 30 days from delivery to send it back.
        Every order ships with a pre-paid return label — print it, repack, drop
        it off. Full refund to your original payment method, no restocking fees.
      </p>
      <h4>Questions?</h4>
      <p>
        Reach us via the <Link to="/pages/contact">contact page</Link>. A real
        person on the Puchica team responds within one business day.
      </p>
    </div>
  );
}

/* ── Share ── */
function ShareRow({product}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const onShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({title: product.title, url}); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {}
    }
  };

  return (
    <div className="pk-share">
      <span>Share this product:</span>
      <button type="button" className="pk-share__btn" onClick={onShare}>
        <IconShare size={14} />
        {typeof navigator !== 'undefined' && navigator.share ? 'Share' : 'Copy link'}
      </button>
      {copied && <span className="pk-share__copied">Copied!</span>}
    </div>
  );
}

/* ── Recommendations ── */
function Recommendations({data}) {
  const products = data?.productRecommendations ?? [];
  if (!products.length) return null;
  return (
    <section className="pk-reco" aria-label="You might also like">
      <div className="pk-reco__head">
        <h2 className="pk-reco__title">You might also like</h2>
        <Link to="/collections/all" className="pk-reco__see-all">See all →</Link>
      </div>
      <div className="pk-reco__grid">
        {products.slice(0, 4).map((p, i) => (
          <ProductItem key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ── Sticky mobile ATC ── */
function MobileCart({product, selectedVariant}) {
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
        {selectedVariant.availableForSale ? 'Add to cart' : 'Sold out'}
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
    id handle title productType
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
