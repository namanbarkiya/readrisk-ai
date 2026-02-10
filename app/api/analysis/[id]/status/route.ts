import { NextRequest, NextResponse } from "next/server";
import { analysisStore } from "@/lib/store/analysis-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    const analysis = analysisStore.getAnalysis(analysisId);

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Calculate processing time if completed
    let processingTime = null;
    if (analysis.status === "completed" || analysis.status === "failed") {
      const startTime = new Date(analysis.created_at);
      const endTime = new Date(analysis.updated_at);
      processingTime = Math.round(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
    }

    return NextResponse.json({
      success: true,
      status: analysis.status,
      overallScore: analysis.overall_score,
      riskLevel: analysis.risk_level,
      processingTime,
      createdAt: analysis.created_at,
      updatedAt: analysis.updated_at,
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analysis status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
