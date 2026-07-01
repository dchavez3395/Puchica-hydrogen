import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {puchicaMeta} from '~/lib/seo';
import {categoryIcon} from '~/components/Icons';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'Collections – Puchica',
    description:
      'Shop Puchica by collection — 19 categories across home, beauty, tech, pet, apparel, health, and more. Free shipping over $50, easy 30-day returns.',
    pathname: '/collections',
    langKey: params?.locale,
  });
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const {country, language} = context.storefront.i18n;
  const paginationVariables = getPaginationVariables(request, {pageBy: 30});

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: {country, language, ...paginationVariables},
    }),
  ]);
  return {collections};
}

function loadDeferredData() {
  return {};
}

// Collections that get larger grid cells (featured merchandising)
const FEATURED_HANDLES = new Set(['best-sellers', 'trending-finds', 'gifts-under-25']);

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();
  const nodes = collections?.nodes ?? [];
  const count = nodes.length;

  return (
    <div className="pk-collection">
      <nav className="pk-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">Collections</span>
      </nav>

      <header className="pk-col-hero">
        <div className="pk-col-hero__glow" aria-hidden />
        <span className="pk-col-hero__eyebrow">Browse</span>
        <h1 className="pk-col-hero__title">All collections</h1>
        <p className="pk-col-hero__sub">
          Pick a category and dig in. Every collection is hand-curated — we
          only keep what we&apos;d use ourselves.
        </p>
        {count > 0 && (
          <span className="pk-col-hero__count">
            Puchica
          </span>
        )}
      </header>

      {count === 0 ? (
        <div className="pk-empty">
          <p className="pk-empty__title">No collections yet</p>
          <p className="pk-empty__body">
            Collections will appear here as we add them.
          </p>
        </div>
      ) : (
        <PaginatedResourceSection
          connection={collections}
          resourcesClassName="pk-collist-grid"
        >
          {({node: collection, index}) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
            />
          )}
        </PaginatedResourceSection>
      )}
    </div>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
function CollectionItem({collection, index}) {
  const adminImage = collection?.image;
  const productImage = collection?.products?.nodes?.[0]?.featuredImage;
  const image = adminImage || productImage;
  const theme = collectionTheme(collection.title);
  const isFeatured = FEATURED_HANDLES.has(collection.handle);
  const cardClass = isFeatured ? 'pk-collist-card pk-collist-card--featured' : 'pk-collist-card';

  return (
    <ScrollReveal
      delay={Math.min(index * 60, 400)}
      variant={index % 2 === 0 ? 'left' : 'right'}
    >
      <TiltCard className={cardClass} maxTilt={8}>
        <Link
          to={`/collections/${collection.handle}`}
          prefetch="intent"
          style={{display: 'contents'}}
        >
          <div
            className="pk-collist-card__media"
            style={image ? undefined : {background: theme.gradient}}
          >
            {image ? (
              <Image
                alt={image.altText || collection.title}
                aspectRatio="16/10"
                data={image}
                loading={index < 3 ? 'eager' : undefined}
                sizes="(min-width: 45em) 400px, 100vw"
              />
            ) : (
              <span
                className="pk-collist-card__fallback-icon"
                aria-hidden
                style={{color: theme.iconColor}}
              >
                {categoryIcon(collection.title, {size: 64})}
              </span>
            )}
            <span
              className="pk-collist-card__chip"
              style={image ? undefined : {color: theme.iconColor, borderColor: theme.chipBorder, background: theme.chipBg}}
            >
              {collection.title}
            </span>
          </div>
          <div className="pk-collist-card__body">
            <h3 className="pk-collist-card__title">{collection.title}</h3>
            <p className="pk-collist-card__count">Shop the collection →</p>
          </div>
        </Link>
      </TiltCard>
    </ScrollReveal>
  );
}

/**
 * Pick a per-category gradient + accent colors so empty-state collection
 * cards look intentional instead of identical.
 */
