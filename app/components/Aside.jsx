import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {useId} from 'react';
import {useLocation} from 'react-router';
import {useT} from '~/lib/t';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  const t = useT();
  const overlayRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Esc closes the drawer + focus trap.
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      // Save currently focused element to restore on close
      previouslyFocused.current = document.activeElement;

      // Focus first focusable element in the drawer
      const overlay = overlayRef.current;
      if (overlay) {
        const focusables = overlay.querySelectorAll(
          'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length) focusables[0].focus();
      }

      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape' && !event.defaultPrevented) {
            // A nested popup (e.g. the locale menu, capture-phase handler)
            // prevents default when Escape closes it — only then should the
            // drawer itself stay open.
            close();
          }
          // Focus trap: Tab / Shift+Tab cycles within the dialog
          if (event.key === 'Tab' && overlayRef.current) {
            const focusableEls = overlayRef.current.querySelectorAll(
              'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focusableEls.length === 0) return;
            const first = focusableEls[0];
            const last = focusableEls[focusableEls.length - 1];
            if (event.shiftKey) {
              if (document.activeElement === first) {
                event.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }
          }
        },
        {signal: abortController.signal},
      );
    } else if (previouslyFocused.current) {
      // Restore focus to the element that opened the drawer. The add-to-cart
      // button re-renders into its "Added" state while the drawer opens, so
      // the saved node can be detached by the time it closes and focus() on
      // it silently lands on <body> (keyboard walk-through, 2026-09-18).
      // Fall back to the live element carrying the same data-focus-return
      // marker, then to the header's cart control.
      // The saved element is often useless: <body> when the add-to-cart form
      // re-mounted before the drawer opened, or a detached node. Prefer it
      // only when it is a real, connected element; otherwise return focus to
      // this drawer's own trigger - the PDP add-to-cart button for the cart
      // drawer when one is on the page, else the header control that opens
      // this drawer type (data-focus-return on each in Header.jsx).
      const saved = previouslyFocused.current;
      const usable = saved && saved !== document.body && saved.isConnected;
      const marker = saved?.getAttribute?.('data-focus-return');
      const target =
        (usable && saved) ||
        (marker && document.querySelector(`[data-focus-return="${marker}"]`)) ||
        (type === 'cart' && document.querySelector('[data-focus-return="add-to-cart"]')) ||
        document.querySelector(`.pk-header [data-focus-return="${type}"]`);
      target?.focus();
      previouslyFocused.current = null;
    }
    return () => abortController.abort();
  }, [close, expanded, type]);

  return (
    <div
      ref={overlayRef}
      aria-modal
      aria-hidden={expanded ? undefined : 'true'}
      className={`overlay ${expanded ? 'expanded' : ''}`}
      inert={expanded ? undefined : ''}
      role="dialog"
      aria-labelledby={id}
    >
      <button
        className="close-outside"
        onClick={close}
        aria-label={t('aside_close_drawer')}
        tabIndex={-1}
      />
      <aside>
        <header>
          <h3 id={id}>{heading}</h3>
          <button className="close reset" onClick={close} aria-label={t('aside_close')}>
            &times;
          </button>
        </header>
        <div className="aside-main">{children}</div>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');
  const location = useLocation();

  // Stable reference — must not be recreated on every render because
  // Drawer consumers depend on this callback and would fire on every re-render
  // (immediately calling close() and cancelling any open()).
  const close = useCallback(() => setType('closed'), []);

  // Close any open drawer when the route changes.
  useEffect(() => {
    close();
  }, [location.pathname, location.search, close]);

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close,
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
