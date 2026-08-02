import {Money} from '@shopify/hydrogen';

/**
 * Render Shopify's localized amount with an explicit ISO currency code.
 * Dollar symbols alone are ambiguous between CAD and USD, and the MoneyV2
 * currencyCode is the authoritative currency for the offer being displayed.
 *
 * @param {{data?: MoneyV2 | null, className?: string}} props
 */
export function CurrencyMoney({data, className}) {
  if (!data?.amount || !data?.currencyCode) return null;

  return (
    <span className={className}>
      <Money as="span" data={data} />{' '}
      <span aria-label={`${data.currencyCode} currency`}>
        {data.currencyCode}
      </span>
    </span>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
