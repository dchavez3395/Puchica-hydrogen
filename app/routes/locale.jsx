import {redirect} from 'react-router';
import {
  LOCALE_COOKIE,
  MARKET_COOKIE,
  LANGUAGES,
  MARKETS,
  resolveStorefrontLocale,
} from '~/lib/i18n';
import {getMarketSafeCart, safeInternalRedirect} from '~/lib/cart-safety';

/**
 * Resource route — sets the locale cookie server-side and redirects back.
 * The LocaleSwitcher navigates here; the server sets Set-Cookie and returns
 * the user to wherever they came from. This avoids the unreliable pattern of
 * setting document.cookie in JS then calling window.location.reload().
 */
export async function action({request, context}) {
  const formData = await request.formData();
  const lang = formData.get('lang');
  const requestedCountry = String(formData.get('country') || '').toUpperCase();
  const returnTo = safeInternalRedirect(formData.get('return')) || '/';

  const headers = new Headers();

  if (lang && LANGUAGES[lang]) {
    headers.append(
      'Set-Cookie',
      `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`,
    );
  }

  if (requestedCountry && MARKETS[requestedCountry]) {
    const data = await context.storefront.query(MARKET_RESOLUTION_QUERY, {
      variables: {
        country: requestedCountry,
        language: context.storefront.i18n.language,
      },
      cache: context.storefront.CacheNone(),
    });
    const resolved = resolveStorefrontLocale(
      {...context.storefront.i18n, country: requestedCountry},
      data?.localization,
    );
    const effectiveCountry = resolved.country;
    if (!MARKETS[effectiveCountry]) return redirect(returnTo, {headers});

    if (context.cart.getCartId()) {
      try {
        await getMarketSafeCart(
          context.cart,
          context.storefront,
          effectiveCountry,
        );
      } catch {
        // Do not save a new market if the existing cart cannot be synchronized
        // and purged first. Keeping the old market is safer than exposing an
        // invalid cross-market checkout.
        return redirect(returnTo, {headers});
      }
    }

    headers.append(
      'Set-Cookie',
      `${MARKET_COOKIE}=${effectiveCountry}; path=/; max-age=31536000; samesite=lax`,
    );
  }

  return redirect(returnTo, {headers});
}

const MARKET_RESOLUTION_QUERY = `#graphql
  query MarketResolution(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    localization {
      country {
        isoCode
        currency { isoCode }
      }
      availableCountries {
        isoCode
        currency { isoCode }
      }
    }
  }
`;
