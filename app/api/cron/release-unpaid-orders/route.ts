import { NextResponse } from "next/server";
import { releaseAbandonedOnlineOrders } from "@/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const minutesParam = url.searchParams.get("minutes");
    const cutoffMinutes = minutesParam ? parseInt(minutesParam, 10) : 30;

    const result = await releaseAbandonedOnlineOrders(cutoffMinutes);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cutoffMinutes,
      ...result,
      message: `Checked abandoned checkout sessions. Released ${result.releasedOrdersCount} order(s) and restored ${result.restoredItemsCount} item(s) to inventory.`,
    });
  } catch (error: any) {
    console.error("Error in /api/cron/release-unpaid-orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to release unpaid orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
