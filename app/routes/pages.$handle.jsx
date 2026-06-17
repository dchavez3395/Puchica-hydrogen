import {useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {puchicaMeta} from '~/lib/seo';
import {ContactPage} from '~/components/ContactPage';

/**
 * @type {Route.MetaFunction}
 *
 * Special-case the `/pages/contact` handle: it has its own rich layout
 * (`<ContactPage />`) and a real meta description, so we override the
 * generic page-derived meta here. All other CMS pages fall through to
 * the standard `seo`-then-body-derived title/description.
 */
const CONTACT_DESCRIPTION =
  'Get in touch with the Puchica team. Email, Instagram DM, or Facebook — a real person replies within one business day, often within a few hours.';

export const meta = ({data}) => {
  const page = data?.page;
  // Special case: the contact page renders its own layout, so give it
  // a real description instead of the empty body the merchant has set
  // on the Shopify page.
  if (page?.handle === 'contact') {
    return puchicaMeta({
      title: 'Contact us – Puchica',
      description: CONTACT_DESCRIPTION,
      pathname: '/pages/contact',
    });
  }
  // Prefer the merchant-set seo fields (already in the query). Fall back
  // to the page title and a 160-char slice of the body.
  const title = page?.seo?.title || page?.title || 'Page';
  const plain = (page?.body || page?.seo?.description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const description = (page?.seo?.description || plain.slice(0, 160)) ||
    `Read ${title} on Puchica.`;
  return puchicaMeta({
    title: `${title} – Puchica`,
    description,
    pathname: `/pages/${page?.handle || ''}`,
  });
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();

  // Special case: the contact page has its own rich layout. The
  // merchant's Shopify "Contact Us" page exists (so it shows up in
  // navigation and the sitemap) but its body is empty, so we render
  // our own component instead of the generic title+body layout.
  if (page.handle === 'contact') {
    return <ContactPage />;
  }

  return (
    <div className="page">
      <header>
        <h1>{page.title}</h1>
      </header>
      <main dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $handle: String!) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
