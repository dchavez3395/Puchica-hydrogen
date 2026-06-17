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
} from '~/components/Icons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta, canonical, SITE_URL, breadcrumbJsonLd, JsonLdScript} from '~/lib/seo';

/**
 * @type {Route.MetaFunction}
 */
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
  return puchicaMeta({
    title,
    description,
    image,
    type: 'product',
    pathname,
  });
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Critical path: product + recommendations. Recommendations are small
  // (≤ 4 products) and cheap, so we include them in the initial load so
  // they ship with the SSR HTML.
  const {product, recommendations} = await loadCriticalData(args);
  return {product, recommendations};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  // The buyer's region (country + language) is the source of truth for
  // availableForSale on every variant. Hydrogen always sends this
  // context on cart mutations, so the product page must use the same
  // context or the storefront and the cart will disagree — and the
  // cart action will silently turn a "in stock" variant into a qty-0
  // ghost line on add. (See the @inContext directive on
  // PRODUCT_QUERY below.)
  const {country, language} = storefront.i18n;

  const productResp = await storefront.query(PRODUCT_QUERY, {
    variables: {
      country,
      handle,
      language,
      selectedOptions: getSelectedProductOptions(request),
    },
  });

  const product = productResp.product;
  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // Recommendations: best-effort. If they fail or return null, the page
  // still renders fully.
  let recs = null;
  try {
    recs = await storefront.query(PRODUCT_RECOMMENDATIONS_QUERY, {
      variables: {
        country,
        language,
        productId: product.id,
      },
    });
  } catch (err) {
    console.error('productRecommendations failed:', err);
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, recommendations: recs};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, recommendations} = useLoaderData();

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

  // Build the gallery image list: variant image first (so changing options
  // updates the hero), then the product's other images deduplicated.
  const galleryImages = buildGallery(product, selectedVariant);

  // JSON-LD Product schema for SEO.
  const jsonLd = buildJsonLd(product, selectedVariant);

  return (
    <div className="pk-product">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <JsonLdScript
        data={breadcrumbJsonLd(buildBreadcrumbItems(product, title))}
      />

      <nav className="pk-breadcrumbs pk-product__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <Link to="/collections/all">Shop</Link>
        {product.productType ? (
          <>
            <span className="pk-breadcrumbs__sep">/</span>
            <Link to={`/collections/all`}>{product.productType}</Link>
          </>
        ) : null}
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{title}</span>
      </nav>

      {/* Two-column image + info row. Wrapped so the sticky info column
       * sticks only WITHIN this row, not the whole page. Without the
       * wrapper, the parent grid extends past the image to fit the
       * tabs + recommendations below, and the sticky info column never
       * un-sticks — it pins to the top of the viewport and paints
       * over the tabs/recommendations. */}
      <div className="pk-product__top">
        <ProductImage
          images={galleryImages}
          initialIndex={0}
          productTitle={title}
        />

        <div className="pk-product__info">
          {product.vendor ? (
            <p className="pk-product__vendor">{product.vendor}</p>
          ) : null}
          <h1 className="pk-product__title">{title}</h1>
          <div className="pk-product__price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <div className="pk-trust-strip" aria-label="Service highlights">
            <span className="pk-trust-strip__item">
              <span aria-hidden><IconTruck size={14} /></span>
              Free shipping over $50
            </span>
            <span className="pk-trust-strip__item">
              <span aria-hidden><IconReturn size={14} /></span>
              30-day returns
            </span>
            <span className="pk-trust-strip__item">
              <span aria-hidden><IconShield size={14} /></span>
              Secure checkout
            </span>
          </div>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          <ul className="pk-product__perks" aria-label="What's included">
            <li>
              <span aria-hidden><IconPackage size={16} /></span>
              <span>Carefully packed and shipped within 1–2 business days</span>
            </li>
            <li>
              <span aria-hidden><IconReturn size={16} /></span>
              <span>Pre-paid return label included with every order</span>
            </li>
            <li>
              <span aria-hidden><IconCheck size={16} /></span>
              <span>Curated by the Puchica team — never random</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="pk-tabs" aria-label="Product details">
        <Tabs product={product} descriptionHtml={descriptionHtml} />
      </section>

      <ShareRow product={product} />

      <Recommendations data={recommendations} />

      <MobileCart product={product} selectedVariant={selectedVariant} />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price?.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/* ---------- subcomponents ---------- */

function Tabs({product, descriptionHtml}) {
  const [active, setActive] = useState('description');
  const tabs = [
    {id: 'description', label: 'Description'},
    {id: 'specs', label: 'Specifications'},
    {id: 'shipping', label: 'Shipping & Returns'},
  ];
  return (
    <>
      <div className="pk-tabs__nav" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            aria-selected={active === t.id}
            className="pk-tabs__tab"
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        className="pk-tabs__panel"
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {active === 'description' && (
          descriptionHtml ? (
            <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          ) : (
            <p>No additional description for this product.</p>
          )
        )}
        {active === 'specs' && <Specs product={product} />}
        {active === 'shipping' && <Shipping />}
      </div>
    </>
  );
}

function Specs({product}) {
  const rows = [
    product.vendor && ['Vendor', product.vendor],
    product.productType && ['Category', product.productType],
    product.handle && ['SKU', product.handle.toUpperCase()],
  ].filter(Boolean);
  if (rows.length === 0) {
    return <p>No specifications available for this product.</p>;
  }
  return (
    <table>
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

function Shipping() {
  return (
    <>
      <h3>Shipping</h3>
      <p>
        Most orders ship within 1–2 business days from our warehouse. Standard
        delivery takes 5–10 business days across Canada and the US. You&apos;ll
        receive a tracking link by email as soon as your order ships.
      </p>
      <h3>Returns</h3>
      <p>
        If something isn&apos;t right, you have 30 days from the delivery date
        to send it back. Every order ships with a pre-paid return label — print
        it, repack the item, and drop it off. Full refund to the original
        payment method, no restocking fees.
      </p>
      <h3>Need help?</h3>
      <p>
        Reach us anytime via the contact page. A real person on the Puchica team
        will get back to you within one business day.
      </p>
    </>
  );
}

function ShareRow({product}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers / insecure context — just leave the button alone.
    }
  };

  const onShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({title: product.title, url});
      } catch {
        // user cancelled
      }
    } else {
      onCopy();
    }
  };

  return (
    <div className="pk-share">
      <span>Share:</span>
      <button type="button" className="pk-share__btn" onClick={onShare}>
        <IconShare size={14} />
        {typeof navigator !== 'undefined' && navigator.share ? 'Share' : 'Copy link'}
      </button>
      {copied && <span className="pk-share__copied">Link copied</span>}
    </div>
  );
}

