import { sendSupportTicketReplyEmail } from "../services/emailService";

async function testSupportTicketReply() {
  console.log("--- Testing sendSupportTicketReplyEmail ---");

  // Test 1: Simulation when RESEND_API_KEY is not configured
  delete process.env.RESEND_API_KEY;
  const simResult = await sendSupportTicketReplyEmail({
    toEmail: "h4291715@gmail.com",
    customerName: "Hacker 67",
    ticketId: "TKT-FYZ-71266193",
    subject: "ISssue",
    replyMessage: "Hello Hacker 67, we have received your issue and our team has resolved it.",
    originalMessage: "issue on the website",
  });

  console.log("Simulated Result:", simResult);
  if (simResult.success && simResult.isSimulated) {
    console.log("✅ Simulation test passed!");
  } else {
    console.error("❌ Simulation test failed");
    process.exit(1);
  }

  // Test 2: Resend API Call Contract Verification with mock fetch
  const originalFetch = global.fetch;
  let capturedBody: any = null;
  let capturedUrl = "";

  global.fetch = (async (url: any, init: any) => {
    capturedUrl = url.toString();
    capturedBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ id: "resend_reply_msg_123" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as any;

  process.env.RESEND_API_KEY = "re_mock_test_key";
  const mockResult = await sendSupportTicketReplyEmail({
    toEmail: "h4291715@gmail.com",
    customerName: "Hacker 67",
    ticketId: "TKT-FYZ-71266193",
    subject: "ISssue",
    replyMessage: "Hello Hacker 67, your issue is fixed.",
    originalMessage: "issue on the website",
  });

  global.fetch = originalFetch;

  console.log("Mock Dispatch Result:", mockResult);
  console.log("Captured URL:", capturedUrl);
  console.log("Captured Body to:", capturedBody?.to);
  console.log("Captured Body subject:", capturedBody?.subject);

  if (
    mockResult.success &&
    mockResult.messageId === "resend_reply_msg_123" &&
    capturedUrl === "https://api.resend.com/emails" &&
    capturedBody?.to?.[0] === "h4291715@gmail.com"
  ) {
    console.log("✅ Resend Mock Dispatch test passed!");
  } else {
    console.error("❌ Resend Mock Dispatch test failed");
    process.exit(1);
  }

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
}

testSupportTicketReply().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
