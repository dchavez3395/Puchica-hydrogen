import {Link, useNavigate} from 'react-router';
import {useState} from 'react';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {useT} from '~/lib/t';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const t = useT();
  return (
    <div className="product-form" id="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
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
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={`product-options-item${exists && !selected ? ' link' : ''}`}
                      key={option.name + name}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
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
                }
              })}
            </div>
          </fieldset>
        );
      })}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={(e) => {
          e.stopPropagation();
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? t('product_add_to_cart') : t('product_sold_out')}
      </AddToCartButton>
      {selectedVariant && !selectedVariant.availableForSale ? (
        <NotifyBackForm variantId={selectedVariant.id} productHandle={productOptions?.handle} />
      ) : null}
    </div>
  );
}

/**
 * Stub back-in-stock notification form. Renders when the selected
 * variant is sold out. Posts to `/notify-back`, which is a placeholder
 * route that returns `{ok: true}`. The real notification wiring
 * (Klaviyo, Shopify customer events, or a Hydrogen custom endpoint)
 * is a separate decision — this just unblocks the UX.
 */
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

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
