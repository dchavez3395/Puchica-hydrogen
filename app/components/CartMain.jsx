import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {IconBag, IconSparkles, IconTruck, IconReturn} from '~/components/Icons';
import {STORE_LOGO_URL} from '~/lib/brand';
import {SITE_NAME} from '~/lib/seo';
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

  // Lines are filtered only to drop child components (warranties, gift
  // wrapping) at the root. We intentionally keep qty-0 lines visible
  // (in is-unrecoverable form) so the user can see them, understand
  // why the cart looks empty, and remove them with the trash button.
  const visibleLines = (cart?.lines?.nodes ?? []).filter((line) => {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      return false;
    }
    return true;
  });
  // "Has items" and "checkoutable" are the same predicate: at least
  // one line with qty >= 1. A cart of only qty-0 ghost lines is
  // functionally empty — don't render the brand banner, the summary,
  // or the checkout button, since the subtotal would be a fake $0
  // and "Continue to Checkout" would lead nowhere. The ghost lines
  // themselves still render (under a separate `hasAnyLines` flag)
  // so the user can remove them with the trash button.
  const hasCheckoutableItems = visibleLines.some(
    (line) => typeof line?.quantity === 'number' && line.quantity >= 1,
  );
  const cartHasItems = hasCheckoutableItems;
  const hasAnyLines = visibleLines.length > 0;
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  // For the drawer (aside) layout, the summary is rendered OUTSIDE
  // <section class="cart-main"> so the line items can scroll inside
  // cart-main while the totals/apply/checkout row stays pinned to the
  // bottom of the drawer. For the page layout, the summary lives
  // inside .cart-details below the items — same component, no
  // pinning, full document scroll. The split is layout-conditional
  // because the CSS rules differ between .cart-summary-aside (fixed
  // bottom) and .cart-summary-page (in flow).
  const summaryNode = cartHasItems ? (
    <CartSummary
      cart={cart}
      layout={layout}
      hasCheckoutableItems={hasCheckoutableItems}
    />
  ) : null;

  if (layout === 'aside') {
    return (
      <div className="cart-aside-shell">
        {/* The brand banner is a flex sibling of .cart-main (and
            .cart-summary-aside) inside the shell. Keeping it OUTSIDE
            the scroll container means: (a) the brand stays pinned at
            the top while the user scrolls line items, and (b) its
            80px height doesn't add to the scroll region's content
            size, so the violet scrollbar doesn't appear when the
            actual items fit. Mirrors how .cart-summary-aside is
            already a pinned sibling at the bottom. */}
        {cartHasItems ? <CartBrandHeader /> : null}
        <section
          className={className}
          aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
        >
          <CartEmpty hidden={cartHasItems} layout={layout} />
          <div className="cart-details">
            <p id="cart-lines" className="sr-only">
              Line items
            </p>
            <ul aria-labelledby="cart-lines">
              {visibleLines.map((line) => {
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
            {hasAnyLines && !cartHasItems ? <GhostCartNotice /> : null}
          </div>
        </section>
        {summaryNode}
      </div>
    );
  }

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      {layout === 'aside' && cartHasItems ? <CartBrandHeader /> : null}
      <CartEmpty hidden={cartHasItems} layout={layout} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {visibleLines.map((line) => {
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
        {hasAnyLines && !cartHasItems ? <GhostCartNotice /> : null}
        {cartHasItems && (
          <CartSummary
            cart={cart}
            layout={layout}
            hasCheckoutableItems={hasCheckoutableItems}
          />
        )}
      </div>
    </section>
  );
}

/**
 * Shown inside the drawer when every line in the cart is at qty 0
 * (a "ghost" cart from a server-side rejection). The user can
 * already remove the lines via each line's trash button, but the
 * notice explains *why* the cart looks empty even though it isn't.
 */
function GhostCartNotice() {
  return (
    <div className="cart-ghost-notice" role="status">
      <p>
        These items aren&apos;t available in your region right now. Remove
        them to clear your cart.
      </p>
    </div>
  );
}

/**
 * A small brand banner rendered at the top of the cart drawer. Repeats
 * the site logo + name so the shopper has a clear anchor when the
 * drawer slides over the page. Hidden on the /cart page itself — the
 * page already has the full header above it.
 */
function CartBrandHeader() {
  const {close} = useAside();
  return (
    <div className="cart-brand">
      <Link
        to="/"
        prefetch="intent"
        onClick={close}
        className="cart-brand__logo"
        aria-label={`${SITE_NAME} home`}
      >
        <img src={STORE_LOGO_URL} alt={SITE_NAME} />
      </Link>
    </div>
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
