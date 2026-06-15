import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {IconBag, IconSparkles, IconTruck, IconReturn} from '~/components/Icons';
/**
 * Returns a map of all line items and their children.
 * @param {CartLine[]} lines
 * @return {import("/Users/danielc/puchica-storefront/app/components/CartMain").LineItemChildrenMap}
 */
function getLineItemChildrenMap(lines) {
  const children = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              // we do not render non-parent lines at the root of the cart
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div className="pk-empty-cart" hidden={hidden}>
      <div className="pk-empty-cart__art" aria-hidden>
        <span className="pk-empty-cart__circle pk-empty-cart__circle--a" />
        <span className="pk-empty-cart__circle pk-empty-cart__circle--b" />
        <span className="pk-empty-cart__icon">
          <IconBag size={32} />
        </span>
        <span className="pk-empty-cart__sparkle pk-empty-cart__sparkle--1">
          <IconSparkles size={14} />
        </span>
        <span className="pk-empty-cart__sparkle pk-empty-cart__sparkle--2">
          <IconSparkles size={11} />
        </span>
        <span className="pk-empty-cart__sparkle pk-empty-cart__sparkle--3">
          <IconSparkles size={9} />
        </span>
      </div>
      <div className="pk-empty-cart__copy">
        <h3 className="pk-empty-cart__title">Your cart is empty</h3>
        <p className="pk-empty-cart__body">
          Nothing here yet — let&apos;s find something you&apos;ll love. Our
          curated picks change often, so it&apos;s worth a look.
        </p>
        <div className="pk-empty-cart__actions">
          <Link
            to="/collections"
            onClick={close}
            prefetch="viewport"
            className="pk-btn pk-btn--primary pk-btn--lg"
          >
            Shop the catalog <span aria-hidden>→</span>
          </Link>
          <Link
            to="/collections/best-sellers"
            onClick={close}
            prefetch="intent"
            className="pk-btn pk-btn--ghost pk-btn--lg"
          >
            See best sellers
          </Link>
        </div>
        <ul className="pk-empty-cart__perks" aria-label="Why shop with us">
          <li>
            <span aria-hidden><IconTruck size={16} /></span>
            Free shipping over $50
          </li>
          <li>
            <span aria-hidden><IconReturn size={16} /></span>
            30-day easy returns
          </li>
        </ul>
      </div>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */
/** @typedef {{[parentId: string]: CartLine[]}} LineItemChildrenMap */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartLineItem').CartLine} CartLine */
