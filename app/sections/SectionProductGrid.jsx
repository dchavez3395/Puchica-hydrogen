import {ProductItem} from '~/components/ProductItem';
import {sectionFields, sectionText} from '~/lib/sections';

/**
 * A grid of the products the PAGE has already loaded.
 *
 * This section deliberately does not fetch anything of its own. Giving a
 * metaobject its own product query would mean a merchant could add three of
 * them to one page and quietly turn a single render into four round trips, and
 * it would also let admin content decide what the storefront queries — which is
 * exactly the coupling the launch gate exists to prevent.
 *
 * So it renders `products` handed down from the route, which have already been
 * through `filterLaunchProducts`. The homepage passes its launch cohort.
 *
 * The collection route deliberately passes NOTHING: its own grid is paginated,
 * and a section cannot paginate. A product-grid section dropped onto a
 * collection page therefore renders nothing rather than a second, truncated,
 * unpaginated copy of the list already on screen. That is stated in the
 * metaobject's admin description too, so it is discoverable before it is
 * confusing.
 *
 * @param {{section: object, products?: Array<object>}}
 */
export function SectionProductGrid({section, products}) {
  const fields = sectionFields(section);
  const heading = sectionText(fields, 'heading');

  const limitRaw = Number(sectionText(fields, 'limit'));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : null;

  const all = Array.isArray(products) ? products : [];
  const shown = limit ? all.slice(0, limit) : all;

  if (!shown.length) return null;

  return (
    <section className="pk-section-grid">
      <div className="pk-section-grid__inner">
        {heading ? (
          <h2 className="pk-section-grid__heading">{heading}</h2>
        ) : null}
        <div className="pk-section-grid__items">
          {shown.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 4 ? 'eager' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
