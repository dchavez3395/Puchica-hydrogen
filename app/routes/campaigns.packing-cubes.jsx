import {useEffect} from 'react';
import {data as remixData, useLoaderData} from 'react-router';
import {Analytics, Image} from '@shopify/hydrogen';
import {ProductForm} from '~/components/ProductForm';
import {ProductPrice} from '~/components/ProductPrice';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {isLaunchReadyProduct} from '~/lib/launch-catalog';
import {recordRecentlyViewed} from '~/lib/recentlyViewed';
import {puchicaMeta} from '~/lib/seo';

const PRODUCT_HANDLE = 'red-5-piece-compression-packing-cubes';
const CAMPAIGN_VARIANT_ID = 'gid://shopify/ProductVariant/49961853026554';
const CAMPAIGN_SELECTED_OPTIONS = [
  {name: 'Color', value: '5PCS Set Red'},
];

/** @type {Route.MetaFunction} */
export const meta = ({data, params}) =>
  puchicaMeta({
    title: 'Five-piece compression packing cube set – Puchica',
    description:
      'Keep clothing separated and easier to find with the exact red five-piece compression packing cube set.',
    image: data?.product?.featuredImage?.url,
    pathname: '/campaigns/packing-cubes',
    langKey: params?.locale,
  });

/** Forward the loader's no-store policy to the rendered document response. */
export const headers = ({loaderHeaders}) => loaderHeaders;

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  const {storefront} = context;
  const {country, language} = storefront.i18n;
  const {product} = await storefront.query(CAMPAIGN_PRODUCT_QUERY, {
    variables: {
      country,
      language,
      handle: PRODUCT_HANDLE,
      selectedOptions: CAMPAIGN_SELECTED_OPTIONS,
    },
    // Offer price and availability are commerce-critical and can change in
    // Shopify independently of a storefront deployment.
    cache: storefront.CacheNone(),
  });

  const selectedVariant = product?.selectedOrFirstAvailableVariant;
  if (
    !product?.id ||
    !isLaunchReadyProduct(product) ||
    selectedVariant?.id !== CAMPAIGN_VARIANT_ID ||
    !selectedVariant.availableForSale
  ) {
    throw new Response(null, {status: 404});
  }

  // CacheNone protects the Storefront subrequest; no-store also prevents
  // Oxygen or a browser from retaining rendered offer HTML or route data.
  return remixData(
    {product},
    {headers: {'Cache-Control': 'no-store, max-age=0'}},
  );
}

