"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAnalysisList,
  useAnalysisStats,
  useCreateAnalysis,
  useRecentAnalyses,
} from "@/lib/query/hooks/analysis";
import { useAnalysisStore } from "@/lib/store/analysis-store";
import { ApiDebug } from "./api-debug";

export const AnalysisTest = () => {
  // Jotai store
  const {
    currentAnalysis,
    analysisHistory,
    isCreatingAnalysis,
    isLoadingHistory,
    analysisError,
    createAnalysis,
    getAnalysisHistory,
    clearError,
  } = useAnalysisStore();

  // React Query hooks
  const { data: analysisList, isLoading: isLoadingList } = useAnalysisList();
  const { data: stats } = useAnalysisStats();
  const { analyses: recentAnalyses } = useRecentAnalyses(3);
  const createAnalysisMutation = useCreateAnalysis();

  // Load analysis history on mount (only once)
  useEffect(() => {
    getAnalysisHistory();
  }, []); // Empty dependency array - only run once on mount

  const handleFileUpload = async () => {
    // Create a mock file for testing
    const mockFile = new File(
      ["This is a test document content for analysis."],
      "test-document.txt",
      { type: "text/plain" }
    );

    try {
      await createAnalysis(mockFile);
    } catch (error) {
      console.error("Failed to create analysis:", error);
    }
  };

  const handleCreateWithReactQuery = async () => {
    const mockFile = new File(
      ["This is a test document for React Query analysis."],
      "react-query-test.txt",
      { type: "text/plain" }
    );

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", mockFile);

    try {
      // Upload file first
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      const uploadResult = await uploadResponse.json();

      // Create analysis using React Query mutation
      createAnalysisMutation.mutate({
        file_name: mockFile.name,
        file_type: uploadResult.file_type,
        file_size: mockFile.size,
        file_url: uploadResult.file_url,
      });
    } catch (error) {
      console.error("Failed to create analysis with React Query:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis State Management Test</CardTitle>
          <CardDescription>
            Testing both Jotai store and React Query hooks for analysis
            management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {analysisError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">Error: {analysisError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="mt-2"
              >
                Clear Error
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleFileUpload} disabled={isCreatingAnalysis}>
              {isCreatingAnalysis ? "Creating..." : "Create Analysis (Jotai)"}
            </Button>

            <Button
              onClick={handleCreateWithReactQuery}
              disabled={createAnalysisMutation.isPending}
              variant="outline"
            >
              {createAnalysisMutation.isPending
                ? "Creating..."
                : "Create Analysis (React Query)"}
            </Button>

            <Button
              onClick={() => getAnalysisHistory()}
              disabled={isLoadingHistory}
              variant="secondary"
            >
              {isLoadingHistory ? "Loading..." : "Refresh History"}
            </Button>
          </div>

          {/* Current Analysis */}
          {currentAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>File:</strong> {currentAnalysis.analysis.file_name}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Badge variant="outline" className="ml-2">
                      {currentAnalysis.analysis.status}
                    </Badge>
                  </p>
                  {currentAnalysis.analysis.overall_score && (
                    <p>
                      <strong>Score:</strong>{" "}
                      {currentAnalysis.analysis.overall_score}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stats.completed}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.processing}
                    </p>
                    <p className="text-sm text-muted-foreground">Processing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {stats.failed}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
                {stats.avgScore > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold">
                      Average Score: {stats.avgScore}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Recent Analyses (React Query)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{analysis.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{analysis.status}</Badge>
                        {analysis.overall_score && (
                          <Badge variant="secondary">
                            {analysis.overall_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis History (Jotai) */}
          {analysisHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Analysis History (Jotai)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisHistory.slice(0, 5).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{analysis.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{analysis.status}</Badge>
                        {analysis.overall_score && (
                          <Badge variant="secondary">
                            {analysis.overall_score}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading States */}
          {(isLoadingHistory || isLoadingList) && (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Loading analysis data...</p>
            </div>
          )}

          {/* Empty State */}
          {analysisHistory.length === 0 && !isLoadingHistory && (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                No analyses found. Create your first analysis above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Debug Monitor */}
      <ApiDebug />
    </div>
  );
};