function Recommendations({data}) {
  // data may be null (loader failure) or {productRecommendations: [...]}
  const products = data?.productRecommendations ?? [];
  if (!products.length) return null;
  return (
    <section className="pk-reco" aria-label="You might also like">
      <h2 className="pk-reco__title">You might also like</h2>
      <div className="pk-reco__grid">
        {products.slice(0, 4).map((p) => (
          <ProductItem key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function MobileCart({product, selectedVariant}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  // Show the sticky bar once the user scrolls past the in-page add-to-cart
  // (the .product-form element). Re-check on resize and on scroll, throttled
  // to one frame via rAF.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const form = document.querySelector('.pk-product .product-form');
    if (!form) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const r = form.getBoundingClientRect();
        setVisible(r.bottom < 0);
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
      <span className="pk-mob-cart__price">
        <ProductPrice
          price={selectedVariant.price}
          compareAtPrice={selectedVariant.compareAtPrice}
        />
      </span>
      <a
        href="#product-form"
        className="pk-btn pk-btn--primary pk-mob-cart__btn"
        onClick={(e) => {
          e.preventDefault();
          const form = document.querySelector(
            '.pk-product .product-form button[type="submit"]',
          );
          if (form instanceof HTMLElement) form.click();
        }}
      >
        {selectedVariant.availableForSale ? 'Add to cart' : 'Sold out'}
      </a>
    </div>
  );
}

/* ---------- helpers ---------- */

function buildGallery(product, selectedVariant) {
  const list = [];
  const seen = new Set();
  const push = (img) => {
    if (img && img.url && !seen.has(img.url)) {
      seen.add(img.url);
      list.push(img);
    }
  };
  push(selectedVariant?.image);
  push(product.featuredImage);
  if (Array.isArray(product.images?.nodes)) {
    for (const edge of product.images.nodes) push(edge);
  }
  return list;
}

/**
 * Build the breadcrumb items for a product, mirroring the on-page nav
 * exactly: Home → Shop → productType? → title. Used to build the
 * BreadcrumbList JSON-LD so search engines can render rich breadcrumb
 * crumbs in the SERP. Order MUST match the rendered <nav>.
 */
function buildBreadcrumbItems(product, title) {
  const items = [
    {name: 'Home', url: '/'},
    {name: 'Shop', url: '/collections/all'},
  ];
  if (product.productType) {
    items.push({name: product.productType, url: '/collections/all'});
  }
  items.push({name: title, url: `/products/${product.handle}`});
  return items;
}

function buildJsonLd(product, selectedVariant) {
  const productUrl = canonical(`/products/${product.handle}`);
  // Always use the canonical product URL for the offer. Never use
  // `window.location.href` here — that varies by query string (e.g. when
  // the user picks a Size, the URL is /products/foo?Size=XS) and it
  // also diverges between SSR and CSR (localhost in dev, puchica.ca in
  // prod), which breaks React hydration. The canonical product URL is
  // the right thing for Google either way.
  const url = productUrl;
  const price = selectedVariant?.price;
  const availability = selectedVariant?.availableForSale
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: (product.description || '').slice(0, 5000),
    image: product.featuredImage?.url
      ? [product.featuredImage.url]
      : undefined,
    sku: selectedVariant?.sku || product.handle,
    // Puchica is a dropshipper — `product.vendor` is the *supplier*,
    // not the brand. Always attribute the product to Puchica so Google
    // associates the listing with the storefront, not the manufacturer.
    brand: {'@type': 'Brand', name: 'Puchica'},
    seller: {
      '@type': 'Organization',
      name: 'Puchica',
      url: SITE_URL,
    },
    offers: price
      ? {
          '@type': 'Offer',
          '@id': `${productUrl}#offer`,
          url,
          priceCurrency: price.currencyCode,
          price: price.amount,
          availability,
          itemCondition: 'https://schema.org/NewCondition',
        }
      : undefined,
  };
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
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
    id
    title
    vendor
    handle
    descriptionHtml
    description
    productType
    encodedVariantExistence
    encodedVariantAvailability
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode!
    $handle: String!
    $language: LanguageCode!
    $selectedOptions: [SelectedOptionInput!]!)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RECOMMENDED_ITEM_FRAGMENT = `#graphql
  fragment RecommendedProduct on Product {
    id
    handle
    title
    productType
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
  }
`;

const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  ${RECOMMENDED_ITEM_FRAGMENT}
  query ProductRecommendations(
    $country: CountryCode!
    $language: LanguageCode!
    $productId: ID!)
  @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...RecommendedProduct
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