export default function PackingCubesCampaign() {
  const {product} = useLoaderData();
  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const gallery = uniqueImages([
    selectedVariant?.image,
    product.featuredImage,
    ...(product.images?.nodes ?? []),
  ]).slice(0, 4);

  useEffect(() => {
    recordRecentlyViewed({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage,
      price: selectedVariant?.price,
    });
  }, [product.handle, product.title, product.featuredImage, selectedVariant?.price]);

  return (
    <div className="pk-pack-campaign">
      <section className="pk-pack-hero" aria-labelledby="packing-cubes-title">
        <div className="pk-pack-hero__copy">
          <p className="pk-pack-eyebrow">The Puchica travel edit</p>
          <h1 id="packing-cubes-title">Pack by category. Find what you need faster.</h1>
          <p className="pk-pack-hero__lede">
            Five zippered organizers help separate clothing and small travel
            essentials, so you can reach for one category instead of unpacking
            the whole suitcase. Secondary zippers help reduce the packed profile
            when each cube is closed gradually.
          </p>
          <ul className="pk-pack-proof" aria-label="Product highlights">
            <li>Exact five-piece red configuration</li>
            <li>Organizes clothing by category</li>
            <li>Spot clean and air dry</li>
          </ul>
          <a className="pk-button pk-button--primary" href="#campaign-offer">
            See the set and price
          </a>
          <p className="pk-pack-disclosure">
            Shipping options and charges are shown at checkout. A delivery
            estimate appears when one is available for your address.
          </p>
        </div>

        <div className="pk-pack-hero__media">
          {gallery[0] ? (
            <Image
              data={gallery[0]}
              aspectRatio="1/1"
              sizes="(min-width: 900px) 48vw, 100vw"
              loading="eager"
              fetchPriority="high"
            />
          ) : null}
          <span>Five pieces · selected in red</span>
        </div>
      </section>

      <section className="pk-pack-steps" aria-labelledby="packing-steps-title">
        <p className="pk-pack-eyebrow">A calmer suitcase</p>
        <h2 id="packing-steps-title">Give each part of the trip a place.</h2>
        <div className="pk-pack-steps__grid">
          <article>
            <span>01</span>
            <h3>Sort before you pack</h3>
            <p>Separate tops, bottoms, undergarments, and small essentials.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Close without forcing</h3>
            <p>Fill each organizer, then use the secondary zipper gradually.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Find one category</h3>
            <p>Reach for the organizer you need instead of emptying the bag.</p>
          </article>
        </div>
      </section>

      <section className="pk-pack-offer" id="campaign-offer" aria-labelledby="packing-offer-title">
        <div className="pk-pack-offer__gallery" aria-label="Product images">
          {gallery.map((image, index) => (
            <Image
              key={image.id || image.url}
              data={image}
              aspectRatio="1/1"
              sizes="(min-width: 900px) 28vw, 46vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        <div className="pk-pack-offer__buy">
          <p className="pk-pack-eyebrow">Exact configuration</p>
          <h2 id="packing-offer-title">{product.title}</h2>
          <div className="pk-pack-offer__price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>
          <p>
            This listing is for the selected red five-piece set shown in the
            product images. Clothing and luggage are not included.
          </p>
          <div className="pk-pack-offer__form">
            <ProductForm
              productOptions={[]}
              selectedVariant={selectedVariant}
              product={{
                handle: product.handle,
                title: product.title,
                featuredImage: product.featuredImage,
              }}
            />
          </div>
          <dl className="pk-pack-facts">
            <div>
              <dt>Contents</dt>
              <dd>Five zippered travel organizers</dd>
            </div>
            <div>
              <dt>Care</dt>
              <dd>Spot clean and allow every piece to air dry</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Options and estimates shown before payment</dd>
            </div>
            <div>
              <dt>Returns</dt>
              <dd>Start an eligible return within 30 days of delivery</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="pk-pack-clarity" aria-labelledby="packing-clarity-title">
        <div>
          <p className="pk-pack-eyebrow">Before you order</p>
          <h2 id="packing-clarity-title">Know what the set is—and what it is not.</h2>
          <p>
            These organizers are intended to make packing easier to scan and
            manage. They do not increase an airline baggage allowance or
            guarantee wrinkle-free clothing.
          </p>
        </div>
        <div className="pk-pack-faq">
          <details open>
            <summary>What arrives?</summary>
            <p>The exact five-piece red organizer configuration shown here.</p>
          </details>
          <details>
            <summary>How should I use the compression zipper?</summary>
            <p>Close it gradually and avoid overfilling or forcing the zipper.</p>
          </details>
          <details>
            <summary>When will I see shipping cost and timing?</summary>
            <p>Enter your address at checkout to see the available options before payment.</p>
          </details>
          <details>
            <summary>How do returns work?</summary>
            <p>
              Review the full eligibility and return process in our{' '}
              <Link to="/policies/refund-policy">refund policy</Link>.
            </p>
          </details>
        </div>
      </section>

      <section className="pk-pack-final" aria-labelledby="packing-final-title">
        <p className="pk-pack-eyebrow">Start with one suitcase</p>
        <h2 id="packing-final-title">Pack with less rummaging.</h2>
        <a className="pk-button pk-button--primary" href="#campaign-offer">
          View the five-piece set
        </a>
      </section>

      <a className="pk-pack-mobile-cta" href="#campaign-offer">
        See price and add to cart
      </a>

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

function uniqueImages(images) {
  const seen = new Set();
  return images.filter((image) => {
    if (!image?.url || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}

const CAMPAIGN_VARIANT_FRAGMENT = `#graphql
  fragment CampaignPackingVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
`;

const CAMPAIGN_PRODUCT_QUERY = `#graphql
  query CampaignPackingProduct(
    $country: CountryCode!
    $handle: String!
    $language: LanguageCode!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      availableForSale
      tags
      featuredImage { id url altText width height }
      images(first: 8) { nodes { id url altText width height } }
      selectedOrFirstAvailableVariant(
        selectedOptions: $selectedOptions
        ignoreUnknownOptions: true
        caseInsensitiveMatch: true
      ) { ...CampaignPackingVariant }
    }
  }
  ${CAMPAIGN_VARIANT_FRAGMENT}
`;

/** @typedef {import('./+types/campaigns.packing-cubes').Route} Route */
