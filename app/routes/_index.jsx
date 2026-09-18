import {CacheNone} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {SMALL_SPACE_QUERY} from '~/components/SmallSpaceLanding';
import {HomeLanding} from '~/components/HomeLanding';
import {SectionRenderer} from '~/sections/registry';
import {PAGE_LAYOUT_QUERY} from '~/lib/sections';
import {
  filterLaunchProducts,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';
import {error as logError} from '~/lib/logger';
import {launchMetaCopy} from '~/lib/launch-meta';
import {
  JsonLdScript,
  organizationJsonLd,
  puchicaMeta,
  websiteJsonLd,
} from '~/lib/seo';

export const meta = ({data, params}) => {
  const copy = launchMetaCopy(params?.locale, data?.country);
  return puchicaMeta({
    title: STOREFRONT_CONTAINMENT_ACTIVE
      ? 'Puchica — Store review in progress'
      : copy.home.title,
    description:
      STOREFRONT_CONTAINMENT_ACTIVE
        ? 'Puchica is completing a storefront review. Shopping will return after the release checks are complete.'
        : copy.home.description,
    pathname: '/',
    langKey: params?.locale,
  });
};

export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return {country, products: [], sections: []};
  }

  // The layout lookup is deliberately its own request with its own catch. If
  // metaobjects are unreachable, misconfigured, or simply not created yet, the
  // homepage must still render its product cohort — a content system that can
  // take down the front door is worse than no content system.
  const layout = context.storefront
    .query(PAGE_LAYOUT_QUERY, {
      variables: {handle: 'home', country, language},
      cache: CacheNone(),
    })
    .catch((error) => {
      logError('home page_layout query failed', error);
      return null;
    });

  try {
    const data = await context.storefront.query(SMALL_SPACE_QUERY, {
      variables: {country, language},
      cache: CacheNone(),
    });

    return {
      country,
      products: filterLaunchProducts(
        data?.launchProducts?.nodes ?? [],
        country,
      ),
      sections: (await layout)?.metaobject?.sections?.references?.nodes ?? [],
    };
  } catch (error) {
    logError('home travel edit query failed', error);
    return {
      country,
      products: [],
      sections: (await layout)?.metaobject?.sections?.references?.nodes ?? [],
    };
  }
}

export default function Index() {
  const {products, sections} = useLoaderData();

  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return (
      <div className="pk-home pk-campaign pk-campaign--home">
        <section className="pk-campaign-hero" aria-labelledby="review-title">
          <div className="pk-campaign-hero__copy">
            <p className="pk-campaign__eyebrow">Puchica storefront review</p>
            <h1 id="review-title">We are tightening the last details.</h1>
            <p>
              Shopping is temporarily paused while we verify product and
              checkout details across Canada and the United States.
            </p>
            <p>
              Questions? <a href="mailto:hello@puchica.ca">hello@puchica.ca</a>
            </p>
          </div>
        </section>
      </div>
    );
  }

  // `HomeLanding` is the woven-lighting front door (2026-09-18). It still
  // reads the launch-filtered cohort from SMALL_SPACE_QUERY, so the catalogue
  // gate is unchanged. A `page_layout` entry with handle `home` carrying
  // sections still takes over, and deleting it brings this landing straight
  // back - reversible from Shopify admin with no deploy in either direction.
  return (
    <div className="pk-home pk-campaign pk-campaign--home">
      <JsonLdScript data={organizationJsonLd({})} />
      <JsonLdScript data={websiteJsonLd({})} />
      {sections.length ? (
        <SectionRenderer sections={sections} products={products} />
      ) : (
        <HomeLanding products={products} />
      )}
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
