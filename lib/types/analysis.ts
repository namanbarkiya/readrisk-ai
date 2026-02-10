// =====================================================
// ANALYSIS TYPES FOR RISKREAD AI
// =====================================================
// TypeScript definitions for analysis-related data structures
// =====================================================

// =====================================================
// CORE ANALYSIS TYPES
// =====================================================

export interface Analysis {
  id: string;
  user_id: string;
  file_name: string;
  file_type: "pdf" | "docx" | "xlsx";
  file_size: number;
  file_url: string;
  status: "pending" | "processing" | "completed" | "failed";
  overall_score: number | null;
  risk_level: "low" | "medium" | "high" | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  analysis_id: string;
  relevance_score: number;
  completeness_score: number;
  risk_score: number;
  clarity_score: number;
  accuracy_score: number;
  insights: Insight[];
  recommendations: Recommendation[];
  extracted_fields: ExtractedField[];
  highlights: Highlight[];
  questions: Question[];
  raw_ai_response: Record<string, unknown> | null;
  created_at: string;
}

export interface AnalysisHistory {
  id: string;
  analysis_id: string;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  performed_by: string | null;
  created_at: string;
}

// =====================================================
// ANALYSIS COMPONENT TYPES
// =====================================================

export interface Insight {
  id: number;
  text: string;
  category?: "risk" | "strength" | "weakness" | "opportunity";
  confidence?: number;
}

export interface Recommendation {
  id: number;
  text: string;
  priority: "high" | "medium" | "low";
  category: "legal" | "financial" | "operational" | "compliance";
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  ambiguity_notes?: string;
  page_number?: number;
}

export interface Highlight {
  text: string;
  reason: string;
  category: "important" | "risky" | "unclear";
  page_number?: number;
  start_position?: number;
  end_position?: number;
}

export interface Question {
  text: string;
  priority: "critical" | "important" | "optional";
  category: "clarity" | "completeness" | "accuracy" | "compliance";
  suggested_action?: string;
}

// =====================================================
// INPUT/OUTPUT TYPES
// =====================================================

export interface CreateAnalysisInput {
  file_name: string;
  file_type: "pdf" | "docx" | "xlsx";
  file_size: number;
  file_url: string;
}

export interface UpdateAnalysisInput {
  status?: "pending" | "processing" | "completed" | "failed";
  overall_score?: number;
  risk_level?: "low" | "medium" | "high";
  processing_started_at?: string;
  processing_completed_at?: string;
}

export interface CreateAnalysisResultInput {
  analysis_id: string;
  relevance_score: number;
  completeness_score: number;
  risk_score: number;
  clarity_score: number;
  accuracy_score: number;
  insights: Insight[];
  recommendations: Recommendation[];
  extracted_fields: ExtractedField[];
  highlights: Highlight[];
  questions: Question[];
  raw_ai_response?: Record<string, unknown>;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface AnalysisListResponse {
  analyses: Analysis[];
  total: number;
  page: number;
  limit: number;
}

export interface AnalysisWithResults {
  analysis: Analysis;
  result: AnalysisResult | null;
}

export interface AnalysisStatusResponse {
  status: string;
  progress?: number;
  estimated_time?: number;
}

// =====================================================
// FILTER AND QUERY TYPES
// =====================================================

export interface AnalysisFilters {
  status?: string;
  risk_level?: string;
  date_from?: string;
  date_to?: string;
  file_type?: string;
}

export interface AnalysisQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  risk_level?: string;
  sort_by?: "created_at" | "file_name" | "overall_score";
  sort_order?: "asc" | "desc";
}

// =====================================================
// SCORING TYPES
// =====================================================

export interface ScoringWeights {
  relevance: number; // 0.25
  completeness: number; // 0.25
  risk: number; // 0.20
  clarity: number; // 0.15
  accuracy: number; // 0.15
}

export interface ScoringResult {
  relevance_score: number;
  completeness_score: number;
  risk_score: number;
  clarity_score: number;
  accuracy_score: number;
  overall_score: number;
  risk_level: "low" | "medium" | "high";
}

export interface RiskPattern {
  pattern: string;
  weight: number;
  category: "high" | "medium" | "low";
  description: string;
}

// =====================================================
// FILE UPLOAD TYPES
// =====================================================

