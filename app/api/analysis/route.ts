import { NextRequest, NextResponse } from "next/server";
import { AnalysisService } from "@/lib/services/analysis-service";
import { analysisStore } from "@/lib/store/analysis-store";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { file_url, file_name, file_type, file_size } = body;

    // Validate required fields
    if (!file_url || !file_name || !file_type || !file_size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create analysis using service
    const analysisService = new AnalysisService();
    const result = await analysisService.createAnalysis({
      fileUrl: file_url,
      fileName: file_name,
      fileType: file_type,
      fileSize: file_size,
      userId: "anonymous",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create analysis" },
        { status: 500 }
      );
    }

    // Return the full analysis object
    const analysis = analysisStore.getAnalysis(result.analysisId!);
    
    return NextResponse.json({
      success: true,
      analysisId: result.analysisId,
      id: result.analysisId,
      ...analysis,
    });
  } catch (error) {
    console.error("Analysis creation error:", error);
    return NextResponse.json(
      {
        error: "Analysis creation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || undefined;

    const { analyses, total } = analysisStore.listAnalyses({
      limit,
      offset,
      status,
    });

    return NextResponse.json({
      success: true,
      analyses,
      total,
      pagination: {
        limit,
        offset,
        hasMore: analyses.length === limit,
      },
    });
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analyses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
