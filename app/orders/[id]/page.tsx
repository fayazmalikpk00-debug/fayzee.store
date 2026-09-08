import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { getOrderById } from "@/services/orderService";
import {
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
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

  const shippingAddress = JSON.parse(order.shippingAddress);

  const steps = [
    { title: "Order Placed", status: "PENDING", date: order.createdAt },
    { title: "Confirmed", status: "CONFIRMED", date: order.createdAt },
    { title: "Processing", status: "PROCESSING", date: null },
    { title: "Shipped", status: "SHIPPED", date: null },
    { title: "Delivered", status: "DELIVERED", date: null },
  ];

  const statusOrder = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Success Notification Banner on first arrival */}
      {searchParams.success && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Thank you for your order!</span> Your order has been placed and confirmed with the sellers.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DDE2E6] gap-2">
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
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
            Status: {order.status}
          </span>
        </div>
      </div>

      {/* Delivery Tracking Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE2E6] shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#FF5E00]" />
          <span>Fulfillment & Delivery Progress</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.title} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    isCompleted
                      ? "bg-[#FF5E00] text-white shadow-sm"
                      : "bg-[#F7F9FA] text-[#777777] border border-[#DDE2E6]"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isCurrent ? "text-[#FF5E00]" : "text-[#1C2A39]"}`}>
                    {step.title}
                  </h4>
                  {isCompleted && step.date && (
                    <span className="text-[10px] text-[#777777] block">
                      {formatDate(step.date)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Delivery Info + Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#DDE2E6] text-xs space-y-2">
          <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-1.5 pb-2 border-b border-[#DDE2E6]">
            <MapPin className="w-4 h-4 text-[#FF5E00]" /> Delivery Address
          </h3>
          <p className="font-bold text-[#1C2A39]">{shippingAddress.fullName}</p>
          <p className="text-[#333333]">{shippingAddress.street}</p>
          <p className="text-[#333333]">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
          <p className="text-[#333333] font-medium">Phone: {shippingAddress.phone}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DDE2E6] text-xs space-y-2">
          <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-1.5 pb-2 border-b border-[#DDE2E6]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Payment Information
          </h3>
          <div className="flex justify-between">
            <span className="text-[#777777]">Method:</span>
            <span className="font-bold text-[#1C2A39]">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#777777]">Payment Status:</span>
            <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#777777]">Grand Total:</span>
            <span className="font-black text-[#FF5E00] text-sm">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Itemized Receipt Table */}
      <div className="bg-white rounded-3xl border border-[#DDE2E6] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#1C2A39] pb-2 border-b border-[#DDE2E6]">
          Order Items ({order.items.length})
        </h3>

        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 text-xs py-2 border-b border-[#DDE2E6] last:border-0">
              <img
                src={
                  item.product.images[0]?.url ||
                  "/images/product-placeholder.svg"
                }
                alt=""
                className="w-14 h-14 object-cover rounded-xl bg-[#F7F9FA]"
              />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-bold text-[#1C2A39] hover:text-[#FF5E00] truncate block"
                >
                  {item.title}
                </Link>
                <p className="text-[11px] text-[#777777]">
                  Seller: <span className="font-medium text-[#333333]">{item.seller.storeName}</span>
                </p>
                <p className="text-[11px] text-[#777777]">
                  SKU: <code className="font-mono">{item.sku}</code> • Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1C2A39]">{formatPrice(item.total)}</p>
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
