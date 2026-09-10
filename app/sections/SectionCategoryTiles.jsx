import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {
  sectionCollections,
  sectionFields,
  sectionText,
} from '~/lib/sections';

/**
 * A row of collection tiles — the navigational spine of a category system.
 *
 * Tiles come from referenced Collections rather than free-typed links, so a
 * renamed or deleted collection cannot leave a 404 behind: `sectionCollections`
 * drops any reference without a handle, and a collection removed in admin
 * simply stops appearing. This repo has shipped dead product links twice
 * before, both times from hardcoded handles.
 *
 * A tile without artwork still renders. Waiting on imagery is how category
 * pages end up permanently unbuilt.
 *
 * @param {{section: object}}
 */
export function SectionCategoryTiles({section}) {
  const fields = sectionFields(section);
  const heading = sectionText(fields, 'heading');
  const collections = sectionCollections(fields, 'collections');

  if (!collections.length) return null;

  return (
    <section className="pk-section-tiles">
      <div className="pk-section-tiles__inner">
        {heading ? (
          <h2 className="pk-section-tiles__heading">{heading}</h2>
        ) : null}
        <ul className="pk-section-tiles__grid">
          {collections.map((collection) => (
            <li className="pk-section-tiles__item" key={collection.id}>
              <Link
                className="pk-section-tiles__link"
                to={`/collections/${collection.handle}`}
              >
                {collection.image ? (
                  <Image
                    className="pk-section-tiles__media"
                    data={collection.image}
                    sizes="(min-width: 45em) 25vw, 50vw"
                    loading="lazy"
                  />
                ) : (
                  <span className="pk-section-tiles__media pk-section-tiles__media--blank" />
                )}
                <span className="pk-section-tiles__label">
                  {collection.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
