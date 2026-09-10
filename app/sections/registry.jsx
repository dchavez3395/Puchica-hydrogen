import {SectionCategoryTiles} from '~/sections/SectionCategoryTiles';
import {SectionHero} from '~/sections/SectionHero';
import {SectionProductGrid} from '~/sections/SectionProductGrid';
import {SectionRichText} from '~/sections/SectionRichText';

/**
 * Metaobject type -> component.
 *
 * This map is the ONLY place code needs to change when the store gains a new
 * kind of section. Adding an INSTANCE of an existing kind, reordering the list,
 * or rewriting its copy are all admin edits with no deploy.
 *
 * Keys are Shopify metaobject type handles. Keep them prefixed so they are
 * obviously storefront content and cannot collide with metaobjects another app
 * installs into the same store.
 */
const SECTION_COMPONENTS = {
  section_hero: SectionHero,
  section_rich_text: SectionRichText,
  section_category_tiles: SectionCategoryTiles,
  section_product_grid: SectionProductGrid,
};

/**
 * Render an ordered list of metaobject sections.
 *
 * Unknown types are skipped in silence on purpose. A merchant can create a
 * section type in admin before the component that renders it has shipped, and
 * an unrecognised entry must degrade to nothing rather than throwing and taking
 * the route's whole render down with it. The same applies to a null entry left
 * behind by a deleted metaobject.
 *
 * `products` is passed straight through to every section. Only the product
 * grid reads it; the rest ignore it. Threading it as one prop rather than a
 * context keeps the data flow visible at the call site — a route that hands
 * down products is saying so in its own JSX.
 *
 * @param {{sections?: Array<{id?: string, type?: string}>, products?: Array<object>}}
 */
export function SectionRenderer({sections, products}) {
  const list = Array.isArray(sections) ? sections : [];
  if (!list.length) return null;

  return (
    <>
      {list.map((section, index) => {
        const Component = section?.type
          ? SECTION_COMPONENTS[section.type]
          : null;
        if (!Component) return null;
        return (
          <Component
            key={section.id || `${section.type}-${index}`}
            section={section}
            products={products}
          />
        );
      })}
    </>
  );
}
