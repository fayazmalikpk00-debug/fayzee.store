/**
 * Backward-compatible endpoint for /api/ai/chat.
 * Seamlessly delegates to the primary /api/chat handler.
 */
export { POST, dynamic } from "../../chat/route";
