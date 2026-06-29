import {Link, useNavigate} from 'react-router';
import {useState, useEffect, useRef} from 'react';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {useT} from '~/lib/t';
import {IconHeart, IconMinus, IconPlus} from '~/components/Icons';
import {MagneticSurface} from './MagneticSurface';

const FREE_SHIPPING_THRESHOLD = 50; // CAD — must match dictionaries product_trust_shipping_sub

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 *   product?: {handle: string, title: string, featuredImage?: {url: string}};
 *   onAddStart?: () => void;
 * }}
 */
export function ProductForm({productOptions, selectedVariant, product, onAddStart}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const t = useT();
  const [qty, setQty] = useState(1);
  const [saved, setSaved] = useState(false);
  const [savePop, setSavePop] = useState(false);
  const popTimerRef = useRef(null);

  // Reset qty when variant changes
  useEffect(() => {
    setQty(1);
  }, [selectedVariant?.id]);

  // Wishlist persistence (per-handle). localStorage so it survives reloads.
  useEffect(() => {
    if (typeof window === 'undefined' || !product?.handle) return;
    try {
      const list = JSON.parse(localStorage.getItem('pk:wishlist') || '[]');
      setSaved(list.includes(product.handle));
    } catch {
      // Corrupted wishlist entry — fall back to "not saved" rather
      // than crashing the page.
    }
  }, [product?.handle]);

  const toggleSave = () => {
    if (typeof window === 'undefined' || !product?.handle) return;
    try {
      const list = JSON.parse(localStorage.getItem('pk:wishlist') || '[]');
      const next = saved
        ? list.filter((h) => h !== product.handle)
        : [...list, product.handle];
      localStorage.setItem('pk:wishlist', JSON.stringify(next));
      setSaved(!saved);
      // Trigger the pop animation, suppressed if the user prefers reduced
      // motion. CSS handles the keyframe; we just toggle the class.
      if (typeof window !== 'undefined') {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!reduced.matches) {
          setSavePop(true);
          if (popTimerRef.current) clearTimeout(popTimerRef.current);
          popTimerRef.current = setTimeout(() => setSavePop(false), 420);
        }
      }
    } catch {
      // localStorage may be blocked (private mode, quota exceeded).
      // Swallow so the toggle still updates UI state.
    }
  };

  // Cleanup the pop timer if the component unmounts while a pop is
  // still scheduled.
  useEffect(() => () => {
    if (popTimerRef.current) clearTimeout(popTimerRef.current);
  }, []);

  const stock = selectedVariant?.quantityAvailable;
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5;
  const variantPrice = parseFloat(selectedVariant?.price?.amount || '0');
  const subtotal = variantPrice * qty;
  const freeShipRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShipProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const qualifiesFreeShipping = freeShipRemaining === 0;

  return (
    <div className="product-form" id="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;
        return (
          <fieldset className="product-options" key={option.name}>
            <legend className="product-options__legend">{option.name}</legend>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
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

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={'product-options-item' + (selected ? ' is-selected' : '') + (available ? '' : ' is-unavailable')}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }
                return (
                  <button
                    type="button"
                    className={`product-options-item${exists && !selected ? ' link' : ''}${selected ? ' is-selected' : ''}${available ? '' : ' is-unavailable'}`}
                    key={option.name + name}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {/* Quantity + ATC row */}
      <div className="pk-qty-row">
        <div className="pk-qty" role="group" aria-label="Quantity">
          <button
            type="button"
            className="pk-qty__btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
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
            aria-label="Increase quantity"
          >
            <IconPlus size={14} />
          </button>
        </div>

        <div className="pk-qty-row__atc">
          {/* MagneticSurface wraps the submit button so the cursor
              gently pulls it on hover-capable pointers. The submit
              button itself stays owned by AddToCartButton, which
              owns the form fetcher state. */}
          <MagneticSurface strength={0.22} range={90} className="pk-atc-magnetic">
            <AddToCartButton
              disabled={!selectedVariant || !selectedVariant.availableForSale}
              onClick={(e) => {
                e.stopPropagation();
                onAddStart?.();
                open('cart');
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
          </MagneticSurface>
        </div>

        {product?.handle ? (
          <button
            type="button"
            className={
              'pk-save' +
              (saved ? ' is-saved' : '') +
              (savePop ? ' pk-save--pop' : '')
            }
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved' : 'Save for later'}
          >
            <IconHeart size={16} />
          </button>
        ) : null}
      </div>

      {/* Low-stock urgency */}
      {lowStock ? (
        <p className="pk-stock-urgency" aria-live="polite">
          <span className="pk-stock-urgency__dot" aria-hidden />
          {t('product_stock_low')} — only {stock} left
        </p>
      ) : null}

      {/* Free shipping progress */}
      {selectedVariant?.availableForSale && subtotal > 0 ? (
        <div
          className={
            'pk-ship-progress' +
            (qualifiesFreeShipping ? ' pk-ship-progress--done' : '')
          }
        >
          <div className="pk-ship-progress__bar" aria-hidden>
            <span style={{width: `${freeShipProgress}%`}} />
          </div>
          <p className="pk-ship-progress__msg">
            {qualifiesFreeShipping ? (
              <>🎉 You&apos;ve unlocked free shipping.</>
            ) : (
              <>
                Add <strong>${freeShipRemaining.toFixed(2)}</strong> more for{' '}
                <strong>free shipping</strong>.
              </>
            )}
          </p>
        </div>
      ) : null}

      {selectedVariant && !selectedVariant.availableForSale ? (
        <NotifyBackForm variantId={selectedVariant.id} productHandle={productOptions?.handle} />
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

function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;
  if (!image && !color) return name;
  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */