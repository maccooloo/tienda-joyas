export const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  availableForSale
  priceRange { minVariantPrice { amount currencyCode } }
  featuredImage { url altText width height }
  images(first: 12) { nodes { url altText width height } }
  variants(first: 100) {
    nodes {
      id
      title
      availableForSale
      quantityAvailable
      price { amount currencyCode }
      selectedOptions { name value }
      image { url altText width height }
    }
  }
  media(first: 12) {
    nodes {
      __typename
      ... on MediaImage { image { url altText width height } }
      ... on Model3d { sources { url mimeType } }
    }
  }
`;

export const FEATURED_COLLECTION_QUERY = `
  query FeaturedCollection @inContext(country: ES, language: ES) {
    collections(first: 1, sortKey: UPDATED_AT) {
      nodes {
        id
        handle
        title
        description
        image { url altText width height }
        products(first: 4, sortKey: BEST_SELLING) {
          nodes {
            id handle title description availableForSale
            priceRange { minVariantPrice { amount currencyCode } }
            featuredImage { url altText width height }
            images(first: 3) { nodes { url altText width height } }
          }
        }
      }
    }
  }
`;

export const HOME_COLLECTIONS_QUERY = `
  query HomeCollections @inContext(country: ES, language: ES) {
    collections(first: 4, sortKey: UPDATED_AT) {
      nodes {
        id handle title description
        image { url altText width height }
        products(first: 8, sortKey: BEST_SELLING) {
          nodes {
            id handle title description availableForSale
            priceRange { minVariantPrice { amount currencyCode } }
            featuredImage { url altText width height }
            images(first: 2) { nodes { url altText width height } }
            variants(first: 20) {
              nodes {
                id title availableForSale quantityAvailable
                price { amount currencyCode }
                selectedOptions { name value }
                image { url altText width height }
              }
            }
          }
        }
      }
    }
  }
`;

export const COLLECTION_QUERY = `
  query CollectionByHandle($handle: String!, $sortKey: ProductCollectionSortKeys!) @inContext(country: ES, language: ES) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
      products(first: 48, sortKey: $sortKey) {
        nodes {
          id handle title description availableForSale
          priceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText width height }
          images(first: 2) { nodes { url altText width height } }
        }
      }
    }
  }
`;

export const PRODUCT_QUERY = `
  query ProductByHandle($handle: String!) @inContext(country: ES, language: ES) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

export const CATALOG_QUERY = `
  query AvailableCatalog($cursor: String) @inContext(country: ES, language: ES) {
    products(first: 100, after: $cursor) {
      nodes {
        id handle title description availableForSale
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText width height }
        images(first: 2) { nodes { url altText width height } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const SITEMAP_QUERY = `
  query StorefrontSitemap($productCursor: String, $collectionCursor: String) @inContext(country: ES, language: ES) {
    products(first: 250, after: $productCursor) {
      nodes { handle updatedAt }
      pageInfo { hasNextPage endCursor }
    }
    collections(first: 250, after: $collectionCursor) {
      nodes { handle updatedAt }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const CART_QUERY = `
  query CartById($cartId: ID!) @inContext(country: ES, language: ES) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost { subtotalAmount { amount currencyCode } }
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              product { title handle }
              image { url altText width height }
              price { amount currencyCode }
            }
          }
          cost { totalAmount { amount currencyCode } }
        }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines, buyerIdentity: { countryCode: ES } }) {
      cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } } }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } } }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } } }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } } }
      userErrors { field message }
    }
  }
`;
