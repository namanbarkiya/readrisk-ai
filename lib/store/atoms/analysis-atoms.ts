import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import type {
  Analysis,
  AnalysisStatus,
  AnalysisWithResults,
  FileUploadProgress,
} from "@/lib/types/analysis";

// =====================================================
// ANALYSIS ATOMS
// =====================================================

// Current analysis being viewed
export const currentAnalysisAtom = atom<AnalysisWithResults | null>(null);

// Analysis history/list
export const analysisHistoryAtom = atom<Analysis[]>([]);

// Upload progress state
export const uploadProgressAtom = atom<FileUploadProgress | null>(null);

// Analysis status for real-time updates
export const analysisStatusAtom = atom<Record<string, AnalysisStatus>>({});

// Loading states
export const isCreatingAnalysisAtom = atom<boolean>(false);
export const isLoadingAnalysisAtom = atom<boolean>(false);
export const isLoadingHistoryAtom = atom<boolean>(false);

// Error states
export const analysisErrorAtom = atom<string | null>(null);

// UI state
export const selectedAnalysisIdAtom = atom<string | null>(null);
export const analysisViewModeAtom = atom<"list" | "detail">("list");

// Filters and pagination
export const analysisFiltersAtom = atomWithStorage("analysis-filters", {
  status: "",
  risk_level: "",
  date_from: "",
  date_to: "",
  file_type: "",
});

export const analysisPaginationAtom = atomWithStorage("analysis-pagination", {
  page: 1,
  limit: 10,
  total: 0,
});

export const analysisSortAtom = atomWithStorage("analysis-sort", {
  sort_by: "created_at" as const,
  sort_order: "desc" as "asc" | "desc",
});

// =====================================================
// DERIVED ATOMS
// =====================================================

// Filtered analysis history
export const filteredAnalysisHistoryAtom = atom((get) => {
  const history = get(analysisHistoryAtom);
  const filters = get(analysisFiltersAtom);

  return history.filter((analysis) => {
    if (filters.status && analysis.status !== filters.status) return false;
    if (filters.risk_level && analysis.risk_level !== filters.risk_level)
      return false;
    if (filters.file_type && analysis.file_type !== filters.file_type)
      return false;

    if (filters.date_from) {
      const createdDate = new Date(analysis.created_at);
      const fromDate = new Date(filters.date_from);
      if (createdDate < fromDate) return false;
    }

    if (filters.date_to) {
      const createdDate = new Date(analysis.created_at);
      const toDate = new Date(filters.date_to);
      if (createdDate > toDate) return false;
    }

    return true;
  });
});

// Sorted analysis history
export const sortedAnalysisHistoryAtom = atom((get) => {
  const filtered = get(filteredAnalysisHistoryAtom);
  const sort = get(analysisSortAtom);

  return [...filtered].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sort.sort_by) {
      case "created_at":
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case "file_name":
        aValue = a.file_name.toLowerCase();
        bValue = b.file_name.toLowerCase();
        break;
      case "overall_score":
        aValue = a.overall_score ?? 0;
        bValue = b.overall_score ?? 0;
        break;
      default:
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
    }

    if (sort.sort_order === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
});

// Paginated analysis history
export const paginatedAnalysisHistoryAtom = atom((get) => {
  const sorted = get(sortedAnalysisHistoryAtom);
  const pagination = get(analysisPaginationAtom);

  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;

  return sorted.slice(startIndex, endIndex);
});

// Analysis statistics
export const analysisStatsAtom = atom((get) => {
  const history = get(analysisHistoryAtom);

  const total = history.length;
  const completed = history.filter((a) => a.status === "completed").length;
  const failed = history.filter((a) => a.status === "failed").length;
  const processing = history.filter((a) => a.status === "processing").length;
  const pending = history.filter((a) => a.status === "pending").length;

  const avgScore =
    completed > 0
      ? history
          .filter((a) => a.overall_score !== null)
          .reduce((sum, a) => sum + (a.overall_score ?? 0), 0) / completed
      : 0;

  const riskLevels = {
    low: history.filter((a) => a.risk_level === "low").length,
    medium: history.filter((a) => a.risk_level === "medium").length,
    high: history.filter((a) => a.risk_level === "high").length,
  };

  return {
    total,
    completed,
    failed,
    processing,
    pending,
    avgScore: Math.round(avgScore * 100) / 100,
    riskLevels,
  };
});

// =====================================================
// UTILITY ATOMS
// =====================================================

// Check if analysis is currently being processed
export const isAnalysisProcessingAtom = atom((get) => {
  const currentAnalysis = get(currentAnalysisAtom);
  return currentAnalysis?.analysis.status === "processing";
});

// Get analysis by ID
export const getAnalysisByIdAtom = atom(
  null,
  (get, set, analysisId: string) => {
    const history = get(analysisHistoryAtom);
    return history.find((a) => a.id === analysisId) || null;
  }
);

// Update analysis in history
export const updateAnalysisInHistoryAtom = atom(
  null,
  (get, set, updatedAnalysis: Analysis) => {
    const history = get(analysisHistoryAtom);
    const updatedHistory = history.map((a) =>
      a.id === updatedAnalysis.id ? updatedAnalysis : a
    );
    set(analysisHistoryAtom, updatedHistory);
  }
);

// Add analysis to history
export const addAnalysisToHistoryAtom = atom(
  null,
  (get, set, newAnalysis: Analysis) => {
    const history = get(analysisHistoryAtom);
    set(analysisHistoryAtom, [newAnalysis, ...history]);
  }
);

// Remove analysis from history
export const removeAnalysisFromHistoryAtom = atom(
  null,
  (get, set, analysisId: string) => {
    const history = get(analysisHistoryAtom);
    const filteredHistory = history.filter((a) => a.id !== analysisId);
    set(analysisHistoryAtom, filteredHistory);
  }
);
