/**
 * Backward-compatible endpoint for /api/ai/chat.
 * Seamlessly delegates to the primary /api/chat handler.
 */
import { POST as chatPOST } from "../../chat/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return chatPOST(req);
}
