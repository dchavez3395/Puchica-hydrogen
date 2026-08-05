import {CacheNone} from '@shopify/hydrogen';
import {useLoaderData} from 'react-router';
import {TRENDING_QUERY, TrendingLanding} from '~/components/TrendingLanding';
import {NewsletterFooter} from '~/sections/newsletter-footer/newsletter-footer';
import {filterLaunchProducts} from '~/lib/launch-catalog';
import {error as logError} from '~/lib/logger';
import {
  JsonLdScript,
  organizationJsonLd,
  puchicaMeta,
  websiteJsonLd,
} from '~/lib/seo';

// Localized SEO strings for the home page.
// Keys correspond to dictionary entries; the FR dictionary may override the EN fallback.
const HOME_META = {
  en: {
    title: 'Trending finds under $200 - Puchica',
    description:
      'Shop trending finds under $200 — practical products with real reviews. Audio, kitchen, fitness, home, and outdoor picks with shipping shown at checkout.',
  },
  fr: {
    title: 'Trouvailles tendance sous 200 $ - Puchica',
    description:
      'Découvrez des trouvailles tendance sous 200 $ — des produits pratiques avec de vrais avis. Audio, cuisine, fitness, maison et plein air, options de livraison affichées au paiement.',
  },
  es: {
    title: 'Productos populares por menos de 200 $ - Puchica',
    description:
      'Descubre productos populares por menos de 200 $ — productos prácticos con opiniones reales. Audio, cocina, fitness, hogar y aire libre; gastos de envío mostrados al pagar.',
  },
};

/** @type {Route.MetaFunction} */
export const meta = ({matches}) => {
  // The root route exposes selectedLocale on its loader data; pull it from there
  // so the FR home renders FR title/description and the langKey is correct.
  const root = matches?.find((m) => m.id === 'root');
  const langCode = (root?.data?.selectedLocale?.language || 'EN').toLowerCase();
  const langKey = ['fr', 'es'].includes(langCode) ? langCode : 'en';
  const copy = HOME_META[langKey] || HOME_META.en;
  return puchicaMeta({
    title: copy.title,
    description: copy.description,
    pathname: '/',
    langKey,
  });
};

/** @param {Route.LoaderArgs} args */
export async function loader({context}) {
  const {country, language} = context.storefront.i18n;

  try {
    const data = await context.storefront.query(TRENDING_QUERY, {
      variables: {country, language},
      cache: CacheNone(),
    });

    return {
      products: filterLaunchProducts(
        data?.launchProducts?.nodes ?? [],
      ),
    };
  } catch (error) {
    logError('home trending query failed', error);
    return {products: []};
  }
}

export default function Index() {
  const {products} = useLoaderData();

  return (
      <div className="pk-home pk-campaign pk-campaign--home">
        <JsonLdScript data={organizationJsonLd({})} />
        <JsonLdScript data={websiteJsonLd({})} />
        <TrendingLanding products={products} />
        <NewsletterFooter />
      </div>
    );
}

/** @typedef {import('./+types/_index').Route} Route */
