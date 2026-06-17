import {createContext, useContext, useEffect, useState} from 'react';
import {useId} from 'react';
import {useLocation} from 'react-router';

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

  // Esc closes the drawer.
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  // Live-size the drawer's internal header padding-top so the
  // CART/SEARCH/MENU heading always sits just below the floating
  // page header. As the page scrolls the announcement bar goes away
  // and the header shrinks to ~73px — without this, the heading
  // leaves a dead "forehead" of empty drawer space above it.
  useEffect(() => {
    if (!expanded) return;
    const root = document.documentElement;
    const update = () => {
      const header = document.querySelector('.pk-header');
      const bottom = header
        ? Math.round(header.getBoundingClientRect().bottom)
        : 108;
      root.style.setProperty('--pk-drawer-header-pad', `${bottom}px`);
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
    >
      <button className="close-outside" onClick={close} />
      <aside>
        <header>
          <h3 id={id}>{heading}</h3>
          <button className="close reset" onClick={close} aria-label="Close">
            &times;
          </button>
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');
  const location = useLocation();

  // Close any open drawer when the route changes. The user's
  // expectation is that clicking the logo (or any in-page link)
  // while the cart/search/menu drawer is open navigates AND
  // dismisses the drawer — otherwise the drawer overlays the new
  // page and looks like the navigation didn't happen.
  useEffect(() => {
    setType('closed');
  }, [location.pathname, location.search]);

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
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
