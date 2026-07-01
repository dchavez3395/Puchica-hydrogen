import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';

/**
 * ShippingReach — simple "we ship anywhere" panel for the about and
 * contact pages. Reads all copy from useT() so it translates with the
 * locale switcher.
 *
 * The previous version enumerated ~25 cities grouped by 4 regions
 * (NA / SA / UK / EU) and showed city counts per region. That was the
 * wrong framing for a store that ships globally — it implied a limited
 * delivery area. The new version makes one claim ("we ship anywhere")
 * and points the shopper at the contact page for specifics.
 *
 * Re-uses the existing `.pk-about-reach` styles (single-column layout,
 * centered, cream background) so we don't ship new CSS for a one-line
 * rewrite. The unused `.pk-about-reach__grid` and `.pk-contact__reach*`
 * rules stay in app.css — they're dead but harmless, and removing
 * them is a separate cleanup.
 *
 * @param {{ctaTo?: string}} props
 *   `ctaTo` — the URL the CTA links to. Defaults to `/pages/contact`.
 */
export function ShippingReach({ctaTo = '/pages/contact'}) {
  const t = useT();

  return (
    <section className="pk-about-reach" aria-label={t('ship_section_aria')}>
      <div className="pk-about-reach__inner">
        <span className="pk-about-reach__eye">
          <StarGlyph /> {t('ship_eyebrow')}
        </span>
        <h2 className="pk-about-reach__title">{t('ship_title')}</h2>
        <p className="pk-about-reach__sub">{t('ship_sub')}</p>
        <p>
          <a className="pk-btn pk-btn--ghost pk-btn--lg" href={ctaTo}>
            {t('ship_cta')}
          </a>
        </p>
      </div>
    </section>
  );
}
