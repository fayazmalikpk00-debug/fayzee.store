import { POST as handleReplyPost } from "../route";

export async function POST(req: Request) {
  return handleReplyPost(req);
}
