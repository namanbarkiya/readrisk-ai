import { analysisStore } from "@/lib/store/analysis-store";
import { Analysis, AnalysisResult } from "@/lib/types/analysis";
import { getGeminiClient } from "./gemini-client";

export interface AnalysisRequest {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysisId?: string;
  error?: string;
}

export interface DocumentContent {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    language?: string;
    title?: string;
    author?: string;
    subject?: string;
  };
}

export class AnalysisService {
  private geminiClient = getGeminiClient();

  /**
   * Create a new analysis
   */
  async createAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // Create analysis record in store
      const analysis = analysisStore.createAnalysis({
        file_name: request.fileName,
        file_type: request.fileType,
        file_size: request.fileSize,
        file_url: request.fileUrl,
      });

      // Start processing in background
      this.processAnalysis(analysis.id).catch((error) => {
        console.error("Background processing error:", error);
      });

      return {
        success: true,
        analysisId: analysis.id,
      };
    } catch (error) {
      console.error("Analysis creation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Reprocess an existing analysis
   */
  async reprocessAnalysis(analysisId: string): Promise<void> {
    await this.processAnalysis(analysisId);
  }

  /**
   * Process analysis in background
   */
  private async processAnalysis(analysisId: string): Promise<void> {
    try {
      console.log(
        "🚀 [ANALYSIS SERVICE] Starting analysis processing for ID:",
        analysisId
      );

      // Update status to processing
      analysisStore.updateAnalysis(analysisId, { status: "processing" });

      console.log("🔄 [ANALYSIS SERVICE] Status updated to processing");

      // Get analysis details
      const analysis = analysisStore.getAnalysis(analysisId);

      if (!analysis) {
        throw new Error("Failed to fetch analysis details");
      }

      console.log("📋 [ANALYSIS SERVICE] Analysis details retrieved:", {
        id: analysis.id,
        fileName: analysis.file_name,
        fileType: analysis.file_type,
        fileUrl: analysis.file_url,
        fileSize: analysis.file_size,
      });

      // Extract document content
      console.log(
        "📄 [ANALYSIS SERVICE] Starting document content extraction..."
      );
      const content = await this.extractDocumentContent(
        analysis.file_url,
        analysis.file_type
      );

      console.log(
        "✅ [ANALYSIS SERVICE] Document content extraction completed"
      );
      console.log("📊 [ANALYSIS SERVICE] Content summary:", {
        textLength: content.text.length,
        wordCount: content.metadata.wordCount,
        pageCount: content.metadata.pageCount,
        language: content.metadata.language,
      });

      // Analyze with Gemini AI
      console.log("🤖 [ANALYSIS SERVICE] Starting AI analysis...");
      const analysisResult = await this.analyzeWithAI(
        content.text,
        analysis.file_name
      );

      // Calculate scores
      console.log("📊 [ANALYSIS SERVICE] Calculating scores...");
      const scores = this.calculateScores(analysisResult);
      console.log("📊 [ANALYSIS SERVICE] Calculated scores:", scores);

      // Save analysis results
      console.log("💾 [ANALYSIS SERVICE] Saving analysis results...");
      analysisStore.createResult(analysisId, {
        relevance_score: scores.relevance,
        completeness_score: scores.completeness,
        risk_score: scores.risk,
        clarity_score: scores.clarity,
        accuracy_score: scores.accuracy,
        insights: analysisResult.insights || [],
        recommendations: analysisResult.recommendations || [],
        extracted_fields: analysisResult.extracted_fields || [],
        highlights: analysisResult.highlights || [],
        questions: analysisResult.questions || [],
        raw_ai_response: null,
      });

      // Update analysis with scores and status
      console.log("💾 [ANALYSIS SERVICE] Updating analysis status...");
      const overallScore = this.calculateOverallScore(scores);
      const riskLevel = this.determineRiskLevel(scores.risk);

      console.log("📊 [ANALYSIS SERVICE] Final scores:", {
        overallScore,
        riskLevel,
        individualScores: scores,
      });

      analysisStore.updateAnalysis(analysisId, {
        status: "completed",
        overall_score: overallScore,
        risk_level: riskLevel,
      });

      console.log("✅ [ANALYSIS SERVICE] Analysis completed successfully!");

      // Auto-delete the uploaded file — no longer needed
      await this.deleteUploadedFile(analysis.file_url);
    } catch (error) {
      console.error("❌ [ANALYSIS SERVICE] Processing error:", error);

      // Update status to failed
      analysisStore.updateAnalysis(analysisId, { status: "failed" });

      // Also delete file on failure
      const failedAnalysis = analysisStore.getAnalysis(analysisId);
      if (failedAnalysis?.file_url) {
        await this.deleteUploadedFile(failedAnalysis.file_url);
      }

      console.log("❌ [ANALYSIS SERVICE] Analysis marked as failed");
    }
  }

  /**
   * Delete the uploaded file after analysis is done.
   *
   * - Local development: files are stored under `public/uploads` on disk.
   * - Production (Vercel): files are stored in Vercel Blob and addressed by full HTTPS URL.
   */
  private async deleteUploadedFile(fileUrl: string): Promise<void> {
    try {
      // Local filesystem cleanup (development)
      if (fileUrl.startsWith("/uploads/")) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const filePath = path.join(process.cwd(), "public", fileUrl);

        await fs.unlink(filePath);
        console.log("🗑️ [ANALYSIS SERVICE] Deleted local uploaded file:", fileUrl);
        return;
      }

      // Vercel Blob cleanup (production): delete by URL
      if (fileUrl.startsWith("http")) {
        const { del } = await import("@vercel/blob");
        await del(fileUrl);
        console.log("🗑️ [ANALYSIS SERVICE] Deleted blob file:", fileUrl);
      }
    } catch (error) {
      // File might already be gone — that's fine
      console.warn(
        "⚠️ [ANALYSIS SERVICE] Could not delete file:",
        fileUrl,
        error
      );
    }
  }

  /**
   * Extract text content from document
   */
  private async extractDocumentContent(
    fileUrl: string,
    fileType: string
  ): Promise<DocumentContent> {
    try {
      console.log("🔍 [ANALYSIS SERVICE] Starting document extraction...");
      console.log("🔍 [ANALYSIS SERVICE] File URL:", fileUrl);
      console.log("🔍 [ANALYSIS SERVICE] File Type:", fileType);

      // For local files, construct absolute URL for the document extractor
      let absoluteUrl = fileUrl;
      if (fileUrl.startsWith("/")) {
        const port = process.env.PORT || "3000";
        absoluteUrl = `http://localhost:${port}${fileUrl}`;
      }

      // Use the comprehensive document extractor
      const { extractDocumentContent: extractContent } = await import(
        "@/lib/utils/document-extractor"
      );
      const result = await extractContent(absoluteUrl, fileType);

      console.log("✅ [ANALYSIS SERVICE] Document extraction completed");

      return {
        text: result.text,
        metadata: {
          pageCount: result.metadata.pageCount,
          wordCount: result.metadata.wordCount,
          language: result.metadata.language || "en",
          title: result.metadata.title,
          author: result.metadata.author,
          subject: result.metadata.subject,
        },
      };
    } catch (error) {
      console.error("❌ [ANALYSIS SERVICE] Document extraction error:", error);
      throw new Error(
        `Failed to extract content from document: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Analyze document with Gemini AI
   */
  private async analyzeWithAI(content: string, fileName: string): Promise<any> {
    console.log("🤖 [ANALYSIS SERVICE] Starting AI analysis...");
    console.log("🤖 [ANALYSIS SERVICE] File name:", fileName);
    console.log("🤖 [ANALYSIS SERVICE] Content length:", content.length);

    if (!this.geminiClient.isConfigured()) {
      throw new Error("Gemini AI is not configured");
    }

    const prompt = `
      Analyze the following document content and provide a comprehensive risk assessment.
      
      Document: ${fileName}
      Content: ${content}
      
      Please provide your analysis in the following JSON format:
      {
        "insights": [
          {
            "id": 1,
            "text": "Detailed insight description combining title and description",
            "category": "risk|strength|weakness|opportunity",
            "severity": "high|medium|low",
            "confidence": 0.85
          }
        ],
        "recommendations": [
          {
            "id": 1,
            "text": "Detailed recommendation description",
            "priority": "high|medium|low",
            "category": "legal|financial|operational|compliance"
          }
        ],
        "extracted_fields": [
          {
            "name": "field_name",
            "value": "extracted_value",
            "confidence": 0.9
          }
        ],
        "highlights": [
          {
            "text": "highlighted text",
            "reason": "Why this text is highlighted",
            "category": "important|risky|unclear",
            "start_position": 0,
            "end_position": 10
          }
        ],
        "questions": [
          {
            "text": "Generated question",
            "priority": "critical|important|optional",
            "category": "clarity|completeness|accuracy|compliance",
            "suggested_action": "What action should be taken"
          }
        ]
      }
    `;

    const response = await this.geminiClient.generateContent({
      prompt,
      temperature: 0.1,
    });

    try {
      console.log("🤖 [ANALYSIS SERVICE] Processing AI response...");

      // Extract JSON content from the response
      let responseContent = response.content;

      // Find the first occurrence of { and last occurrence of }
      const startIndex = responseContent.indexOf("{");
      const endIndex = responseContent.lastIndexOf("}");

      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        throw new Error("No valid JSON object found in response");
      }

      responseContent = responseContent.substring(startIndex, endIndex + 1);

      const parsedResult = JSON.parse(responseContent);
      console.log("🤖 [ANALYSIS SERVICE] Successfully parsed JSON result");

      return parsedResult;
    } catch (error) {
      console.error(
        "❌ [ANALYSIS SERVICE] Failed to parse AI response:",
        error
      );
      throw new Error("Failed to parse AI analysis response");
    }
  }

  /**
   * Calculate individual scores
   */
  private calculateScores(analysisResult: any) {
    return {
      relevance: this.calculateRelevanceScore(analysisResult),
      completeness: this.calculateCompletenessScore(analysisResult),
      risk: this.calculateRiskScore(analysisResult),
      clarity: this.calculateClarityScore(analysisResult),
      accuracy: this.calculateAccuracyScore(analysisResult),
    };
  }

  private calculateRelevanceScore(result: any): number {
    const insightCount = result.insights?.length || 0;
    const fieldCount = result.extracted_fields?.length || 0;
    return Math.min(100, insightCount * 10 + fieldCount * 5);
  }

  private calculateCompletenessScore(result: any): number {
    const categories = new Set(
      result.insights?.map((i: any) => i.category) || []
    );
    return Math.min(100, categories.size * 20);
  }

  private calculateRiskScore(result: any): number {
    const riskInsights =
      result.insights?.filter((i: any) => i.category === "risk") || [];

    const highRiskCount = riskInsights.filter(
      (i: any) => i.severity === "high" || (i.confidence && i.confidence > 0.8)
    ).length;

    const mediumRiskCount = riskInsights.filter(
      (i: any) =>
        i.severity === "medium" ||
        (i.confidence && i.confidence > 0.5 && i.confidence <= 0.8)
    ).length;

    const lowRiskCount = riskInsights.filter(
      (i: any) => i.severity === "low" || (i.confidence && i.confidence <= 0.5)
    ).length;

    return Math.min(
      100,
      highRiskCount * 30 + mediumRiskCount * 15 + lowRiskCount * 5
    );
  }

  private calculateClarityScore(result: any): number {
    const questionCount = result.questions?.length || 0;
    return Math.max(0, 100 - questionCount * 10);
  }

  private calculateAccuracyScore(result: any): number {
    const insights = result.insights || [];
    const fields = result.extracted_fields || [];

    const avgInsightConfidence =
      insights.length > 0
        ? insights.reduce(
            (sum: number, i: any) => sum + (i.confidence || 0),
            0
          ) / insights.length
        : 0;

    const avgFieldConfidence =
      fields.length > 0
        ? fields.reduce((sum: number, f: any) => sum + (f.confidence || 0), 0) /
          fields.length
        : 0;

    return Math.round((avgInsightConfidence + avgFieldConfidence) * 50);
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(scores: any): number {
    const weights = {
      relevance: 0.25,
      completeness: 0.2,
      risk: 0.25,
      clarity: 0.15,
      accuracy: 0.15,
    };

    return Math.round(
      scores.relevance * weights.relevance +
        scores.completeness * weights.completeness +
        scores.risk * weights.risk +
        scores.clarity * weights.clarity +
        scores.accuracy * weights.accuracy
    );
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(riskScore: number): "low" | "medium" | "high" {
    if (riskScore < 30) return "low";
    if (riskScore < 70) return "medium";
    return "high";
  }

  /**
   * Get analysis by ID
   */
  async getAnalysis(analysisId: string): Promise<Analysis | null> {
    return analysisStore.getAnalysis(analysisId);
  }

  /**
   * Get analysis with results
   */
  async getAnalysisWithResults(
    analysisId: string
  ): Promise<{ analysis: Analysis; results: AnalysisResult | null } | null> {
    return analysisStore.getAnalysisWithResults(analysisId);
  }
}
