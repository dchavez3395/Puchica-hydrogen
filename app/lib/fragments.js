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
// collection with a representative product image.
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
 * Homepage product + category queries.
 * The product fragment mirrors `RECOMMENDED_ITEM_FRAGMENT` from the
 * PDP so the same `<ProductItem>` card renders identically everywhere.
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
    products(first: 1, sortKey: BEST_SELLING) {
      nodes {
        featuredImage {
          id url altText width height
        }
      }
    }
  }
`;

export const HOME_BEST_SELLERS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeBestSellers(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    bestSellers: collection(handle: "best-sellers") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...HomeProduct }
      }
    }
  }
`;

export const HOME_NEW_ARRIVALS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeNewArrivals(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    newArrivals: products(first: 24, sortKey: CREATED_AT, reverse: true) {
      nodes { ...HomeProduct }
    }
  }
`;

export const HOME_SALE_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeSale(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    onSale: collection(handle: "sale") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...HomeProduct }
      }
    }
  }
`;

export const HOME_FOR_YOU_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeForYou(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    forYou: collection(handle: "for-you") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...HomeProduct }
      }
    }
  }
`;

export const HOME_TRENDING_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeTrending(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    trending: collection(handle: "trending-finds") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...HomeProduct }
      }
    }
  }
`;

export const HOME_GIFTS_QUERY = `#graphql
  ${HOME_PRODUCT_FRAGMENT}
  query HomeGifts(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    gifts: collection(handle: "gifts-under-25") {
      products(first: 12, sortKey: BEST_SELLING) {
        nodes { ...HomeProduct }
      }
    }
  }
`;

export const HOME_CATEGORIES_QUERY = `#graphql
  ${HOME_CATEGORY_TILE_FRAGMENT}
  query HomeCategories(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    # 15 department handles ordered by catalog size (largest first).
    # The Storefront API does not sort Collection by productsCount,
    # so we list them by hand to keep the visual order stable.
    categories: collections(
      first: 25
      query: "handle:phone-case OR handle:home-kitchen OR handle:electronics-accessories OR handle:apparel-accessories OR handle:health-wellness OR handle:sports-outdoors OR handle:pet-supplies OR handle:automotive OR handle:tools-home-improvement OR handle:beauty-personal-care OR handle:toys-games OR handle:home-decor OR handle:office-school OR handle:baby-nursery OR handle:outdoor-garden"
    ) {
      nodes { ...HomeCategoryTile }
    }
  }
`;