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
    $headerMenuHandle: String!
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    localization {
      country {
        isoCode
        currency { isoCode }
      }
      availableCountries {
        isoCode
        currency { isoCode }
      }
    }
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;

/**
 * Card-shaped product fields for any grid or rail that renders <ProductItem>.
 * Shared by /collections/all and the product page's "pairs with" rail so the
 * two cannot drift into rendering different data for the same card.
 */
export const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 { amount currencyCode }
  fragment CollectionItem on Product {
    id
    handle
    title
    availableForSale
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice { ...MoneyCollectionItem }
      maxVariantPrice { ...MoneyCollectionItem }
    }
    options(first: 1) {
      name
      values
      optionValues {
        name
        swatch { color }
      }
    }
    variants(first: 100) {
      nodes {
        id
        sku
        availableForSale
        title
        requiresShipping
        image {
          id
          altText
          url
          width
          height
        }
        price { ...MoneyCollectionItem }
        compareAtPrice { ...MoneyCollectionItem }
        selectedOptions {
          name
          value
        }
        product {
          id
          handle
          title
          vendor
        }
      }
    }
  }
`;
