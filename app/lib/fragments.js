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

// Mega menu data for the Shop dropdown. Lists all 19 category collections
// with a representative product image, so the header can render a
// hover-revealed panel with category tiles. Note: Storefront API does not
// expose a productsCount field on Collection, so we rely on the collection
// description (set in Shopify admin) for any count or summary copy.
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
    phoneCase: collection(handle: "phone-case") { ...MegaCategory }
    homeEssentials: collection(handle: "home-essentials") { ...MegaCategory }
    electronicsAccessories: collection(handle: "electronics-accessories") { ...MegaCategory }
    apparelAccessories: collection(handle: "apparel-accessories") { ...MegaCategory }
    healthWellness: collection(handle: "health-wellness") { ...MegaCategory }
    sportsOutdoors: collection(handle: "sports-outdoors") { ...MegaCategory }
    petFinds: collection(handle: "pet-finds") { ...MegaCategory }
    automotive: collection(handle: "automotive") { ...MegaCategory }
    toolsHomeImprovement: collection(handle: "tools-home-improvement") { ...MegaCategory }
    beautyPersonalCare: collection(handle: "beauty-personal-care") { ...MegaCategory }
    toysGames: collection(handle: "toys-games") { ...MegaCategory }
    homeDecor: collection(handle: "home-decor") { ...MegaCategory }
    officeSchoolSupplies: collection(handle: "office-school-supplies") { ...MegaCategory }
    babyNursery: collection(handle: "baby-nursery") { ...MegaCategory }
    outdoorGarden: collection(handle: "outdoor-garden") { ...MegaCategory }
    bestSellers: collection(handle: "best-sellers") { ...MegaCategory }
    trendingFinds: collection(handle: "trending-finds") { ...MegaCategory }
    giftsUnder25: collection(handle: "gifts-under-25") { ...MegaCategory }
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
