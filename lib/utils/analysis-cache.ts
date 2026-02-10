// =====================================================
// ANALYSIS LOCAL STORAGE CACHE
// =====================================================
// Stores the latest analysis in the browser's localStorage
// so results survive page refreshes and server restarts.
// Only one analysis is stored at a time (overwritten on new).
// =====================================================

import type { Analysis, AnalysisResult } from "@/lib/types/analysis";

const STORAGE_KEY = "riskread_analysis";

export interface CachedAnalysis {
  analysis: Analysis;
  result: AnalysisResult | null;
  cachedAt: string; // ISO timestamp
}

/**
 * Save an analysis + result to localStorage (overwrites previous)
 */
export function cacheAnalysis(
  analysis: Analysis,
  result: AnalysisResult | null
): void {
  try {
    const data: CachedAnalysis = {
      analysis,
      result,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to cache analysis to localStorage:", error);
  }
}

/**
 * Get the cached analysis from localStorage
 * Returns null if nothing is cached or the id doesn't match
 */
export function getCachedAnalysis(
  analysisId: string
): CachedAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: CachedAnalysis = JSON.parse(raw);
    if (data.analysis?.id !== analysisId) return null;

    return data;
  } catch (error) {
    console.warn("Failed to read cached analysis:", error);
    return null;
  }
}

/**
 * Get the latest cached analysis (regardless of id).
 * Used on the home page to show \"Recent analysis\".
 */
export function getLatestCachedAnalysis(): CachedAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: CachedAnalysis = JSON.parse(raw);
    if (!data.analysis?.id) return null;

    return data;
  } catch (error) {
    console.warn("Failed to read latest cached analysis:", error);
    return null;
  }
}

/**
 * Clear the cached analysis
 */
export function clearCachedAnalysis(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear cached analysis:", error);
  }
}