function collectionTheme(title = '') {
  const t = title.toLowerCase();
  if (t.includes('pet')) {
    return {
      gradient: 'linear-gradient(135deg, #DFF7E5 0%, #B8E8C8 50%, #8DD7A6 100%)',
      iconColor: '#1E7A45',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(30,122,69,.25)',
    };
  }
  if (t.includes('home') || t.includes('kitchen') || t.includes('house')) {
    return {
      gradient: 'linear-gradient(135deg, #FFE9D6 0%, #FFCDA0 50%, #FFB079 100%)',
      iconColor: '#9A4A14',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(154,74,20,.22)',
    };
  }
  if (t.includes('beauty') || t.includes('personal') || t.includes('grooming') || t.includes('skincare')) {
    return {
      gradient: 'linear-gradient(135deg, #FFE0EC 0%, #FFB8D2 50%, #FF8FB6 100%)',
      iconColor: '#9B2A5C',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(155,42,92,.22)',
    };
  }
  if (t.includes('tech') || t.includes('gadget') || t.includes('electronic')) {
    return {
      gradient: 'linear-gradient(135deg, #DDEAFD 0%, #B6CDF8 50%, #8BB1F1 100%)',
      iconColor: '#1F4BAA',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(31,75,170,.22)',
    };
  }
  if (t.includes('outdoor') || t.includes('garden') || t.includes('sport')) {
    return {
      gradient: 'linear-gradient(135deg, #E0F4EC 0%, #B0E0CB 50%, #7DCAA9 100%)',
      iconColor: '#0F6B4A',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(15,107,74,.22)',
    };
  }
  if (t.includes('phone')) {
    return {
      gradient: 'linear-gradient(135deg, #E8E0F8 0%, #C4B4E8 50%, #9A86D4 100%)',
      iconColor: '#4B2EAA',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(75,46,170,.22)',
    };
  }
  if (t.includes('apparel') || t.includes('clothing') || t.includes('fashion')) {
    return {
      gradient: 'linear-gradient(135deg, #F0E0F0 0%, #D8B8D8 50%, #B89AB8 100%)',
      iconColor: '#7A2A6A',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(122,42,106,.22)',
    };
  }
  if (t.includes('health') || t.includes('wellness') || t.includes('massage')) {
    return {
      gradient: 'linear-gradient(135deg, #E0F0F8 0%, #B0D8E8 50%, #80C0D8 100%)',
      iconColor: '#0A4B7A',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(10,75,122,.22)',
    };
  }
  if (t.includes('automotive') || t.includes('car') || t.includes('vehicle')) {
    return {
      gradient: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #989898 100%)',
      iconColor: '#333333',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(51,51,51,.22)',
    };
  }
  if (t.includes('tool') || t.includes('improvement')) {
    return {
      gradient: 'linear-gradient(135deg, #FFF0D8 0%, #FFD8A0 50%, #E8B060 100%)',
      iconColor: '#8A5A0E',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(138,90,14,.22)',
    };
  }
  if (t.includes('toy') || t.includes('game')) {
    return {
      gradient: 'linear-gradient(135deg, #FFE8E0 0%, #FFB8A0 50%, #FF8870 100%)',
      iconColor: '#AA3A1E',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(170,58,30,.22)',
    };
  }
  if (t.includes('decor') || t.includes('decorat')) {
    return {
      gradient: 'linear-gradient(135deg, #F8E8D8 0%, #E8C8A8 50%, #D0A878 100%)',
      iconColor: '#7A4A0E',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(122,74,14,.22)',
    };
  }
  if (t.includes('office') || t.includes('school') || t.includes('stationery')) {
    return {
      gradient: 'linear-gradient(135deg, #E8E8F8 0%, #C0C0E8 50%, #9898D4 100%)',
      iconColor: '#2A2AAA',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(42,42,170,.22)',
    };
  }
  if (t.includes('baby') || t.includes('nursery') || t.includes('infant')) {
    return {
      gradient: 'linear-gradient(135deg, #E0F0FF 0%, #B0D8FF 50%, #80C0FF 100%)',
      iconColor: '#0A4BAA',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(10,75,170,.22)',
    };
  }
  if (t.includes('gift')) {
    return {
      gradient: 'linear-gradient(135deg, #FFF1D6 0%, #FFD89C 50%, #FFBE66 100%)',
      iconColor: '#8A5A0E',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(138,90,14,.22)',
    };
  }
  if (t.includes('new') || t.includes('feature') || t.includes('trending') || t.includes('best')) {
    return {
      gradient: 'linear-gradient(135deg, #FFF0E8 0%, #FFCFB0 50%, #CC4300 100%)',
      iconColor: '#CC4300',
      chipBg: 'rgba(255,255,255,.85)',
      chipBorder: 'rgba(204,67,0,.22)',
    };
  }
  // Default — Puchica ember/parchment
  return {
    gradient: 'linear-gradient(135deg, #F2EBDA 0%, #E8DFCB 50%, #D4C5AD 100%)',
    iconColor: '#CC4300',
    chipBg: 'rgba(255,255,255,.85)',
    chipBorder: 'rgba(204,67,0,.18)',
  };
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 1) {
      nodes {
        id
        featuredImage {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
  query StoreCollections(
    $country: CountryCode!
    $language: LanguageCode!
    $endCursor: String
    $first: Int
    $last: Int
    $startCursor: String) @inContext(country: $country, language: $language) {
    collections(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
    ) {
      nodes { ...Collection }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */