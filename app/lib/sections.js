/**
 * Metaobject-driven page sections.
 *
 * Hydrogen has no equivalent of a Liquid theme's sections-and-blocks editor.
 * The standard substitute, and what this module implements, is Shopify
 * METAOBJECTS as the content store: a merchant defines section entries in
 * Shopify admin, attaches an ordered list of them to a collection (or any
 * other resource) through a metafield, and the storefront maps each entry's
 * `type` to a React component at render time.
 *
 * The practical consequence is that adding, reordering or rewording a section
 * is an admin edit, not a deploy. Only introducing a genuinely NEW KIND of
 * section requires code — a component plus one line in the registry.
 *
 * Field access is deliberately tolerant. Metaobject definitions drift as a
 * store grows: fields get added, renamed, or left blank on older entries. A
 * section that throws because one optional field is missing would take the
 * whole page down, so every accessor here returns a safe empty value and the
 * components below decide whether they have enough to render.
 */

/**
 * Fields are returned as a flat `{key, value, reference, references}` list.
 * `value` is always a string — numbers, booleans and JSON all arrive encoded —
 * so the typed readers below do the conversion rather than each component
 * re-implementing it.
 */
export const SECTION_FRAGMENT = `#graphql
  fragment SectionImage on MediaImage {
    image { url altText width height }
  }
  fragment SectionField on MetaobjectField {
    key
    value
    reference {
      ...SectionImage
      ... on Collection { id handle title }
    }
    references(first: 12) {
      nodes {
        ...SectionImage
        ... on Collection {
          id
          handle
          title
          image { url altText width height }
        }
      }
    }
  }
  fragment Section on Metaobject {
    id
    type
    handle
    fields { ...SectionField }
  }
`;

/**
 * One page's ordered section list, addressed by handle.
 *
 * `page_layout` entries are keyed by the page they lay out — the entry with
 * handle `home` lays out the homepage. A page with no entry keeps whatever
 * layout is compiled into its route, which is what makes adopting this a
 * migration rather than a cutover: the built-in layout stays live until an
 * entry exists, and taking the entry away puts it back.
 */
export const PAGE_LAYOUT_QUERY = `#graphql
  query PageLayout($handle: String!, $country: CountryCode!, $language: LanguageCode!)
  @inContext(country: $country, language: $language) {
    metaobject(handle: {type: "page_layout", handle: $handle}) {
      id
      sections: field(key: "sections") {
        references(first: 20) {
          nodes { ...Section }
        }
      }
    }
  }
  ${SECTION_FRAGMENT}
`;

/**
 * Collapse the field list into a keyed map so components can read
 * `fields.heading` instead of scanning an array.
 *
 * @param {{fields?: Array<{key: string}>}} section
 */
export function sectionFields(section) {
  const output = {};
  for (const field of section?.fields || []) {
    if (field?.key) output[field.key] = field;
  }
  return output;
}

/**
 * @param {Record<string, {value?: string}>} fields
 * @param {string} key
 * @param {string} [fallback]
 */
export function sectionText(fields, key, fallback = '') {
  const value = fields?.[key]?.value;
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/**
 * A single referenced image, normalised to the shape <Image> expects.
 *
 * @param {Record<string, {reference?: {image?: object}}>} fields
 * @param {string} key
 */
export function sectionImage(fields, key) {
  const image = fields?.[key]?.reference?.image;
  if (!image?.url) return null;
  return {
    url: image.url,
    altText: image.altText || '',
    width: image.width || undefined,
    height: image.height || undefined,
  };
}

/**
 * Referenced collections, used by the category-tile section. Entries without a
 * handle cannot be linked and are dropped rather than rendered as dead tiles.
 *
 * @param {Record<string, {references?: {nodes?: Array<object>}}>} fields
 * @param {string} key
 */
export function sectionCollections(fields, key) {
  const nodes = fields?.[key]?.references?.nodes || [];
  return nodes
    .filter((node) => node?.handle)
    .map((node) => ({
      id: node.id,
      handle: node.handle,
      title: node.title || node.handle,
      image: node.image?.url ? node.image : null,
    }));
}
