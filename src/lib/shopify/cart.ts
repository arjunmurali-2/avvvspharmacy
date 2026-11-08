import 'server-only';
import { storefront } from './client';
import type { Cart } from './types';

const CART = `
fragment CartF on Cart {
  id checkoutUrl totalQuantity note
  attributes { key value }
  discountCodes { code applicable }
  buyerIdentity { email }
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } totalTaxAmount { amount currencyCode } }
  lines(first: 100) {
    nodes {
      id quantity
      cost { totalAmount { amount currencyCode } amountPerQuantity { amount currencyCode } compareAtAmountPerQuantity { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id title availableForSale
          image { url altText width height }
          price { amount currencyCode }
          product { handle title productType }
        }
      }
    }
  }
}`;

type UserError = { field: string[] | null; message: string; code?: string | null };
type Payload = { cart: Cart | null; userErrors: UserError[]; warnings?: { message: string; code: string }[] };

export class CartError extends Error {}

async function mutate(name: string, signature: string, args: string, vars: Record<string, unknown>): Promise<Cart> {
  const q = `${CART} mutation M(${signature}) { ${name}(${args}) { cart { ...CartF } userErrors { field message code } warnings { message code } } }`;
  const d = await storefront<Record<string, Payload>>(q, vars, { revalidate: false });
  const p = d[name];
  if (p.userErrors?.length) throw new CartError(p.userErrors.map((e) => e.message).join(' '));
  if (!p.cart) throw new CartError('The cart could not be updated.');
  return p.cart;
}

export async function fetchCart(id: string): Promise<Cart | null> {
  const d = await storefront<{ cart: Cart | null }>(`${CART} query C($id: ID!) { cart(id: $id) { ...CartF } }`, { id }, { revalidate: false });
  return d.cart;
}

export type LineInput = { merchandiseId: string; quantity: number; attributes?: { key: string; value: string }[] };

export const createCart = (lines: LineInput[], buyer?: { customerAccessToken?: string; email?: string }) =>
  mutate('cartCreate', '$input: CartInput', 'input: $input', {
    input: { lines, ...(buyer ? { buyerIdentity: { ...buyer, countryCode: 'IN' } } : { buyerIdentity: { countryCode: 'IN' } }) },
  });

export const addLines = (cartId: string, lines: LineInput[]) =>
  mutate('cartLinesAdd', '$cartId: ID!, $lines: [CartLineInput!]!', 'cartId: $cartId, lines: $lines', { cartId, lines });

export const updateLines = (cartId: string, lines: { id: string; quantity: number }[]) =>
  mutate('cartLinesUpdate', '$cartId: ID!, $lines: [CartLineUpdateInput!]!', 'cartId: $cartId, lines: $lines', { cartId, lines });

export const removeLines = (cartId: string, lineIds: string[]) =>
  mutate('cartLinesRemove', '$cartId: ID!, $lineIds: [ID!]!', 'cartId: $cartId, lineIds: $lineIds', { cartId, lineIds });

export const setDiscountCodes = (cartId: string, discountCodes: string[]) =>
  mutate('cartDiscountCodesUpdate', '$cartId: ID!, $discountCodes: [String!]!', 'cartId: $cartId, discountCodes: $discountCodes', { cartId, discountCodes });

export const setNote = (cartId: string, note: string) =>
  mutate('cartNoteUpdate', '$cartId: ID!, $note: String!', 'cartId: $cartId, note: $note', { cartId, note });

export const setAttributes = (cartId: string, attributes: { key: string; value: string }[]) =>
  mutate('cartAttributesUpdate', '$cartId: ID!, $attributes: [AttributeInput!]!', 'cartId: $cartId, attributes: $attributes', { cartId, attributes });

export const setBuyer = (cartId: string, buyerIdentity: { customerAccessToken?: string; email?: string; countryCode?: string }) =>
  mutate('cartBuyerIdentityUpdate', '$cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!', 'cartId: $cartId, buyerIdentity: $buyerIdentity', { cartId, buyerIdentity });
