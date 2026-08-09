import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {IconSparkles} from '~/components/Icons';
import {useT} from '~/lib/t';

/**
 * Email-capture popup for product updates and occasional offers.
 *
 * Behavior:
 * - Appears once per visitor (a flag is stored in localStorage), after a
 *   short delay OR when the visitor moves to leave the page (exit intent).
 * - Submits to the existing `/newsletter` action, which creates a
 *   marketing-consented Shopify customer.
 * - On success it confirms the subscription without promising an inactive
 *   discount code.
 *
 * SSR-safe: nothing renders until after mount, so server and first client
 * render match (no hydration mismatch).
 */
const POPUP_KEY = 'pk-news-popup-v1';
const DELAY_MS = 8000;

export function NewsletterPopup() {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();
  const armedRef = useRef(false);
  const dialogRef = useRef(null);
  const emailInputRef = useRef(null);
  const successLinkRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Only run on the client.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(POPUP_KEY) === '1';
    } catch {
      /* localStorage blocked */
    }
    if (dismissed) return;

    const show = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      setOpen(true);
    };

    const timer = window.setTimeout(show, DELAY_MS);

    // Exit-intent: pointer leaves the top of the viewport (desktop).
    const onLeave = (e) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener('mouseout', onLeave);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [mounted]);

  // Esc closes + focus trap.
  useEffect(() => {
    if (!open) return;

    // Save focus to restore on close
    previouslyFocused.current = document.activeElement;

    // Focus the first meaningful control, not the invisible backdrop
    // dismiss button (WCAG 2.4.3 / 2.4.11). On the form state that is the
    // email input; on the success state it is the copy-code button.
    const dialog = dialogRef.current;
    if (dialog) {
      const meaningful =
        emailInputRef.current || successLinkRef.current;
      if (meaningful) {
        meaningful.focus();
      } else {
        const focusables = dialog.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length) focusables[0].focus();
      }
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        dismiss();
        return;
      }
      // Focus trap: Tab / Shift+Tab cycles within the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableEls = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Restore focus to the element that had it before the popup opened
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
        previouslyFocused.current = null;
      }
    };
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(POPUP_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  if (!mounted || !open) return null;

  const success = fetcher.data?.ok === true;
  const error = fetcher.data?.ok === false ? fetcher.data.error : null;
  const submitting = fetcher.state !== 'idle';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('np_aria')}
      className="pk-news-popup"
    >
      <button
        type="button"
        aria-label={t('np_close_backdrop')}
        onClick={dismiss}
        className="pk-news-popup__backdrop-btn"
      />
      <div className="pk-news-popup__card">
        <button
          type="button"
          aria-label={t('np_close_x')}
          onClick={dismiss}
          className="pk-news-popup__close"
        >
          &times;
        </button>

        {success ? (
          <>
            <h2 className="pk-news-popup__h2">
              <IconSparkles size={18} className="pk-news-popup__h2-icon" />
              {t('np_success_h')}
            </h2>
            <p className="pk-news-popup__p">{t('np_success_body')}</p>
            <a
              ref={successLinkRef}
              href="/collections"
              className="pk-news-popup__shop-link"
              onClick={dismiss}
            >
              {t('np_success_cta')}
            </a>
          </>
        ) : (
          <>
            <h2 className="pk-news-popup__h2">{t('np_form_h')}</h2>
            <p className="pk-news-popup__p">{t('np_form_body')}</p>
            <fetcher.Form
              method="post"
              action="/newsletter"
              className="pk-news-popup__form"
            >
              <input
                type="email"
                name="email"
                required
                placeholder={t('np_email_placeholder')}
                aria-label={t('np_email_aria')}
                autoComplete="email"
                ref={emailInputRef}
                className="pk-news-popup__input"
              />
              <button
                type="submit"
                disabled={submitting}
                className="pk-news-popup__submit"
              >
                {submitting ? t('np_joining') : t('np_submit')}
              </button>
            </fetcher.Form>
            {error ? <p className="pk-news-popup__error">{error}</p> : null}
            <button
              type="button"
              onClick={dismiss}
              className="pk-news-popup__no-thanks"
            >
              {t('np_dismiss')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
