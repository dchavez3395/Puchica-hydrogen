import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {IconSparkles} from '~/components/Icons';
import {useT} from '~/lib/t';

/**
 * Email-capture popup that offers the WELCOME15 first-order discount.
 *
 * Behavior:
 * - Appears once per visitor (a flag is stored in localStorage), after a
 *   short delay OR when the visitor moves to leave the page (exit intent).
 * - Submits to the existing `/newsletter` action, which creates a
 *   marketing-consented Shopify customer.
 * - On success it reveals the WELCOME15 code so the visitor can use it
 *   immediately at checkout.
 *
 * SSR-safe: nothing renders until after mount, so server and first client
 * render match (no hydration mismatch).
 */
const POPUP_KEY = 'pk-news-popup-v1';
const DISCOUNT_CODE = 'WELCOME15';
const DELAY_MS = 8000;

export function NewsletterPopup() {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fetcher = useFetcher();
  const armedRef = useRef(false);

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

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(POPUP_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  function copyCode() {
    try {
      navigator.clipboard?.writeText(DISCOUNT_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
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
      role="dialog"
      aria-modal="true"
      aria-label={t('np_aria')}
      style={styles.backdrop}
    >
      <button
        type="button"
        aria-label={t('np_close_backdrop')}
        onClick={dismiss}
        style={styles.backdropBtn}
      />
      <div style={styles.card}>
        <button
          type="button"
          aria-label={t('np_close_x')}
          onClick={dismiss}
          style={styles.close}
        >
          &times;
        </button>

        {success ? (
          <>
            <h2 style={styles.h2}>
              <IconSparkles size={18} style={{verticalAlign: '-0.15em', marginRight: 6}} />
              {t('np_success_h')}
            </h2>
            <p style={styles.p}>{t('np_success_body')}</p>
            <button type="button" onClick={copyCode} style={styles.codeBtn}>
              {DISCOUNT_CODE}
              <span style={styles.codeHint}>{copied ? t('np_copy_btn') : t('np_copy_hint')}</span>
            </button>
            <a href="/collections" style={styles.shopLink} onClick={dismiss}>
              {t('np_success_cta')}
            </a>
          </>
        ) : (
          <>
            <h2 style={styles.h2}>{t('np_form_h')}</h2>
            <p style={styles.p}>{t('np_form_body')}</p>
            <fetcher.Form method="post" action="/newsletter" style={styles.form}>
              <input
                type="email"
                name="email"
                required
                placeholder={t('np_email_placeholder')}
                aria-label={t('np_email_aria')}
                autoComplete="email"
                style={styles.input}
              />
              <button type="submit" disabled={submitting} style={styles.submit}>
                {submitting ? t('np_joining') : t('np_submit')}
              </button>
            </fetcher.Form>
            {error ? <p style={styles.error}>{error}</p> : null}
            <button type="button" onClick={dismiss} style={styles.noThanks}>
              {t('np_dismiss')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20, 16, 45, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  },
  backdropBtn: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '420px',
    background: 'var(--pk-bg, #fff)',
    color: 'var(--pk-ink, #1a1340)',
    borderRadius: 'var(--pk-radius, 18px)',
    padding: '36px 28px 28px',
    boxShadow: '0 24px 60px rgba(20, 16, 45, 0.28)',
    textAlign: 'center',
  },
  close: {
    position: 'absolute',
    top: '10px',
    right: '14px',
    border: 'none',
    background: 'transparent',
    fontSize: '26px',
    lineHeight: 1,
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
  },
  h2: {margin: '0 0 10px', fontSize: '24px', fontWeight: 700},
  p: {margin: '0 0 18px', fontSize: '15px', lineHeight: 1.5, opacity: 0.85},
  form: {display: 'flex', flexDirection: 'column', gap: '10px'},
  input: {
    width: '100%',
    padding: '13px 14px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1px solid rgba(20,16,45,0.18)',
    boxSizing: 'border-box',
  },
  submit: {
    width: '100%',
    padding: '13px 14px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'var(--pk-grad-ember, linear-gradient(135deg,#CC4300 0%,#E05A1A 100%))',
  },
  error: {margin: '10px 0 0', color: '#c0392b', fontSize: '13px'},
  noThanks: {
    margin: '14px 0 0',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.55,
    textDecoration: 'underline',
  },
  codeBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    padding: '14px',
    fontSize: '22px',
    fontWeight: 800,
    letterSpacing: '1px',
    color: 'var(--pk-ink, #1a1340)',
    border: '2px dashed rgba(109,76,255,0.6)',
    borderRadius: '12px',
    background: 'var(--pk-muted-bg, #E9E6FF)',
    cursor: 'pointer',
  },
  codeHint: {fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', opacity: 0.7},
  shopLink: {
    display: 'inline-block',
    marginTop: '16px',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--pk-ink, #1a1340)',
  },
};
