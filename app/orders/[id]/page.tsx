import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { getOrderById } from "@/services/orderService";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { success?: string };
}) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  let shippingAddress: any = {};
  try {
    shippingAddress =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;
  } catch {
    shippingAddress = {};
  }

  const isCancelled = order.status === "CANCELLED";
  const isConfirmed = [
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ].includes(order.status);
  const isProcessing = [
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ].includes(order.status);
  const isShipped = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
    order.status
  );
  const isDelivered = order.status === "DELIVERED";

  // Dynamic real-time timeline steps
  const steps = [
    {
      title: "Order Placed",
      isCompleted: true,
      isCurrent: order.status === "PENDING",
      date: order.createdAt,
      subtitle: "Order placed by customer",
    },
    {
      title: isConfirmed ? "Order Confirmed" : "Seller Approval",
      isCompleted: isConfirmed,
      isCurrent: order.status === "PENDING",
      date: isConfirmed ? order.updatedAt : null,
      subtitle: isConfirmed
        ? "Confirmed & accepted by seller"
        : "⏳ Awaiting Seller Approval",
    },
    {
      title: "Processing & Packing",
      isCompleted: isProcessing,
      isCurrent: order.status === "CONFIRMED" || order.status === "PROCESSING",
      date: isProcessing && !isShipped ? order.updatedAt : null,
      subtitle: isProcessing
        ? "Items securely packed & inspected"
        : "Pending packaging",
    },
    {
      title: "Shipped",
      isCompleted: isShipped,
      isCurrent: order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY",
      date: isShipped && !isDelivered ? order.updatedAt : null,
      subtitle: isShipped
        ? order.trackingNumber
          ? `${order.trackingNumber}`
          : "Handed over to courier"
        : "Pending courier pickup",
    },
    {
      title: "Delivered",
      isCompleted: isDelivered,
      isCurrent: isDelivered,
      date: isDelivered ? order.updatedAt : null,
      subtitle: isDelivered
        ? "Package delivered to customer"
        : "Pending final delivery",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Success Notification Banner on first arrival */}
      {searchParams.success && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Thank you for your order!</span> Your order has been placed and sent to the store sellers for approval and dispatch.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DDE2E6] gap-3">
        <div>
          <span className="text-xs font-bold text-[#FF5E00] uppercase tracking-wider">
            Order Lifecycle
          </span>
          <h1 className="text-2xl font-black text-[#1C2A39]">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {order.status === "PENDING" && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Awaiting Seller Approval</span>
            </span>
          )}
          {order.status === "CONFIRMED" && (
            <span className="px-3 py-1.5 bg-sky-50 text-sky-800 text-xs font-bold rounded-full border border-sky-200 flex items-center gap-1.5 shadow-xs">
              <Check className="w-3.5 h-3.5 text-sky-600" />
              <span>Confirmed by Seller</span>
            </span>
          )}
          {order.status === "PROCESSING" && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1.5 shadow-xs">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>Packing & Processing</span>
            </span>
          )}
          {order.status === "SHIPPED" && (
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200 flex items-center gap-1.5 shadow-xs">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Shipped / On Route</span>
            </span>
          )}
          {order.status === "DELIVERED" && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivered</span>
            </span>
          )}
          {order.status === "CANCELLED" && (
            <span className="px-3 py-1.5 bg-rose-50 text-rose-800 text-xs font-bold rounded-full border border-rose-200 flex items-center gap-1.5 shadow-xs">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Order Cancelled</span>
            </span>
          )}
        </div>
      </div>

      {/* Cancelled Order Notice */}
      {isCancelled ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>This Order Has Been Cancelled</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            The seller or administration has cancelled this order. If you paid online via card or wallet, the refund will be automatically routed back to your payment account. If this was Cash on Delivery, no charges apply.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        /* Delivery Tracking Timeline */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE2E6] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF5E00]" />
              <span>Fulfillment & Delivery Progress</span>
            </h3>

            {order.status === "PENDING" && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Step 1 Complete • Next: Seller Approval
              </span>
            )}
            {order.status === "PROCESSING" && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Approved by Seller • Packing in progress
              </span>
            )}
            {order.status === "SHIPPED" && (
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Dispatched with courier
              </span>
            )}
            {order.status === "DELIVERED" && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ Order Delivered
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => {
              return (
                <div key={step.title} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition relative ${
                      step.isCompleted
                        ? "bg-[#FF5E00] text-white shadow-sm"
                        : step.isCurrent
                        ? "bg-amber-100 text-amber-800 border-2 border-amber-500 shadow-sm"
                        : "bg-[#F7F9FA] text-[#777777] border border-[#DDE2E6]"
                    }`}
                  >
                    {step.isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : step.isCurrent ? (
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="w-full px-1">
                    <h4
                      className={`text-xs font-bold leading-tight ${
                        step.isCompleted
                          ? "text-[#1C2A39]"
                          : step.isCurrent
                          ? "text-[#FF5E00]"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h4>

                    {step.isCompleted && step.date ? (
                      <span className="text-[10px] text-[#777777] block mt-0.5">
                        {formatDate(step.date)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                        {step.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Courier Tracking Details Banner if available */}
          {order.trackingNumber && (
            <div className="mt-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-indigo-950 block">
                    Courier Consignment / Tracking Details
                  </span>
                  <span className="text-indigo-700 font-mono font-bold text-xs block">
                    {order.trackingNumber}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-200 font-medium self-start sm:self-auto">
                Package dispatched by seller
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid: Delivery Info + Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#DDE2E6] text-xs space-y-2">
          <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-1.5 pb-2 border-b border-[#DDE2E6]">
            <MapPin className="w-4 h-4 text-[#FF5E00]" /> Delivery Address
          </h3>
          <p className="font-bold text-[#1C2A39]">{shippingAddress.fullName || order.user?.name}</p>
          <p className="text-[#333333]">{shippingAddress.street}</p>
          <p className="text-[#333333]">
            {shippingAddress.city}
            {shippingAddress.state ? `, ${shippingAddress.state}` : ""}
            {shippingAddress.postalCode ? ` ${shippingAddress.postalCode}` : ""}
          </p>
          <p className="text-[#333333] font-medium">Phone: {shippingAddress.phone || order.user?.phone || "N/A"}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DDE2E6] text-xs space-y-2">
          <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-1.5 pb-2 border-b border-[#DDE2E6]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Payment Information
          </h3>
          <div className="flex justify-between">
            <span className="text-[#777777]">Method:</span>
            <span className="font-bold text-[#1C2A39]">
              {order.paymentMethod === "COD" ? "Cash On Delivery (COD)" : order.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#777777]">Payment Status:</span>
            <span
              className={`font-bold ${
                order.paymentStatus === "PAID"
                  ? "text-emerald-600"
                  : order.paymentStatus === "CANCELLED"
                  ? "text-rose-600"
                  : "text-amber-600"
              }`}
            >
              {order.paymentStatus === "PAID"
                ? "Paid & Settled"
                : order.paymentStatus === "PENDING"
                ? "Pending Collection (COD)"
                : order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#777777]">Grand Total:</span>
            <span className="font-black text-[#FF5E00] text-sm">
              {formatPrice(order.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Receipt Table with Item-level fulfillment badges */}
      <div className="bg-white rounded-3xl border border-[#DDE2E6] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#1C2A39] pb-2 border-b border-[#DDE2E6]">
          Order Items ({order.items.length})
        </h3>

        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs py-3 border-b border-[#DDE2E6] last:border-0"
            >
              <img
                src={
                  item.product.images[0]?.url ||
                  "/images/product-placeholder.svg"
                }
                alt=""
                className="w-14 h-14 object-cover rounded-xl bg-[#F7F9FA] border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-bold text-[#1C2A39] hover:text-[#FF5E00] truncate block"
                >
                  {item.title}
                </Link>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-[#777777] flex items-center gap-1">
                    <Store className="w-3 h-3 text-slate-400" />
                    <span>Store:</span>
                    <Link
                      href={`/sellers/${item.seller.storeSlug}`}
                      className="font-medium text-[#1C2A39] hover:underline"
                    >
                      {item.seller.storeName}
                    </Link>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-[#777777]">
                    Qty: <strong className="text-slate-900">{item.quantity}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-[#777777] font-mono">
                    SKU: {item.sku}
                  </span>
                </div>

                {/* Specific Item Status Badge */}
                <div className="mt-2">
                  {item.fulfillmentStatus === "PENDING" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      ⏳ Awaiting Seller Approval
                    </span>
                  )}
                  {item.fulfillmentStatus === "PROCESSING" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      📦 Packing & Preparing
                    </span>
                  )}
                  {item.fulfillmentStatus === "SHIPPED" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      🚚 Shipped & In Transit
                    </span>
                  )}
                  {item.fulfillmentStatus === "DELIVERED" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Delivered
                    </span>
                  )}
                  {item.fulfillmentStatus === "CANCELLED" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      ❌ Item Cancelled
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:text-right">
                <p className="font-bold text-[#1C2A39] text-sm">{formatPrice(item.total)}</p>
                <p className="text-[10px] text-[#777777]">{formatPrice(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 text-xs pt-4 border-t border-[#DDE2E6] max-w-xs ml-auto">
          <div className="flex justify-between text-[#777777]">
            <span>Subtotal:</span>
            <span className="font-bold text-[#1C2A39]">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount:</span>
              <span className="font-bold">-{formatPrice(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#777777]">
            <span>Shipping:</span>
            <span className="font-bold text-[#1C2A39]">
              {order.shippingTotal === 0 ? "FREE" : formatPrice(order.shippingTotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-[#1C2A39] pt-2 border-t border-[#DDE2E6]">
            <span>Grand Total:</span>
            <span className="text-[#FF5E00]">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
