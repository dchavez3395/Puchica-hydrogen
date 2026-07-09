import {useT} from '~/lib/t';
import {IconShield, IconTag, IconTruck} from '~/components/Icons';

/**
 * "Why Puchica" band — a warm cream band with three value props.
 * Honest about the model: we curate, we source, we ship fast.
 * Uses icons instead of numbered steps (numbers feel AI-generated).
 */
export function HowWeCurate() {
  const t = useT();
  const steps = [
    {
      Icon: IconShield,
      headingKey: 'home_curate_step1_h',
      bodyKey: 'home_curate_step1_b',
    },
    {
      Icon: IconTag,
      headingKey: 'home_curate_step2_h',
      bodyKey: 'home_curate_step2_b',
    },
    {
      Icon: IconTruck,
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
        <div className="pk-curate">
          {steps.map(({Icon, headingKey, bodyKey}) => (
            <div className="pk-curate__step" key={headingKey}>
              <span className="pk-curate__icon" aria-hidden="true">
                <Icon size={28} />
              </span>
              <h3 className="pk-curate__h">{t(headingKey)}</h3>
              <p className="pk-curate__body">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}