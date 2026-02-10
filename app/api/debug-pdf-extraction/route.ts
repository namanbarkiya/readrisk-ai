import { NextRequest, NextResponse } from "next/server";
import { extractPDFFromURL } from "@/lib/utils/pdf-extractor";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    console.log("🔍 [DEBUG] Testing PDF extraction for URL:", fileUrl);

    try {
      const result = await extractPDFFromURL(fileUrl);

      console.log("✅ [DEBUG] PDF extraction successful");

      return NextResponse.json({
        success: true,
        extractedText: result.text.substring(0, 2000) + "...", // First 2000 chars
        metadata: result.metadata,
        textLength: result.text.length,
        wordCount: result.metadata.wordCount,
        sampleText: result.text.substring(0, 500), // Sample for debugging
      });
    } catch (error) {
      console.error("❌ [DEBUG] PDF extraction failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ [DEBUG] Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
