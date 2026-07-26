import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Store-first homepage hero. The job here is not brand poetry; it is
 * orientation: search, jump into departments, and see live products fast.
 *
 * @param {{categories?: Array<object>}}
 */
export function HeroSplit({categories = []}) {
  const t = useT();
  const quickDepartments = categories.slice(0, 8);

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-store-hero">
          <div className="pk-store-hero__intro">
            <span className="pk-store-hero__eyebrow">
              {t('hero_split_eyebrow')}
            </span>
            <h1 className="pk-store-hero__heading">{t('hero_store_toolbar_heading')}</h1>
            <p className="pk-store-hero__body">{t('hero_split_body')}</p>
          </div>

          <div className="pk-store-hero__actions">
            <Link to="/collections" prefetch="viewport" className="pk-btn pk-btn--ink">
              {t('hero_split_cta_secondary')}
            </Link>
            <Link
              to="#launch-picks"
              prefetch="viewport"
              className="pk-btn pk-btn--outline"
            >
              {t('best_sellers_heading')}
            </Link>
          </div>

          {quickDepartments.length ? (
            <nav
              className="pk-store-hero__departments"
              aria-label={t('shop_by_category_aria')}
            >
              {quickDepartments.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  prefetch="intent"
                >
                  {collection.title}
                </Link>
              ))}
            </nav>
          ) : null}

        </div>
      </div>
    </section>
  );
}
