import { NextRequest, NextResponse } from "next/server";
import { analysisStore } from "@/lib/store/analysis-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    const data = analysisStore.getAnalysisWithResults(analysisId);

    if (!data) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      analysis: data.analysis,
      result: data.results || null,
    });
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    const deleted = analysisStore.deleteAnalysis(analysisId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Analysis deletion error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;
    const body = await request.json();

    const updated = analysisStore.updateAnalysis(analysisId, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // If status is being set back to pending, restart processing
    if (body.status === "pending") {
      const { AnalysisService } = await import("@/lib/services/analysis-service");
      const service = new AnalysisService();
      service.reprocessAnalysis(analysisId).catch((error) => {
        console.error("Reprocess error:", error);
      });
    }

    return NextResponse.json({
      success: true,
      analysis: updated,
    });
  } catch (error) {
    console.error("Analysis update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
