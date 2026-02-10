// =====================================================
// IN-MEMORY ANALYSIS STORE (temporary buffer)
// =====================================================
// Server-side in-memory store that holds analyses while
// they are processing. Once completed/failed, entries
// auto-expire after CLEANUP_DELAY_MS so the server
// doesn't accumulate stale data.
// Clients cache completed results in localStorage.
// =====================================================

import { Analysis, AnalysisResult } from "@/lib/types/analysis";
import crypto from "crypto";

type StoredAnalysis = Analysis;

type StoredResult = AnalysisResult;

// Auto-cleanup completed/failed entries after 5 minutes
const CLEANUP_DELAY_MS = 5 * 60 * 1000;

class AnalysisStore {
  private analyses: Map<string, StoredAnalysis> = new Map();
  private results: Map<string, StoredResult> = new Map(); // keyed by analysis_id
  private cleanupTimers: Map<string, NodeJS.Timeout> = new Map();

  // =====================================================
  // ANALYSIS CRUD
  // =====================================================

  createAnalysis(data: {
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
  }): StoredAnalysis {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysis: StoredAnalysis = {
      id,
      user_id: "anonymous",
      file_name: data.file_name,
      file_type: data.file_type as "pdf" | "docx" | "xlsx",
      file_size: data.file_size,
      file_url: data.file_url,
      status: "pending",
      overall_score: null,
      risk_level: null,
      processing_started_at: null,
      processing_completed_at: null,
      created_at: now,
      updated_at: now,
    };

    this.analyses.set(id, analysis);
    return analysis;
  }

  getAnalysis(id: string): StoredAnalysis | null {
    return this.analyses.get(id) || null;
  }

  updateAnalysis(
    id: string,
    updates: Partial<StoredAnalysis>
  ): StoredAnalysis | null {
    const analysis = this.analyses.get(id);
    if (!analysis) return null;

    const updated = {
      ...analysis,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.analyses.set(id, updated);

    // Schedule auto-cleanup when analysis reaches a terminal state
    if (updated.status === "completed" || updated.status === "failed") {
      this.scheduleCleanup(id);
    }

    return updated;
  }

  /**
   * Schedule auto-removal of an analysis entry after a delay.
   * This keeps the server memory lean — the client caches
   * completed results in localStorage anyway.
   */
  private scheduleCleanup(id: string): void {
    // Clear any existing timer for this id
    const existing = this.cleanupTimers.get(id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.analyses.delete(id);
      this.results.delete(id);
      this.cleanupTimers.delete(id);
      console.log(`🗑️ [STORE] Auto-cleaned analysis ${id} from memory`);
    }, CLEANUP_DELAY_MS);

    this.cleanupTimers.set(id, timer);
  }

  deleteAnalysis(id: string): boolean {
    this.results.delete(id);
    return this.analyses.delete(id);
  }

  listAnalyses(options?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): { analyses: StoredAnalysis[]; total: number } {
    let all = Array.from(this.analyses.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (options?.status) {
      all = all.filter((a) => a.status === options.status);
    }

    const total = all.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 10;
    const analyses = all.slice(offset, offset + limit);

    return { analyses, total };
  }

  // =====================================================
  // RESULT CRUD
  // =====================================================

  createResult(analysisId: string, data: Omit<StoredResult, "id" | "analysis_id" | "created_at">): StoredResult {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result: StoredResult = {
      id,
      analysis_id: analysisId,
      ...data,
      created_at: now,
    };

    this.results.set(analysisId, result);
    return result;
  }

  getResult(analysisId: string): StoredResult | null {
    return this.results.get(analysisId) || null;
  }

  getAnalysisWithResults(
    analysisId: string
  ): { analysis: StoredAnalysis; results: StoredResult | null } | null {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return null;

    const results = this.results.get(analysisId) || null;
    return { analysis, results };
  }
}

// Singleton instance
const globalForStore = globalThis as unknown as {
  analysisStore: AnalysisStore | undefined;
};

export const analysisStore =
  globalForStore.analysisStore ?? new AnalysisStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.analysisStore = analysisStore;
}
