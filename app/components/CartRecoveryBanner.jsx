import {useEffect, useState} from 'react';
import {Link} from 'react-router';

/**
 * CartRecoveryBanner — shows a dismissible "welcome back" banner when a
 * returning visitor has items in their cart from a previous session.
 *
 * Uses sessionStorage to avoid showing on every navigation within a session.
 * The cart itself is persisted server-side via Hydrogen's cart cookie, so
 * we read from the root loader's cart data.
 *
 * @param {{cart: {totalQuantity?: number, lines?: {nodes: Array<{merchandise: {product: {handle: string, title: string}, image: {url: string, altText: string} | null}, quantity: number}>}}}} props
 */
export function CartRecoveryBanner({cart}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!cart || typeof window === 'undefined') return;

    const totalQuantity = cart.totalQuantity || 0;
    if (totalQuantity === 0) return;

    // Only show once per browser session
    const dismissed = sessionStorage.getItem('cart_recovery_dismissed');
    if (dismissed) return;

    // Small delay so it doesn't flash during SSR hydration
    const timer = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(timer);
  }, [cart]);

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem('cart_recovery_dismissed', '1');
    } catch {
      /* sessionStorage may be blocked — fail silently */
    }
  };

  if (!show || !cart || !cart.totalQuantity) return null;

  const itemCount = cart.totalQuantity;
  const firstLine = cart.lines?.nodes?.[0];
  const productTitle = firstLine?.merchandise?.product?.title;
  const productImage = firstLine?.merchandise?.image;

  return (
    <div
      className="pk-cart-recovery"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        maxWidth: '480px',
        margin: '0 auto',
        zIndex: 9999,
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e5e5e5)',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {productImage && (
        <img
          src={productImage.url}
          alt={productImage.altText || productTitle || ''}
          width={48}
          height={48}
          style={{borderRadius: '8px', objectFit: 'cover', flexShrink: 0}}
        />
      )}
      <div style={{flex: 1, minWidth: 0}}>
        <p style={{margin: 0, fontWeight: 600, fontSize: '14px'}}>
          Welcome back! You have {itemCount} item{itemCount > 1 ? 's' : ''} in
          your cart.
        </p>
        {productTitle && (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '13px',
              color: 'var(--color-muted, #6b7280)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {productTitle}
          </p>
        )}
        <Link
          to="/cart"
          style={{
            display: 'inline-block',
            marginTop: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-teal, #0d9488)',
          }}
        >
          Complete your order →
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss cart reminder"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          color: 'var(--color-muted, #6b7280)',
          padding: '4px 8px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
