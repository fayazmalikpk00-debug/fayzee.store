import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CourierService } from "@/services/courierService";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const config = await CourierService.getConfig();

    // Mask sensitive tokens for safety
    const safeConfig = {
      ...config,
      postexApiToken: config.postexApiToken ? `${config.postexApiToken.slice(0, 8)}...` : "",
      traxApiKey: config.traxApiKey ? `${config.traxApiKey.slice(0, 8)}...` : "",
      tcsPassword: config.tcsPassword ? "********" : "",
    };

    return NextResponse.json({ config: safeConfig });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const existing = await CourierService.getConfig();

    // Don't overwrite with masked string if unchanged
    const postexApiToken =
      body.postexApiToken && !body.postexApiToken.includes("...")
        ? body.postexApiToken
        : existing.postexApiToken;

    const traxApiKey =
      body.traxApiKey && !body.traxApiKey.includes("...")
        ? body.traxApiKey
        : existing.traxApiKey;

    const tcsPassword =
      body.tcsPassword && body.tcsPassword !== "********"
        ? body.tcsPassword
        : existing.tcsPassword;

    const updated = await CourierService.saveConfig({
      activeProvider: body.activeProvider || "POSTEX",
      isSandbox: Boolean(body.isSandbox),
      postexApiToken,
      traxApiKey,
      tcsUsername: body.tcsUsername !== undefined ? body.tcsUsername : existing.tcsUsername,
      tcsPassword,
      tcsCostCenterCode: body.tcsCostCenterCode !== undefined ? body.tcsCostCenterCode : existing.tcsCostCenterCode,
      defaultPickupCity: body.defaultPickupCity || "Karachi",
    });

    // Mask sensitive tokens in response as well
    const safeUpdated = {
      ...updated,
      postexApiToken: updated.postexApiToken ? `${updated.postexApiToken.slice(0, 8)}...` : "",
      traxApiKey: updated.traxApiKey ? `${updated.traxApiKey.slice(0, 8)}...` : "",
      tcsPassword: updated.tcsPassword ? "********" : "",
    };

    return NextResponse.json({
      message: "Courier configuration updated successfully.",
      config: safeUpdated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
