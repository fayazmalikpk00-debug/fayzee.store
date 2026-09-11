import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { getOrderById } from "@/services/orderService";
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import InvoiceActions from "./InvoiceActions";

export const metadata = {
  title: "Commercial Tax Invoice | Fayzee Store",
  description: "Official Client Tax Invoice and Sales Receipt for your order.",
};

// Helper function to convert PKR number to English words for commercial invoices
function amountToWords(amount: number): string {
  const num = Math.round(amount);
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertGroup(n: number): string {
    if (n === 0) return "";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    return (
      a[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertGroup(n % 100) : "")
    );
  }

  let words = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  if (crore > 0) words += convertGroup(crore) + " Crore ";
  if (lakh > 0) words += convertGroup(lakh) + " Lakh ";
  if (thousand > 0) words += convertGroup(thousand) + " Thousand ";
  if (remainder > 0) words += convertGroup(remainder);

  return `Pakistani Rupees ${words.trim()} Only`;
}

export default async function OrderInvoicePage({
  params,
}: {
  params: { id: string };
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

  const latestPayment =
    order.payments && order.payments.length > 0 ? order.payments[0] : null;

  let gatewayDetails: any = null;
  if (latestPayment?.gatewayResponse) {
    try {
      gatewayDetails = JSON.parse(latestPayment.gatewayResponse);
    } catch {
      gatewayDetails = null;
    }
  }

  const invoiceNumber = `INV-FYZ-${order.orderNumber}`;
  const invoiceDate = formatDate(order.createdAt);
  const isPaid = order.paymentStatus === "PAID";
  const isCod = order.paymentMethod === "COD";

  // Unique seller list for multi-vendor attribution
  const sellerNames = Array.from(
    new Set(
      order.items
        .map((i: any) => i.seller?.storeName)
        .filter(Boolean)
    )
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0B0F14] print:bg-white print:text-black antialiased font-sans pb-16 print:pb-0">
      {/* Interactive sticky navigation bar for web viewing - automatically hidden on print */}
      <InvoiceActions orderId={order.id} orderNumber={order.orderNumber} />

      {/* Main Printable A4 Container */}
      <main className="max-w-4xl mx-auto my-6 sm:my-10 print:my-0 bg-white border border-[#E8E5DC] print:border-0 rounded-2xl print:rounded-none shadow-sm print:shadow-none p-6 sm:p-12 print:p-0 space-y-8">
        {/* Document Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-[#0B0F14] print:border-black">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#0B0F14] text-[#C8A96B] font-serif font-black flex items-center justify-center text-lg shadow-xs">
                F
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#0B0F14]">
                FAYZEE STORE
              </h1>
            </div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-[#C8A96B]">
              Luxury Multi-Vendor Marketplace
            </p>
            <div className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              <p>Fayzee Store (Pvt) Ltd. • Registered E-Commerce Enterprise</p>
              <p>Karachi / Lahore, Islamic Republic of Pakistan</p>
              <p>Email: support@fayzee.store • Web: https://fayzee.store</p>
              <p className="font-mono text-[10px] text-slate-400">
                NTN: 8941203-7 • Sales Tax Reg: STRN-3277876123456
              </p>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded-md bg-[#0B0F14] text-[#C8A96B] font-mono text-xs font-bold uppercase tracking-wider print:border print:border-black">
              TAX INVOICE / SALES RECEIPT
            </span>
            <h2 className="text-lg sm:text-xl font-mono font-black text-[#0B0F14]">
              {invoiceNumber}
            </h2>
            <p className="text-xs text-slate-500">
              Issue Date: <strong className="text-slate-800">{invoiceDate}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Order Reference:{" "}
              <strong className="text-slate-800 font-mono">#{order.orderNumber}</strong>
            </p>
            <div className="pt-1">
              {isPaid ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAYMENT STATUS: PAID</span>
                </span>
              ) : isCod ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>PAYABLE UPON DELIVERY (COD)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  <span>STATUS: {order.paymentStatus}</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Client & Shipping Details Section */}
        <section aria-label="Customer and Billing Information" className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200 text-xs">
          {/* Billed To / Client */}
          <div className="space-y-1.5 p-4 rounded-xl bg-[#FBFBFA] print:bg-transparent border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96B] block">
              Billed & Invoiced To (Client)
            </span>
            <h3 className="text-sm font-bold text-[#0B0F14]">
              {shippingAddress.fullName || order.user?.name || "Valued Client"}
            </h3>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.user?.email || "customer@fayzee.store"}</span>
            </p>
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{shippingAddress.phone || order.user?.phone || "N/A"}</span>
            </p>
          </div>

          {/* Shipped To / Delivery Destination */}
          <div className="space-y-1.5 p-4 rounded-xl bg-[#FBFBFA] print:bg-transparent border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A96B] block">
              Shipping & Delivery Destination
            </span>
            <div className="text-slate-700 leading-relaxed flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">
                  {shippingAddress.street || "Address provided at checkout"}
                </p>
                <p>
                  {[
                    shippingAddress.city,
                    shippingAddress.state,
                    shippingAddress.postalCode,
                    shippingAddress.country || "Pakistan",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            {order.trackingNumber && (
              <p className="text-slate-600 flex items-center gap-1.5 pt-1 text-[11px]">
                <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Courier: <strong>Express Courier Delivery</strong> •
                  Tracking: <strong className="font-mono">{order.trackingNumber}</strong>
                </span>
              </p>
            )}
          </div>
        </section>

        {/* Multi-Vendor / Merchant Attribution */}
        {sellerNames.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 print:bg-transparent px-3 py-2 rounded-lg border border-slate-200">
            <Store className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
            <span>
              Authorized Vendor / Store(s):{" "}
              <strong className="text-slate-800">{sellerNames.join(", ")}</strong>
            </span>
          </div>
        )}

        {/* Itemized Commercial Table */}
        <section aria-label="Itemized Products Table" className="space-y-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 print:bg-transparent text-slate-900">
                <th className="py-2.5 px-3 font-bold text-center w-10">#</th>
                <th className="py-2.5 px-3 font-bold">Item Description & Specifications</th>
                <th className="py-2.5 px-3 font-bold">Seller Store</th>
                <th className="py-2.5 px-3 font-bold text-center w-14">Qty</th>
                <th className="py-2.5 px-3 font-bold text-right w-24">Unit Price</th>
                <th className="py-2.5 px-3 font-bold text-right w-28">Total (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {order.items.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                  <td className="py-3 px-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 text-xs">
                      {item.title}
                    </div>
                    {item.sku && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        SKU: {item.sku}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {item.seller?.storeName || "Fayzee Direct"}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatPrice(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Financial Summary & Amount in Words */}
        <section aria-label="Invoice Financial Summary" className="pt-2 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-3 max-w-sm">
            <div className="p-3 rounded-lg bg-slate-50 print:bg-transparent border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Amount in Words
              </span>
              <p className="font-semibold text-slate-800 italic leading-relaxed">
                {amountToWords(order.grandTotal)}
              </p>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1 font-semibold text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>
                  Payment Method:{" "}
                  <strong className="text-slate-900">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod === "ONLINE_CARD"
                      ? "Debit / Credit Card (3D Secure)"
                      : order.paymentMethod === "SAFEPAY"
                      ? "Safepay 3D Secure Gateway"
                      : order.paymentMethod === "JAZZ_CASH"
                      ? "JazzCash Mobile Account"
                      : order.paymentMethod === "EASYPAISA"
                      ? "EasyPaisa Mobile Account"
                      : order.paymentMethod}
                  </strong>
                </span>
              </p>
              {latestPayment?.transactionId && (
                <p className="font-mono text-[10px] text-slate-600">
                  Ref / Transaction ID: <strong>{latestPayment.transactionId}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount:</span>
                <span className="font-mono">-{formatPrice(order.discountTotal)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Standard Shipping & Handling:</span>
              <span className="font-mono font-semibold text-slate-900">
                {order.shippingTotal === 0 ? "FREE" : formatPrice(order.shippingTotal)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Sales Tax (GST 0% Included):</span>
              <span className="font-mono font-semibold text-slate-900">Rs. 0</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="text-sm font-black uppercase text-slate-900 tracking-wider">
                Total Due:
              </span>
              <span className="text-lg font-black font-mono text-[#0B0F14]">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
        </section>

        {/* Verification Seals, Signature & Official Declarations */}
        <section aria-label="Official Verification and Policy" className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Left: Official Digital Seal */}
          <div className="flex items-center gap-3">
            {isPaid ? (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600 p-1 flex flex-col items-center justify-center text-center text-[8px] font-bold uppercase tracking-tighter text-emerald-700 bg-emerald-50/50 print:bg-transparent">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-0.5" />
                <span className="font-black text-[9px]">PAID & VERIFIED</span>
                <span>Fayzee Store</span>
                <span className="font-mono text-[7px] text-emerald-600">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
            ) : isCod ? (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-600 p-1 flex flex-col items-center justify-center text-center text-[8px] font-bold uppercase tracking-tighter text-amber-800 bg-amber-50/50 print:bg-transparent">
                <Truck className="w-5 h-5 text-amber-600 mb-0.5" />
                <span className="font-black text-[9px]">CASH ON DELIVERY</span>
                <span>Collect at Handover</span>
                <span className="font-mono text-[7px] text-amber-700">Official COD</span>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 p-1 flex flex-col items-center justify-center text-center text-[8px] font-bold uppercase tracking-tighter text-slate-600">
                <FileCheck2 className="w-5 h-5 text-slate-500 mb-0.5" />
                <span className="font-black text-[9px]">ORDER RECORD</span>
                <span>Fayzee Store</span>
              </div>
            )}

            <div className="text-[10px] text-slate-500 leading-snug">
              <p className="font-bold text-slate-800">Official Computer-Generated Tax Invoice</p>
              <p>Certified under Fayzee Electronic Commerce Sales Protection.</p>
              <p>Valid without manual physical signature.</p>
            </div>
          </div>

          {/* Center: QR Verification */}
          <div className="flex items-center gap-3 justify-center sm:border-x sm:border-slate-200 sm:px-4 py-2">
            <div className="w-16 h-16 bg-slate-100 p-1 rounded-lg border border-slate-300 flex items-center justify-center text-slate-800">
              <QrCode className="w-12 h-12" />
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              <p className="font-bold text-slate-800">Scan to Verify</p>
              <p>Real-time order lifecycle & genuine product verification</p>
              <p className="font-mono text-[9px] text-[#C8A96B] truncate max-w-[120px]">
                fayzee.store/orders/{order.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Right: Terms & Authorized Signatory */}
          <div className="text-right space-y-2">
            <div className="space-y-0.5 text-[10px] text-slate-500">
              <p className="font-bold text-slate-800">Customer Support & Returns</p>
              <p>7-Day Easy Return Policy for genuine defects</p>
              <p>Helpdesk: support@fayzee.store</p>
            </div>
            <div className="pt-3 border-t border-slate-300 inline-block text-center min-w-[150px]">
              <span className="font-serif italic font-bold text-xs text-slate-800 block">
                Fayzee Operations Team
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 block">
                Authorized Signatory
              </span>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100 leading-relaxed">
          <p>
            Thank you for shopping at Fayzee Store. We appreciate your valued business.
          </p>
          <p>
            © {new Date().getFullYear()} Fayzee Store (Pvt) Ltd. All rights reserved. Registered in Pakistan.
          </p>
        </footer>
      </main>
    </div>
  );
}
