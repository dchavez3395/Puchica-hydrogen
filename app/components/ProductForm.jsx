import {useNavigate} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useState, useEffect} from 'react';
import {AddToCartButton} from './AddToCartButton';
import {useT} from '~/lib/t';
import {IconMinus, IconPlus} from '~/components/Icons';
import {formatProductOptionLabel} from '~/lib/product-options';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 *   product?: {handle: string, title: string, featuredImage?: {url: string}};
 *   onAddStart?: () => void;
 * }}
 */
export function ProductForm({
  productOptions,
  selectedVariant,
  product,
  onAddStart,
}) {
  const navigate = useNavigate();
  const t = useT();
  const [qty, setQty] = useState(1);
  // This property is intentionally absent from the launch catalog. A product
  // can only expose the control after a real provider has been integrated.
  const backInStockIsConfigured = product?.backInStockProvider === 'klaviyo';

  // Reset qty when variant changes
  useEffect(() => {
    setQty(1);
  }, [selectedVariant?.id]);

  const stock = selectedVariant?.quantityAvailable;
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5;

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        const visibleValues = option.optionValues.filter(
          (value) => value.selected || value.available,
        );
        if (visibleValues.length <= 1) return null;
        return (
          <fieldset className="product-options" key={option.name}>
            <legend className="product-options__legend">{option.name}</legend>
            <div className="product-options-grid">
              {visibleValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;
                const label = formatProductOptionLabel(name);

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={
                        'product-options-item' +
                        (selected ? ' is-selected' : '') +
                        (available ? '' : ' is-unavailable')
                      }
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      aria-current={selected ? 'true' : undefined}
                      aria-disabled={!available}
                    >
                      <ProductOptionSwatch swatch={swatch} label={label} />
                    </Link>
                  );
                }
                return (
                  <button
                    type="button"
                    className={`product-options-item${exists && !selected ? ' link' : ''}${selected ? ' is-selected' : ''}${available ? '' : ' is-unavailable'}`}
                    key={option.name + name}
                    disabled={!exists || !available}
                    aria-pressed={selected}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} label={label} />
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {/* Quantity + ATC row */}
      <div className="pk-qty-row">
        <div className="pk-qty" role="group" aria-label={t('product_qty_aria')}>
          <button
            type="button"
            className="pk-qty__btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label={t('product_qty_dec_aria')}
          >
            <IconMinus size={14} />
          </button>
          <span className="pk-qty__val" aria-live="polite" aria-atomic="true">
            {qty}
          </span>
          <button
            type="button"
            className="pk-qty__btn"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={typeof stock === 'number' && qty >= stock}
            aria-label={t('product_qty_inc_aria')}
          >
            <IconPlus size={14} />
          </button>
        </div>

        <div className="pk-qty-row__atc">
          <AddToCartButton
            disabled={!selectedVariant || !selectedVariant.availableForSale}
            onClick={(e) => {
              e.stopPropagation();
              onAddStart?.();
            }}
            lines={
              selectedVariant
                ? [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity: qty,
                      selectedVariant,
                    },
                  ]
                : []
            }
          >
            {selectedVariant?.availableForSale
              ? t('product_add_to_cart')
              : t('product_sold_out')}
          </AddToCartButton>
        </div>

      </div>

      <p className="pk-product-form__microcopy">
        {t('product_trust_secure')} · {t('product_trust_shipping')}
      </p>

      {/* Low-stock urgency */}
      {lowStock ? (
        <p className="pk-stock-urgency" aria-live="polite">
          <span className="pk-stock-urgency__dot" aria-hidden />
          {t('product_stock_low')} — {t('product_stock_phrase', {stock})}
        </p>
      ) : null}

      {/* Do not collect emails until the Klaviyo back-in-stock flow persists
          and sends them. A success state without delivery is worse than no
          control at all. */}
      {backInStockIsConfigured &&
      selectedVariant &&
      !selectedVariant.availableForSale ? (
        <NotifyBackForm
          variantId={selectedVariant.id}
          productHandle={product?.handle}
        />
      ) : null}
    </div>
  );
}

function NotifyBackForm({variantId, productHandle}) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (sent) {
    return (
      <p className="pk-notify-back__ok" role="status">
        {t('product_notify_ok')}
      </p>
    );
  }

  return (
    <form
      className="pk-notify-back"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
          const res = await fetch('/notify-back', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, variantId, productHandle}),
          });
          if (!res.ok) throw new Error('Could not subscribe');
          setSent(true);
        } catch {
          setError(t('product_notify_error'));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <label htmlFor={`notify-back-${variantId}`}>
        {t('product_notify_label')}
      </label>
      <div className="pk-notify-back__row">
        <input
          id={`notify-back-${variantId}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={t('product_notify_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={submitting || !email}>
          {submitting ? '…' : t('product_notify_btn')}
        </button>
      </div>
      {error ? (
        <p className="pk-notify-back__err" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function ProductOptionSwatch({swatch, label}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;
  if (!image && !color) return label;
  return (
    <div
      aria-label={label}
      className="product-option-label-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && <img src={image} alt={label} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
