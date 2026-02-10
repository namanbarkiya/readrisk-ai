import { NextRequest, NextResponse } from "next/server";
import type { AIAnalysisResponse } from "@/lib/services/ai-client";
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { documentText, analysisType, options = {} } = body;

    if (!documentText) {
      return NextResponse.json(
        { error: "Document text is required" },
        { status: 400 }
      );
    }

    if (
      !analysisType ||
      !["quick", "detailed", "extraction", "questions"].includes(analysisType)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid analysis type. Must be one of: quick, detailed, extraction, questions",
        },
        { status: 400 }
      );
    }

    // Initialize Gemini client (server-side only)
    const geminiClient = getGeminiClient();

    if (!geminiClient.isConfigured()) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 500 }
      );
    }

    let prompt: string;
    let responseFormat: string;

    // Build appropriate prompt based on analysis type
    switch (analysisType) {
      case "quick":
        prompt = `Analyze the following document and provide 5 key insights in JSON format:

Document: ${documentText}

Return exactly this JSON structure:
{
  "insights": [
    {
      "id": 1,
      "text": "insight text",
      "category": "risk|strength|weakness|opportunity",
      "confidence": 0.95
    }
  ]
}`;
        responseFormat = "insights";
        break;

      case "detailed":
        prompt = `Perform a comprehensive analysis of the document and return structured results.

Document: ${documentText}

Return exactly this JSON structure:
{
  "relevance_score": 85.5,
  "completeness_score": 90.0,
  "risk_score": 75.5,
  "clarity_score": 88.0,
  "accuracy_score": 92.5,
  "insights": [...],
  "recommendations": [...],
  "extracted_fields": [...],
  "highlights": [...],
  "questions": [...]
}`;
        responseFormat = "detailed";
        break;

      case "extraction":
        const fields = options.fields || ["title", "date", "author", "summary"];
        prompt = `Extract the following fields from the document: ${fields.join(", ")}

Document: ${documentText}

Return exactly this JSON structure:
{
  "extracted_fields": [
    {
      "name": "field_name",
      "value": "extracted_value",
      "confidence": 0.95,
      "ambiguity_notes": "optional notes"
    }
  ]
}`;
        responseFormat = "extraction";
        break;

      case "questions":
        prompt = `Generate clarification questions for unclear, misleading, or incomplete statements in the document.

Document: ${documentText}

Return exactly this JSON structure:
{
  "questions": [
    {
      "text": "question text",
      "priority": "critical|important|optional",
      "category": "clarity|completeness|accuracy|compliance",
      "suggested_action": "optional action"
    }
  ]
}`;
        responseFormat = "questions";
        break;

      default:
        return NextResponse.json(
          { error: "Invalid analysis type" },
          { status: 400 }
        );
    }

    // Generate AI response
    const response = await geminiClient.generateJSON({ prompt });

    const aiResponse: AIAnalysisResponse = {
      success: true,
      data: response,
      usage: {
        promptTokens: 0, // Gemini doesn't always provide usage in JSON mode
        completionTokens: 0,
        totalTokens: 0,
      },
    };

    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error("Document analysis error:", error);

    return NextResponse.json(
      {
        error: "Document analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
