// =====================================================
// GEMINI AI CLIENT CONFIGURATION (SERVER-SIDE ONLY)
// =====================================================
// Google Gemini AI integration for document analysis
// This file should only be used on the server side
// =====================================================
import { GoogleGenerativeAI } from "@google/generative-ai";

// =====================================================
// CONFIGURATION INTERFACES
// =====================================================

export interface GeminiConfig {
  apiKey: string;
  model: string; // Default: 'gemini-1.5-pro'
  maxTokens: number; // Default: 8192
  temperature: number; // Default: 0.1
  timeout: number; // Default: 30000ms
}

export interface GeminiRequest {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface GeminiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// =====================================================
// DEFAULT CONFIGURATION
// =====================================================

const DEFAULT_CONFIG: GeminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  maxTokens: 8192,
  temperature: 0.1,
  timeout: 30000,
};

// =====================================================
// GEMINI CLIENT CLASS
// =====================================================

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;
  private model: any;

  constructor(config: Partial<GeminiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }

    // Ensure this is only used on the server side
    if (typeof window !== "undefined") {
      throw new Error("GeminiClient can only be used on the server side");
    }

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      },
    });
  }

  // =====================================================
  // MAIN GENERATION METHOD
  // =====================================================

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      console.log("🤖 [GEMINI CLIENT] Starting content generation...");
      console.log(
        "🤖 [GEMINI CLIENT] Request temperature:",
        request.temperature
      );
      console.log("🤖 [GEMINI CLIENT] Request maxTokens:", request.maxTokens);

      const { prompt, context, systemPrompt, temperature, maxTokens } = request;

      // Build the full prompt
      let fullPrompt = prompt;
      if (context) {
        fullPrompt = `Context: ${context}\n\n${prompt}`;
      }

      console.log("🤖 [GEMINI CLIENT] Full prompt length:", fullPrompt.length);
      console.log(
        "🤖 [GEMINI CLIENT] Full prompt preview (first 500 chars):",
        fullPrompt.substring(0, 500)
      );
      console.log(
        "🤖 [GEMINI CLIENT] Full prompt preview (last 500 chars):",
        fullPrompt.substring(Math.max(0, fullPrompt.length - 500))
      );

      // Create generation config
      const generationConfig: any = {};
      if (temperature !== undefined) {
        generationConfig.temperature = temperature;
      }
      if (maxTokens !== undefined) {
        generationConfig.maxOutputTokens = maxTokens;
      }

      // Generate content
      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig,
      });

      const response = await result.response;
      const text = response.text();

      console.log("🤖 [GEMINI CLIENT] Response received successfully");
      console.log("🤖 [GEMINI CLIENT] Response text length:", text.length);
      console.log(
        "🤖 [GEMINI CLIENT] Response text preview (first 500 chars):",
        text.substring(0, 500)
      );
      console.log(
        "🤖 [GEMINI CLIENT] Response text preview (last 500 chars):",
        text.substring(Math.max(0, text.length - 500))
      );

      // Get usage statistics
      const usage = {
        promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
        completionTokens:
          result.response.usageMetadata?.completionTokenCount || 0,
        totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
      };

      console.log("🤖 [GEMINI CLIENT] Usage statistics:", usage);

      return {
        content: text,
        usage,
        finishReason: result.response.candidates?.[0]?.finishReason || "STOP",
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // STREAMING GENERATION METHOD
  // =====================================================

  async *generateContentStream(request: GeminiRequest): AsyncGenerator<string> {
    try {
      const { prompt, context, systemPrompt, temperature, maxTokens } = request;

      // Build the full prompt
      let fullPrompt = prompt;
      if (context) {
        fullPrompt = `Context: ${context}\n\n${prompt}`;
      }

      // Create generation config
      const generationConfig: any = {};
      if (temperature !== undefined) {
        generationConfig.temperature = temperature;
      }
      if (maxTokens !== undefined) {
        generationConfig.maxOutputTokens = maxTokens;
      }

      // Generate content stream
      const result = await this.model.generateContentStream({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig,
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // JSON GENERATION METHOD
  // =====================================================

  async generateJSON<T = Record<string, unknown>>(
    request: GeminiRequest
  ): Promise<T> {
    try {
      // Add JSON formatting instruction to the prompt
      const jsonRequest: GeminiRequest = {
        ...request,
        prompt: `${request.prompt}\n\nIMPORTANT: Respond with valid JSON only. Do not include any other text, markdown formatting, or explanations.`,
      };

      const response = await this.generateContent(jsonRequest);

      // Try to parse JSON from the response
      try {
        const jsonContent = response.content.trim();
        return JSON.parse(jsonContent) as T;
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =====================================================
  // ERROR HANDLING
  // =====================================================

  private handleError(error: unknown): GeminiError {
    if (error instanceof Error) {
      // Handle specific Gemini API errors
      if (error.message.includes("API_KEY_INVALID")) {
        return {
          code: "API_KEY_INVALID",
          message: "Invalid Gemini API key",
        };
      }

      if (error.message.includes("QUOTA_EXCEEDED")) {
        return {
          code: "QUOTA_EXCEEDED",
          message: "API quota exceeded",
        };
      }

      if (error.message.includes("RATE_LIMIT")) {
        return {
          code: "RATE_LIMITED",
          message: "Rate limit exceeded",
        };
      }

      return {
        code: "UNKNOWN_ERROR",
        message: error.message,
        details: { originalError: error },
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
      details: { originalError: error },
    };
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * Get current configuration
   */
  getConfig(): GeminiConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Reinitialize the model if model or generation config changed
    if (newConfig.model || newConfig.maxTokens || newConfig.temperature) {
      this.model = this.genAI.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          maxOutputTokens: this.config.maxTokens,
          temperature: this.config.temperature,
        },
      });
    }
  }
}

// =====================================================
// SINGLETON INSTANCE (SERVER-SIDE ONLY)
// =====================================================

let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(config?: Partial<GeminiConfig>): GeminiClient {
  // Ensure this is only called on the server side
  if (typeof window !== "undefined") {
    throw new Error("getGeminiClient can only be called on the server side");
  }

  if (!geminiClientInstance) {
    geminiClientInstance = new GeminiClient(config);
  }
  return geminiClientInstance;
}

export function resetGeminiClient(): void {
  geminiClientInstance = null;
}

// =====================================================
// EXPORT DEFAULT INSTANCE (SERVER-SIDE ONLY)
// =====================================================

// Note: This should only be imported on the server side
// The default export is available but should be used carefully
