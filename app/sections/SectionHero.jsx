import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  sectionFields,
  sectionImage,
  sectionText,
} from '~/lib/sections';

/**
 * Full-width heading block, optionally over a photograph.
 *
 * The scrim is not decoration. Text over a photograph cannot be contrast-tested
 * by axe — the checker sees a transparent background and passes it — so the
 * only way to guarantee WCAG 1.4.3 here is to make the backdrop deterministic.
 * `pk-section-hero__scrim` is a fixed rgba(20,22,31,0.65) wash: against a pure
 * white photograph that composites to #66686D, where white text holds 5.58:1.
 * A lighter scrim was measured and rejected — at 0.60 the body tint only
 * reaches 4.02:1.
 *
 * With no image the section renders on a flat surface instead, which is why
 * the scrim class is only applied in the image branch.
 *
 * @param {{section: object}}
 */
export function SectionHero({section}) {
  const fields = sectionFields(section);
  const heading = sectionText(fields, 'heading');
  const body = sectionText(fields, 'body');
  const ctaLabel = sectionText(fields, 'cta_label');
  const ctaHref = sectionText(fields, 'cta_href');
  const image = sectionImage(fields, 'image');

  // A hero with no heading is a styling accident, not content. Render nothing
  // rather than an empty band that pushes the product grid below the fold.
  if (!heading) return null;

  return (
    <section
      className={
        image ? 'pk-section-hero pk-section-hero--image' : 'pk-section-hero'
      }
    >
      {image ? (
        <Image
          className="pk-section-hero__media"
          data={image}
          sizes="100vw"
          loading="eager"
        />
      ) : null}
      <div className={image ? 'pk-section-hero__scrim' : undefined}>
        <div className="pk-section-hero__inner">
          <h1 className="pk-section-hero__heading">{heading}</h1>
          {body ? <p className="pk-section-hero__body">{body}</p> : null}
          {ctaLabel && ctaHref ? (
            <Link className="pk-section-hero__cta" to={ctaHref}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
