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
  // Preserve only the locale prefixes the current router serves. An allow-list
  // avoids treating an arbitrary first path segment as a language.
  const LOCALE_PREFIX = /^\/(fr|es|pt-br)\//i;
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