export interface FileUploadConfig {
  maxFileSize: number; // in bytes
  supportedTypes: string[];
  allowedMimeTypes: string[];
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResult {
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
}

// =====================================================
// AI RESPONSE TYPES
// =====================================================

export interface AIAnalysisResponse {
  relevance_score: number;
  completeness_score: number;
  risk_score: number;
  clarity_score: number;
  accuracy_score: number;
  insights: Insight[];
  recommendations: Recommendation[];
  extracted_fields: ExtractedField[];
  highlights: Highlight[];
  questions: Question[];
}

export interface AIQuickInsightsResponse {
  insights: Insight[];
}

export interface AIQuestionsResponse {
  critical: string[];
  important: string[];
  optional: string[];
}

// =====================================================
// ERROR TYPES
// =====================================================

export enum AnalysisErrorType {
  FILE_UPLOAD_FAILED = "FILE_UPLOAD_FAILED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",
  ANALYSIS_FAILED = "ANALYSIS_FAILED",
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  DATABASE_ERROR = "DATABASE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMITED = "RATE_LIMITED",
}

export interface AnalysisError {
  type: AnalysisErrorType;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  analysisId?: string;
}

// =====================================================
// CONSTANTS
// =====================================================

export const ANALYSIS_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const FILE_TYPES = {
  PDF: "pdf",
  DOCX: "docx",
  XLSX: "xlsx",
} as const;

export const SUPPORTED_FILE_TYPES = Object.values(FILE_TYPES);

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  relevance: 0.25,
  completeness: 0.25,
  risk: 0.2,
  clarity: 0.15,
  accuracy: 0.15,
};

export const FILE_SIZE_LIMITS = {
  PDF: 10 * 1024 * 1024, // 10MB
  DOCX: 5 * 1024 * 1024, // 5MB
  XLSX: 5 * 1024 * 1024, // 5MB
} as const;

// =====================================================
// UTILITY TYPES
// =====================================================

export type AnalysisStatus =
  (typeof ANALYSIS_STATUSES)[keyof typeof ANALYSIS_STATUSES];
export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];
export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

export const ANALYSIS_VALIDATION_SCHEMAS = {
  // File type validation
  SUPPORTED_FILE_TYPES: ["pdf", "docx", "xlsx"],

  // File size limits (in bytes)
  MAX_FILE_SIZES: {
    pdf: 10 * 1024 * 1024, // 10MB
    docx: 5 * 1024 * 1024, // 5MB
    xlsx: 5 * 1024 * 1024, // 5MB
  },

  // Score validation
  MIN_SCORE: 0,
  MAX_SCORE: 100,

  // Risk level validation
  VALID_RISK_LEVELS: ["low", "medium", "high"],

  // Status validation
  VALID_STATUSES: ["pending", "processing", "completed", "failed"],
} as const;

// =====================================================
// DEFAULT VALUES
// =====================================================

export const ANALYSIS_DEFAULTS = {
  status: "pending",
  overall_score: null,
  risk_level: null,
  processing_started_at: null,
  processing_completed_at: null,
} as const;

// =====================================================
// ANALYSIS FIELD CATEGORIES
// =====================================================

export const ANALYSIS_FIELD_CATEGORIES = {
  BASIC_INFO: ["file_name", "file_type", "file_size", "status"],
  SCORES: [
    "overall_score",
    "relevance_score",
    "completeness_score",
    "risk_score",
    "clarity_score",
    "accuracy_score",
  ],
  METADATA: [
    "created_at",
    "updated_at",
    "processing_started_at",
    "processing_completed_at",
  ],
  RESULTS: [
    "insights",
    "recommendations",
    "extracted_fields",
    "highlights",
    "questions",
  ],
} as const;

// =====================================================
// REQUIRED FIELDS FOR ANALYSIS CREATION
// =====================================================

export const REQUIRED_ANALYSIS_FIELDS = [
  "file_name",
  "file_type",
  "file_size",
  "file_url",
] as const;

// =====================================================
// OPTIONAL BUT RECOMMENDED FIELDS
// =====================================================

export const RECOMMENDED_ANALYSIS_FIELDS = [
  "overall_score",
  "risk_level",
  "processing_started_at",
  "processing_completed_at",
] as const;
