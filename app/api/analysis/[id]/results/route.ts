import { NextRequest, NextResponse } from "next/server";
import { analysisStore } from "@/lib/store/analysis-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    const result = analysisStore.getResult(analysisId);

    if (!result) {
      return NextResponse.json(
        { error: "Analysis results not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis results fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analysis results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
