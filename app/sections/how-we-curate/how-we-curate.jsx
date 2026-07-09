import {useT} from '~/lib/t';

/**
 * "Why Puchica" band — a warm cream band with three value props.
 * Honest about the model: we curate, we source, we ship fast.
 * No claims about testing every product or "no drop-shipping."
 *
 * Pure presentational — no GraphQL. Copy from i18n (home_curate_* keys).
 */
export function HowWeCurate() {
  const t = useT();
  const steps = [
    {
      num: '01',
      headingKey: 'home_curate_step1_h',
      bodyKey: 'home_curate_step1_b',
    },
    {
      num: '02',
      headingKey: 'home_curate_step2_h',
      bodyKey: 'home_curate_step2_b',
    },
    {
      num: '03',
      headingKey: 'home_curate_step3_h',
      bodyKey: 'home_curate_step3_b',
    },
  ];

  return (
    <section
      className="pk-section pk-section--how-we-curate"
      aria-label={t('home_curate_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--center">
          <span className="pk-eyebrow">{t('home_curate_eyebrow')}</span>
          <h2 className="pk-section__h pk-curate__heading">
            {t('home_curate_heading')}
          </h2>
        </div>
        <ol className="pk-curate">
          {steps.map((step) => (
            <li className="pk-curate__step" key={step.num}>
              <span className="pk-curate__num" aria-hidden="true">
                {step.num}
              </span>
              <h3 className="pk-curate__h">{t(step.headingKey)}</h3>
              <p className="pk-curate__body">{t(step.bodyKey)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}