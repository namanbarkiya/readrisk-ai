import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/services/gemini-client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using server-side client
    // The server client automatically handles cookies
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { prompt = "Say 'Hello, RiskRead AI! Phase 1 test successful.'" } =
      body;

    // Initialize Gemini client (server-side only)
    const geminiClient = getGeminiClient();

    if (!geminiClient.isConfigured()) {
      return NextResponse.json(
        { error: "Gemini AI is not configured" },
        { status: 500 }
      );
    }

    // Generate content
    const response = await geminiClient.generateContent({
      prompt,
      temperature: 0.1,
    });

    return NextResponse.json({
      success: true,
      content: response.content,
      usage: response.usage,
      finishReason: response.finishReason,
    });
  } catch (error) {
    console.error("Gemini AI test error:", error);

    return NextResponse.json(
      {
        error: "Gemini AI test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
