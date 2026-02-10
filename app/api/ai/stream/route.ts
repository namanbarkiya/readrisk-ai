import { NextRequest } from "next/server";
import { getGeminiClient } from "@/lib/services/gemini-client";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get request body
    const body = await request.json();
    const { prompt = "Say 'Hello, RiskRead AI! Streaming test successful.'" } =
      body;

    // Initialize Gemini client (server-side only)
    const geminiClient = getGeminiClient();

    if (!geminiClient.isConfigured()) {
      return new Response(
        JSON.stringify({ error: "AI service is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection message
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: "connected" })}\n\n`
            )
          );

          // Stream AI response
          const aiStream = geminiClient.generateContentStream({
            prompt,
            temperature: 0.1,
          });

          for await (const chunk of aiStream) {
            const data = JSON.stringify({
              type: "content",
              content: chunk,
            });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          // Send completion message
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        } catch (error) {
          const errorData = JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          controller.enqueue(
            new TextEncoder().encode(`data: ${errorData}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("AI streaming error:", error);

    return new Response(
      JSON.stringify({
        error: "AI streaming failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
