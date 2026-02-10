// =====================================================
// AI CLIENT (CLIENT-SIDE)
// =====================================================
// Client-side service for communicating with server-side AI APIs
// This file is safe to use on the client side
// =====================================================

// =====================================================
// CLIENT-SIDE INTERFACES
// =====================================================

export interface AITestRequest {
  prompt?: string;
}

export interface AITestResponse {
  success: boolean;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface AIAnalysisRequest {
  documentText: string;
  analysisType: "quick" | "detailed" | "extraction" | "questions";
  options?: Record<string, unknown>;
}

export interface AIAnalysisResponse {
  success: boolean;
  data: Record<string, unknown>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIError {
  error: string;
  details?: string;
}

// =====================================================
// CLIENT-SIDE AI SERVICE
// =====================================================

export class AIClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  // =====================================================
  // TEST METHODS
  // =====================================================

  /**
   * Test AI functionality
   */
  async testAI(request: AITestRequest = {}): Promise<AITestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as AITestResponse;
    } catch (error) {
      throw new Error(
        `AI test failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // =====================================================
  // ANALYSIS METHODS
  // =====================================================

  /**
   * Analyze document text
   */
  async analyzeDocument(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as AIAnalysisResponse;
    } catch (error) {
      throw new Error(
        `Document analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get quick insights from document
   */
  async getQuickInsights(documentText: string): Promise<AIAnalysisResponse> {
    return this.analyzeDocument({
      documentText,
      analysisType: "quick",
    });
  }

  /**
   * Get detailed analysis from document
   */
  async getDetailedAnalysis(documentText: string): Promise<AIAnalysisResponse> {
    return this.analyzeDocument({
      documentText,
      analysisType: "detailed",
    });
  }

  /**
   * Extract fields from document
   */
  async extractFields(
    documentText: string,
    fields: string[]
  ): Promise<AIAnalysisResponse> {
    return this.analyzeDocument({
      documentText,
      analysisType: "extraction",
      options: { fields },
    });
  }

  /**
   * Generate questions from document
   */
  async generateQuestions(documentText: string): Promise<AIAnalysisResponse> {
    return this.analyzeDocument({
      documentText,
      analysisType: "questions",
    });
  }

  // =====================================================
  // STREAMING METHODS
  // =====================================================

  /**
   * Stream AI response
   */
  async *streamAIResponse(request: AITestRequest): AsyncGenerator<string> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch (e) {
              // Ignore parsing errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      throw new Error(
        `AI streaming failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if AI service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.testAI({ prompt: "test" });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    available: boolean;
    configured: boolean;
    error?: string;
  }> {
    try {
      await this.testAI({ prompt: "test" });
      return {
        available: true,
        configured: true,
      };
    } catch (error) {
      return {
        available: false,
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let aiClientInstance: AIClient | null = null;

export function getAIClient(): AIClient {
  if (!aiClientInstance) {
    aiClientInstance = new AIClient();
  }
  return aiClientInstance;
}

export function resetAIClient(): void {
  aiClientInstance = null;
}

// =====================================================
// EXPORT DEFAULT INSTANCE
// =====================================================

export default getAIClient();
