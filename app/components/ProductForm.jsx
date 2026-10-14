import {useNavigate, useSearchParams} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useState, useEffect} from 'react';
import {AddToCartButton} from './AddToCartButton';
import {CurrencyMoney} from './CurrencyMoney';
import {useT} from '~/lib/t';
import {IconMinus, IconPlus} from '~/components/Icons';
import {formatProductOptionLabel} from '~/lib/product-options';
import {initialSetQuantity, setTotal} from '~/lib/set-quantity';

// Literal keys so scripts/check-dictionary-usage.mjs can see them.
const SET_LABEL_KEYS = {
  1: 'product_set_1',
  2: 'product_set_2',
  3: 'product_set_3',
};

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 *   product?: {handle: string, title: string, featuredImage?: {url: string}};
 *   onAddStart?: () => void;
 *   setSizes?: number[];
 *   setHintKey?: string;
 * }}
 */
export function ProductForm({
  productOptions,
  selectedVariant,
  product,
  onAddStart,
  setSizes = [],
  setHintKey,
}) {
  const navigate = useNavigate();
  const t = useT();
  const [searchParams] = useSearchParams();
  // `?qty=2` lets a pair/trio ad land on the pair/trio already chosen. Read
  // during render (not in an effect) so the server-rendered cart form posts
  // the same quantity before hydration.
  const startQty = initialSetQuantity(searchParams.get('qty'), setSizes);
  const [qty, setQty] = useState(startQty);
  // This property is intentionally absent from the launch catalog. A product
  // can only expose the control after a real provider has been integrated.
  const backInStockIsConfigured = product?.backInStockProvider === 'klaviyo';

  // Reset qty when variant changes
  useEffect(() => {
    setQty(startQty);
    // startQty only changes with the URL, which also changes the variant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id]);

  const stock = selectedVariant?.quantityAvailable;
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5;

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // C14: only render option values whose variant is availableForSale
        // (`value.available` is Hydrogen's encoded-availability flag). The
        // currently-selected value is kept even when unavailable so a
        // sold-out selection stays visible as disabled rather than
        // vanishing from the picker. Single-variant products (or any
        // option with only one buyable value) render no picker at all.
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

      {/* Pairs and trios: same price per lamp, the total shown up front.
          Radios set the same quantity the stepper below controls. */}
      {setSizes.length > 1 && selectedVariant?.price ? (
        <fieldset className="wr-sets">
          <legend className="wr-sets__legend">{t('product_set_legend')}</legend>
          <div className="wr-sets__opts">
            {setSizes.map((n) => (
              <label className="wr-sets__opt" key={n}>
                <input
                  type="radio"
                  name="wr-set-size"
                  value={n}
                  checked={qty === n}
                  onChange={() => setQty(n)}
                />
                <span className="wr-sets__name">{t(SET_LABEL_KEYS[n])}</span>
                <CurrencyMoney
                  className="wr-sets__price"
                  data={setTotal(selectedVariant.price, n)}
                />
              </label>
            ))}
          </div>
          {setHintKey ? <p className="wr-sets__hint">{t(setHintKey)}</p> : null}
        </fieldset>
      ) : null}

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
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `notify-back-${variantId}-err` : undefined}
        />
        <button type="submit" disabled={submitting || !email}>
          {submitting ? '…' : t('product_notify_btn')}
        </button>
      </div>
      {error ? (
        <p
          id={`notify-back-${variantId}-err`}
          className="pk-notify-back__err"
          role="alert"
        >
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
