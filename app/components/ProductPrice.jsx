import {CurrencyMoney} from '~/components/CurrencyMoney';
import {useT} from '~/lib/t';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  const t = useT();
  // Only show compareAtPrice strikethrough when it's actually higher than the price.
  // Shopify allows compareAtPrice === price, which renders a misleading "fake sale".
  const hasRealSale =
    compareAtPrice &&
    price &&
    Number(compareAtPrice.amount) > Number(price.amount);
  return (
    <div aria-label={t('product_price_aria')} className="product-price" role="group">
      {hasRealSale ? (
        <div className="product-price-on-sale">
          {price ? <CurrencyMoney data={price} /> : null}
          <s>
            <CurrencyMoney data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <CurrencyMoney data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
