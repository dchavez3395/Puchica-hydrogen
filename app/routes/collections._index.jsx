import {useLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {puchicaMeta} from '~/lib/seo';
import {useT} from '~/lib/t';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({params}) => {
  return puchicaMeta({
    title: 'All Collections – Puchica',
    description:
      'Shop Puchica by collection — Home & Kitchen, Beauty, Tech, Pet, and more curated picks. Shipping options shown at checkout, 30-day returns.',
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

export default function Collections() {
  const {collections} = useLoaderData();
  const t = useT();
  const nodes = collections?.nodes ?? [];
  const count = nodes.length;

  return (
    <div className="pk-collection">
      <nav className="pk-breadcrumbs" aria-label={t('col_index_breadcrumb_aria')}>
        <Link to="/">{t('col_index_breadcrumb_home')}</Link>
        <span className="pk-breadcrumbs__sep">/</span>
        <span className="pk-breadcrumbs__current">{t('col_index_breadcrumb_current')}</span>
      </nav>

      <header className="pk-col-hero">
        <h1 className="pk-col-hero__title">{t('col_index_h')}</h1>
        <p className="pk-col-hero__sub">{t('col_index_sub')}</p>
        {count > 0 && (
          <span className="pk-col-hero__count">
            {count} {count === 1 ? t('col_product_singular') : t('col_product_plural')}
          </span>
        )}
      </header>

      {count === 0 ? (
        <div className="pk-empty">
          <p className="pk-empty__title">{t('col_index_empty_h')}</p>
          <p className="pk-empty__body">{t('col_index_empty_body')}</p>
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

function CollectionItem({collection, index}) {
  const t = useT();
  const adminImage = collection?.image;
  const productImage = collection?.products?.nodes?.[0]?.featuredImage;
  const image = adminImage || productImage;

  return (
    <div className="pk-collist-card">
      <Link
        to={`/collections/${collection.handle}`}
        prefetch="intent"
        style={{display: 'contents'}}
      >
        <div className="pk-collist-card__media">
          {image ? (
            <Image
              alt={image.altText || collection.title}
              aspectRatio="16/10"
              data={image}
              loading={index < 3 ? 'eager' : undefined}
              sizes="(min-width: 45em) 400px, 100vw"
            />
          ) : (
            <div className="pk-collist-card__fallback" aria-hidden="true">
              <span className="pk-collist-card__fallback-text">{collection.title}</span>
            </div>
          )}
        </div>
        <div className="pk-collist-card__body">
          <h3 className="pk-collist-card__title">{collection.title}</h3>
          <p className="pk-collist-card__count">{t('col_index_card_cta')}</p>
        </div>
      </Link>
    </div>
  );
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