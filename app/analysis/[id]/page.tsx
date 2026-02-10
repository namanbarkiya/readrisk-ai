"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ResultsTabs } from "@/components/analysis/results-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysis, useAnalysisStatus } from "@/lib/query/hooks/analysis";
import { generateAnalysisReport } from "@/lib/utils/pdf-report";
import {
  cacheAnalysis,
  getCachedAnalysis,
} from "@/lib/utils/analysis-cache";
import { Moon } from "lucide-react";
import { useDarkMode } from "@/lib/hooks/use-dark-mode";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import type { Analysis, AnalysisResult } from "@/lib/types/analysis";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const [isDark, toggleDark] = useDarkMode();

  // Local state: what we actually render (from cache or server)
  const [displayAnalysis, setDisplayAnalysis] = useState<Analysis | null>(null);
  const [displayResult, setDisplayResult] = useState<AnalysisResult | null>(
    null
  );
  const [isFromCache, setIsFromCache] = useState(false);

  // Try loading from localStorage immediately
  useEffect(() => {
    const cached = getCachedAnalysis(analysisId);
    if (cached) {
      setDisplayAnalysis(cached.analysis);
      setDisplayResult(cached.result);
      setIsFromCache(true);
    }
  }, [analysisId]);

  // Determine if we need to poll the server:
  // - If nothing cached, always poll
  // - If cached but status is not completed/failed, poll to get updates
  const needsServerPolling =
    !isFromCache ||
    (displayAnalysis?.status !== "completed" &&
      displayAnalysis?.status !== "failed");

  const {
    data: serverData,
    isLoading: serverLoading,
    error: serverError,
    refetch,
  } = useAnalysis(analysisId, needsServerPolling);

  const { data: statusData } = useAnalysisStatus(
    analysisId,
    needsServerPolling
  );

  // When server returns data, update display and cache if completed
  useEffect(() => {
    if (!serverData?.analysis) return;

    setDisplayAnalysis(serverData.analysis);
    setDisplayResult(serverData.result || null);

    // Cache to localStorage once completed
    if (
      serverData.analysis.status === "completed" ||
      serverData.analysis.status === "failed"
    ) {
      cacheAnalysis(serverData.analysis, serverData.result || null);
      setIsFromCache(true);
    }
  }, [serverData]);

  // Refetch full data when status changes to completed
  useEffect(() => {
    if (
      statusData?.status === "completed" &&
      displayAnalysis?.status !== "completed"
    ) {
      refetch();
    }
  }, [statusData?.status, displayAnalysis?.status, refetch]);

  // Handle errors
  useEffect(() => {
    if (serverError && !isFromCache) {
      toast.error("Failed to load analysis");
    }
  }, [serverError, isFromCache]);

  // Derive loading state
  const isLoading = !displayAnalysis && serverLoading;

  // Handle reanalysis
  const handleReanalyze = async () => {
    if (!displayAnalysis) return;

    try {
      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "pending",
        }),
      });

      if (response.ok) {
        // Clear cache since we're reprocessing
        setIsFromCache(false);
        toast.success("Analysis restarted successfully!");
        window.location.reload();
      } else {
        toast.error("Failed to restart analysis");
      }
    } catch (error) {
      console.error("Error restarting analysis:", error);
      toast.error("Failed to restart analysis");
    }
  };

  // Handle download as PDF report
  const handleDownload = () => {
    if (!displayAnalysis) return;

    try {
      generateAnalysisReport(displayAnalysis, displayResult);
      toast.success("PDF report downloaded");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  // Handle share
  const handleShare = () => {
    if (!displayAnalysis) return;

    const url = `${window.location.origin}/analysis/${analysisId}`;

    if (navigator.share) {
      navigator.share({
        title: `Analysis: ${displayAnalysis.file_name}`,
        text: `View the risk analysis for ${displayAnalysis.file_name}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Analysis link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Global gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 dark:from-emerald-950/25 dark:via-teal-950/15 dark:to-cyan-950/10" />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          className="rounded-full backdrop-blur-md bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/10"
        >
          <Moon
            className={cn(
              "h-5 w-5 text-gray-600",
              isDark && "dark:text-yellow-400"
            )}
          />
        </Button>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <Logo size="sm" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading analysis...</p>
            </div>
          </div>
        )}

        {/* Not found */}
        {!isLoading && !displayAnalysis && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4">❌</div>
                <h3 className="text-lg font-semibold mb-2">
                  Analysis not found
                </h3>
                <p className="text-muted-foreground mb-4">
                  The analysis you&apos;re looking for doesn&apos;t exist or is
                  still processing.
                </p>
                <Button onClick={() => router.push("/")}>Go to Home</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Content (legacy layout - no reanalyze button) */}
        {!isLoading && displayAnalysis && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {displayAnalysis.file_name}
                </h1>
                <p className="text-muted-foreground">
                  Analysis created on{" "}
                  {new Date(displayAnalysis.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Banner */}
            {(displayAnalysis.status === "processing" ||
              displayAnalysis.status === "pending") && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        Analysis in Progress
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your document is being analyzed. This may take a few
                        moments. The page will update automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {displayAnalysis.status === "failed" && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-600">⚠️</div>
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-200">
                        Analysis Failed
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        The analysis encountered an error. Please upload a new
                        file from the home page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Tabs */}
            <ResultsTabs
              analysis={displayAnalysis}
              result={displayResult}
              onDownload={handleDownload}
              onShare={handleShare}
            />

            {/* Processing Status Updates */}
            {(displayAnalysis.status === "processing" ||
              displayAnalysis.status === "pending") && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>File Upload</span>
                      <span className="text-green-600">✓ Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Text Extraction</span>
                      <span className="text-green-600">✓ Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Analysis</span>
                      <span className="text-blue-600">🔄 In Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Score Calculation</span>
                      <span className="text-gray-400">⏳ Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Results Generation</span>
                      <span className="text-gray-400">⏳ Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Information */}
            <Card>
              <CardHeader>
                <CardTitle>File Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Document Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>File Name:</span>
                        <span className="font-medium">
                          {displayAnalysis.file_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>File Type:</span>
                        <span className="font-medium">
                          {displayAnalysis.file_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>File Size:</span>
                        <span className="font-medium">
                          {(displayAnalysis.file_size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Analysis Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium capitalize">
                          {displayAnalysis.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(
                            displayAnalysis.created_at
                          ).toLocaleString()}
                        </span>
                      </div>
                      {displayAnalysis.updated_at && (
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span className="font-medium">
                            {new Date(
                              displayAnalysis.updated_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {displayAnalysis.overall_score && (
                        <div className="flex justify-between">
                          <span>Overall Score:</span>
                          <span className="font-medium">
                            {displayAnalysis.overall_score.toFixed(1)}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
