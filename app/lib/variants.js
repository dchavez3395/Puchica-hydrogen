import {useLocation} from 'react-router';
import {useMemo} from 'react';

/**
 * @param {string} handle
 * @param {SelectedOption[]} [selectedOptions]
 */
export function useVariantUrl(handle, selectedOptions) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

/**
 * @param {{
 *   handle: string;
 *   pathname: string;
 *   searchParams: URLSearchParams;
 *   selectedOptions?: SelectedOption[];
 * }}
 */
export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}) {
  // Locale-prefixed pathnames (e.g. /fr-ca/products/...) — only the
  // markets we actually ship. An allow-list is safer than the prior
  // generic [a-z]{2}-[a-z]{2} regex, which would false-match any
  // hyphenated two-letter code in the path (e.g. /vi-vn/, /zh-cn/).
  // TODO: when locale subpath routing is enabled in Markets, ensure
  // every code we ship is listed here.
  const LOCALE_PREFIX = /^\/(en-ca|fr-ca)\//i;
  const localeMatch = LOCALE_PREFIX.exec(pathname);
  const localePrefix = localeMatch ? localeMatch[0] : '';

  const path = localePrefix
    ? `${localePrefix}products/${handle}`
    : `/products/${handle}`;

  selectedOptions?.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').SelectedOption} SelectedOption */
