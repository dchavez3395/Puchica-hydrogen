import {createContext, useCallback, useContext, useRef, useState} from 'react';

/**
 * One polite live region for the whole page.
 *
 * Every product card rendered its own `role="status"` span (22 of them on
 * /collections/all, accessibility sheet open item 2026-09-18). Screen readers
 * announce from a single region just as well, and one region is one thing
 * to keep correct. Components call `announce(text)`; the same text can be
 * announced twice because the region is cleared first.
 */
const AnnouncerContext = createContext(null);

export function LiveAnnouncer({children}) {
  const [message, setMessage] = useState('');
  const timer = useRef(null);
  const announce = useCallback((text) => {
    const next = String(text || '');
    if (timer.current) clearTimeout(timer.current);
    setMessage('');
    // Clearing then setting on the next tick makes repeated identical
    // announcements ("Added to cart" twice) audible.
    timer.current = setTimeout(() => setMessage(next), 50);
  }, []);
  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
    </AnnouncerContext.Provider>
  );
}

/** Returns announce(text); a no-op outside the provider (tests, previews). */
export function useAnnouncer() {
  const announce = useContext(AnnouncerContext);
  return announce || (() => {});
}
