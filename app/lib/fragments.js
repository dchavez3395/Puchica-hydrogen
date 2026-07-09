// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
export const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    parentRelationship {
      parent {
        id
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    lineComponents {
      ...CartLine
    }
  }
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
`;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
`;

export const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  query Header(
    $headerMenuHandle: String!) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;

// Mega menu data for the Shop dropdown: every storefront-published
// collection with a representative product image. The component picks
// categories/featured out of the list by handle. Note: Storefront API
// does not expose productsCount on Collection, so the panel shows
// names only.
export const MEGA_MENU_QUERY = `#graphql
  fragment MegaCategory on Collection {
    id
    handle
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 1) {
      nodes {
        id
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
  # One list query instead of 18 hand-aliased lookups: the component
  # maps handles from this list, so new/renamed collections only need
  # the ordered handle array in MegaMenu.jsx — not a query change.
  # (Collections must be published to the Puchica Storefront channel
  # to appear here — that's a Shopify admin publication, not code.)
  query MegaMenu {
    collections(first: 30) {
      nodes { ...MegaCategory }
    }
  }
`;

export const FOOTER_QUERY = `#graphql
  query Footer(
    $footerMenuHandle: String!) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;

/**
 * Homepage product + category queries. Used by `app/routes/_index.jsx`
 * after the 17→8 section cut. Fragments are kept here (instead of
 * inline in the route) so the schema is discoverable in one place.
 *
 * The product fragment mirrors `RECOMMENDED_ITEM_FRAGMENT` from the
 * PDP so the same `<ProductItem>` card renders identically on
 * home / PDP-related / collection pages.
 */
const HOME_PRODUCT_FRAGMENT = `#graphql
  fragment HomeProduct on Product {
    id handle title productType tags
    featuredImage { id url altText width height }
    images(first: 2) { nodes { id url altText width height } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    options(first: 1) {
      name
      values
      optionValues { name swatch { color } }
    }
    variants(first: 1) { nodes { id availableForSale } }
  }
`;

const HOME_CATEGORY_TILE_FRAGMENT = `#graphql
  fragment HomeCategoryTile on Collection {
    id handle title
    image { id url altText width height }
    # The category's own "image" is often null in this store (a
    # merchandiser hasn't uploaded collection images yet). To keep
    # the homepage tile section visually rich, fall back to the
    # first product's "featuredImage" -- same field shape, real
    # product photo. The section picks whichever is present.
    products(first: 1, sortKey: BEST_SELLING) {
      nodes {
        featuredImage {
          id url altText width height
        }
      }
    }
    # Storefront API does not expose a productsCount field on
    # Collection, so we omit it. The section hides the count
    # line when missing rather than guessing.
  }
`;

export const HOME_BEST_SELLERS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeBestSellers(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    # The "best-sellers" collection is empty in this store, so we
    # pull from the top-level products connection sorted by
    # BEST_SELLING. This gives us the actual top sellers across
    # all collections instead of an empty rail.
    bestSellers: products(first: 8, sortKey: BEST_SELLING) {
      nodes { ...HomeProduct }
    }
  }
`;

export const HOME_NEW_ARRIVALS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeNewArrivals(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    # Source from the top-level products connection, sorted by
    # CREATED_AT desc. The previous query pulled from
    # collection(handle: "outdoor-garden") which made the
    # "new arrivals" rail read as "new stuff in one category" --
    # all 8 cards were outdoor products from a single bulk import.
    # 24 (not 8) gives the rail's vendor diversification helper
    # enough material to interleave vendors. The section still
    # slices to 8 cards in the view layer.
    # Note: the top-level products connection's sort enum is
    # ProductSortKeys (CREATED_AT), not ProductCollectionSortKeys
    # (CREATED) used inside collection.products.
    newArrivals: products(first: 24, sortKey: CREATED_AT, reverse: true) {
      nodes { ...HomeProduct }
    }
  }
`;

export const HOME_SPORTS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeSports(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    # Filter on the Shopify product_type field. The store has
    # real sports products (rangefinders, shin guards, trail
    # cameras) tagged product_type: "Sports & Outdoors".
    # BEST_SELLING -- not CREATED -- is the right merchandising
    # sort for a category rail: show what people buy, not what
    # was imported last.
    #
    # Note: the unquoted form "product_type:Sports & Outdoors"
    # works; the single-quoted form "product_type:'Sports &...'"
    # returns zero results. The "&" is treated as a search
    # operator inside quotes -- use bare value, not quoted.
    sports: products(
      first: 8
      sortKey: BEST_SELLING
      query: "product_type:Sports & Outdoors"
    ) {
      nodes { ...HomeProduct }
    }
  }
`;

export const HOME_WORLD_CUP_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeWorldCup(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    # The store has 32+ Canada soccer jerseys and soccer gear
    # tagged "soccer jersey", "born canadian", "canada". The old
    # "tag:world cup" query returned 0 — no products use that tag.
    # This query matches the real tags so jerseys actually show.
    worldCup: products(
      first: 8
      sortKey: BEST_SELLING
      query: "tag:soccer-jersey OR tag:born-canadian OR tag:'soccer jersey'"
    ) {
      nodes { ...HomeProduct }
    }
  }
`;

export const HOME_CATEGORIES_QUERY = `#graphql
  ${HOME_CATEGORY_TILE_FRAGMENT}
  query HomeCategories(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    # 8 hard-coded top-level category handles. The Storefront API
    # does not sort Collection by productsCount, so we list them
    # by hand to keep the visual order stable.
    categories: collections(
      first: 8
      query: "handle:phone-case OR handle:home-kitchen OR handle:electronics-accessories OR handle:apparel-accessories OR handle:health-wellness OR handle:sports-outdoors OR handle:pet-supplies OR handle:outdoor-garden"
    ) {
      nodes { ...HomeCategoryTile }
    }
  }
`;
