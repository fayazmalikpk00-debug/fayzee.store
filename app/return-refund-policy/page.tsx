import { RotateCcw, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Truck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cancellation, Return & Refund Policy | Fayzee Store",
  description: "Official Return, Refund, and Cancellation Policy for orders placed on Fayzee Store.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0B0F14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E8E5DC] p-6 sm:p-12 shadow-sm space-y-8">
        {/* Header */}
        <div className="border-b border-[#E8E5DC] pb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-[#C8A96B]" />
            <span>Buyer Protection Guarantee</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B0F14] tracking-tight">
            Cancellation, Return & Refund Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Fayzee Store (Pvt) Ltd.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C8A96B]" />
              <span>1. Order Cancellation Policy</span>
            </h2>
            <p>
              At <strong>Fayzee Store</strong>, customers have the freedom to cancel their order at zero cost under the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Prior to Dispatch:</strong> Customers can cancel any order directly from their account dashboard or by contacting customer support before the parcel is dispatched by the seller/courier.</li>
              <li><strong>Refund for Cancelled Pre-paid Orders:</strong> If an order paid via Debit/Credit Card, Safepay, or Mobile Wallet is cancelled before dispatch, a 100% full refund is automatically reversed to the original payment source within <strong>3 to 5 business days</strong>.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
              <span>2. 7-Day Easy Return Policy</span>
            </h2>
            <p>
              We stand behind the quality of every product sold on our platform. You are eligible to initiate a return within <strong>7 days of delivery</strong> under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The item received is physically damaged, broken, or defective upon arrival.</li>
              <li>The item is materially different from the product catalog description or specifications (wrong color, wrong size, or incorrect model).</li>
              <li>Missing parts or accessories that were specified in the order description.</li>
            </ul>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Return Condition Requirements:</span>
              </p>
              <p>Items must be in original, unwashed, and unused condition with all original brand tags, warranty cards, manuals, and original packaging intact.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C8A96B]" />
              <span>3. Return Process & Pickup</span>
            </h2>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Log in to your account and navigate to <strong>My Orders</strong> (<Link href="/orders" className="text-[#C8A96B] underline font-semibold">https://fayzee.store/orders</Link>).</li>
              <li>Select the delivered order and click <strong>"Request Return / Refund"</strong> or email us at <strong>itsfayzeepk00@gmail.com</strong> with photos of the damaged/incorrect item.</li>
              <li>Our logistics courier partner will arrange doorstep return parcel pickup within 2 to 3 working days.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
              <span>4. Refund Processing Timeline & Methods</span>
            </h2>
            <p>
              Once the returned item is inspected and verified at our fulfillment center, the refund is approved immediately:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Card & Online Payments (Safepay):</strong> Reversed back to your original bank account or card within <strong>5 to 7 banking days</strong> (depending on your issuing bank).</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Reimbursed via instant direct bank transfer (IBFT) or EasyPaisa/JazzCash account according to customer preference.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14]">5. Contact Customer Support</h2>
            <p>For immediate help with any return or refund inquiry, contact us:</p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-mono">
              <p><strong>Support Email:</strong> itsfayzeepk00@gmail.com</p>
              <p><strong>Direct Helpline:</strong> itsfayzeepk00@gmail.com</p>
              <p><strong>Physical Address:</strong> Near Umar Pharmacy, Dalazak Road, Peshawar, KP, Pakistan</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
