/** Design handoff only. Build and validate an adapter from the existing API before use. */
export interface Money {
  minorUnits: number;
  currency: 'INR';
}
export type Availability =
  | { kind: 'available'; remaining: number }
  | { kind: 'outOfStock' }
  | { kind: 'sellerUnavailable' };
export interface SellerOfferView {
  listingId: number;
  variantId: number;
  seller: {
    id: number;
    displayName: string;
    isVerified: boolean;
    rating: number | null;
  };
  price: Money;
  mrp: Money;
  availability: Availability;
  condition: 'NEW' | 'REFURBISHED' | 'USED';
}
export interface ProductCardView {
  productId: number;
  title: string;
  slug: string;
  image: { url: string; alt: string } | null;
  featuredOffer: SellerOfferView | null;
  // Reviews are future work: do not invent live ratings when the server supplies none.
  reviewSummary: { rating: number; count: number } | null;
}
export type ContentState<T> =
  | { status: 'loading' }
  | { status: 'ready'; value: T }
  | { status: 'empty'; title: string; description: string }
  | { status: 'error'; message: string; canRetry: boolean };
export interface AddCartItemInput {
  listingId: number;
  quantity: number;
}
/** Proposed future checkout intent; no corresponding backend endpoint currently exists. */
export interface CheckoutIntent {
  intentKey: string; // Generate once per user intent and retain across retries.
  addressId: number;
  lines: ReadonlyArray<{ listingId: number; quantity: number }>;
}
