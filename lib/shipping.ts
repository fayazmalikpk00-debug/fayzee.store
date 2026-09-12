export const DEFAULT_STANDARD_SHIPPING_FEE = 200;
export const DEFAULT_FREE_SHIPPING_THRESHOLD = 3000;

export interface ShippingQuoteInput {
  itemShippingTotal: number;
  subtotal: number;
  standardShippingFee?: number | null;
  freeShippingThreshold?: number | null;
}

/**
 * Authoritative shipping total used by checkout UI and order creation.
 * Free delivery applies when subtotal meets the platform threshold;
 * otherwise use per-item shipping fees, falling back to the standard fee.
 */
export function calculateOrderShipping({
  itemShippingTotal,
  subtotal,
  standardShippingFee,
  freeShippingThreshold,
}: ShippingQuoteInput): number {
  const threshold = freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD;
  const standard = standardShippingFee ?? DEFAULT_STANDARD_SHIPPING_FEE;

  if (subtotal > 0 && subtotal >= threshold) {
    return 0;
  }

  return itemShippingTotal > 0 ? itemShippingTotal : standard;
}
