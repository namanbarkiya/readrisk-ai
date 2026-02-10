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
    const { fileUrl, fileType } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { error: "File type is required" },
        { status: 400 }
      );
    }

    // Test PDF extraction
    if (fileType.toLowerCase() === 'pdf') {
      try {
        const result = await extractPDFFromURL(fileUrl);
        
        return NextResponse.json({
          success: true,
          extractedText: result.text.substring(0, 1000) + "...", // First 1000 chars
          metadata: result.metadata,
          textLength: result.text.length,
          wordCount: result.metadata.wordCount,
        });
      } catch (error) {
        console.error('PDF extraction test error:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    } else {
      // Test other file types
      const { extractDocumentContent } = await import('@/lib/utils/document-extractor');
      
      try {
        const result = await extractDocumentContent(fileUrl, fileType);
        
        return NextResponse.json({
          success: true,
          extractedText: result.text.substring(0, 1000) + "...", // First 1000 chars
          metadata: result.metadata,
          textLength: result.text.length,
          wordCount: result.metadata.wordCount,
        });
      } catch (error) {
        console.error('Document extraction test error:', error);
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Test extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
