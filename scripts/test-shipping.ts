import {
  calculateOrderShipping,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_STANDARD_SHIPPING_FEE,
} from "../lib/shipping";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
  console.log(`  PASS: ${msg}`);
}

function main() {
  console.log("Shipping quote tests");

  assert(
    calculateOrderShipping({ itemShippingTotal: 400, subtotal: 4000 }) === 0,
    "orders at the default free-shipping threshold pay no shipping"
  );

  assert(
    calculateOrderShipping({
      itemShippingTotal: 400,
      subtotal: DEFAULT_FREE_SHIPPING_THRESHOLD,
    }) === 0,
    "subtotal exactly at the threshold is free"
  );

  assert(
    calculateOrderShipping({ itemShippingTotal: 400, subtotal: 1500 }) === 400,
    "below-threshold orders keep per-item shipping fees"
  );

  assert(
    calculateOrderShipping({ itemShippingTotal: 0, subtotal: 1500 }) ===
      DEFAULT_STANDARD_SHIPPING_FEE,
    "below-threshold orders with no item fees use the standard shipping fee"
  );

  assert(
    calculateOrderShipping({ itemShippingTotal: 0, subtotal: 5000 }) === 0,
    "over-threshold orders do not fall back to the standard fee"
  );

  assert(
    calculateOrderShipping({
      itemShippingTotal: 250,
      subtotal: 1800,
      standardShippingFee: 150,
      freeShippingThreshold: 2000,
    }) === 250,
    "admin-configured threshold still charges item shipping below the cutoff"
  );

  assert(
    calculateOrderShipping({
      itemShippingTotal: 250,
      subtotal: 2000,
      standardShippingFee: 150,
      freeShippingThreshold: 2000,
    }) === 0,
    "admin-configured threshold waives shipping at the cutoff"
  );

  assert(
    calculateOrderShipping({
      itemShippingTotal: 0,
      subtotal: 800,
      standardShippingFee: 99,
      freeShippingThreshold: 3000,
    }) === 99,
    "admin-configured standard fee is used when items have no shippingFee"
  );

  assert(
    calculateOrderShipping({ itemShippingTotal: 0, subtotal: 0 }) ===
      DEFAULT_STANDARD_SHIPPING_FEE,
    "empty subtotal does not qualify for free shipping"
  );

  console.log("\nAll shipping quote tests passed.");
}

main();
