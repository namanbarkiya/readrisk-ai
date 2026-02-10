"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FileText, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalysisList } from "@/lib/query/hooks/analysis";
import type {
  Analysis,
  AnalysisResult,
  AnalysisWithResults,
} from "@/lib/types/analysis";
import { AnalysisHeader } from "./analysis-header";
import { InsightsDisplay } from "./insights-display";
import { ResultsTabs } from "./results-tabs";
import { ScoreBreakdown } from "./score-breakdown";

export const UIComponentsDemo = () => {
  const [selectedComponent, setSelectedComponent] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisWithResults | null>(null);

  // Fetch analysis list
  const {
    data: analysisList,
    isLoading,
    error,
    refetch,
  } = useAnalysisList({ limit: 50 });

  // Find completed analyses
  const completedAnalyses =
    analysisList?.analyses?.filter(
      (analysis) =>
        analysis.status === "completed" && analysis.overall_score !== null
    ) || [];

  // Find a completed analysis with results
  useEffect(() => {
    if (completedAnalyses.length > 0 && !selectedAnalysis) {
      // Use the first completed analysis
      const completedAnalysis = completedAnalyses[0];

      // Fetch the full analysis with results from the results table
      fetch(`/api/analysis/${completedAnalysis.id}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data: any) => {
          console.log("Fetched analysis with results:", data);
          // Handle the actual API response structure
          let result = null;

          if (data.analysis && data.result) {
            result = data.result;
          } else if (data.analysis && data.results) {
            // Handle case where results might be an array
            result = Array.isArray(data.results)
              ? data.results[0]
              : data.results;
          } else if (data.analysis && data.analysis_results) {
            // Handle case where the response has analysis_results array
            result =
              Array.isArray(data.analysis_results) &&
              data.analysis_results.length > 0
                ? data.analysis_results[0]
                : null;
          }

          if (data.analysis && result) {
            setSelectedAnalysis({
              analysis: data.analysis,
              result: result,
            });
          } else {
            console.error("Unexpected data structure:", data);
            setSelectedAnalysis(null);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch analysis details:", err);
          // If the main endpoint fails, try to fetch just the analysis and then results separately
          fetch(`/api/analysis/${completedAnalysis.id}`)
            .then((res) => res.json())
            .then((analysisData: Analysis) => {
              // Try to fetch results separately from the results table
              return fetch(`/api/analysis/${completedAnalysis.id}/results`)
                .then((res) => res.json())
                .then((resultsData: AnalysisResult) => {
                  setSelectedAnalysis({
                    analysis: analysisData,
                    result: resultsData,
                  });
                })
                .catch(() => {
                  // If results fetch fails, show analysis without results
                  setSelectedAnalysis({
                    analysis: analysisData,
                    result: null,
                  });
                });
            });
        });
    }
  }, [completedAnalyses, selectedAnalysis]);

  const handleAnalysisSelect = (analysisId: string) => {
    // Fetch the full analysis with results from the results table
    fetch(`/api/analysis/${analysisId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: any) => {
        console.log("Selected analysis with results:", data);
        // Handle the actual API response structure
        if (data.analysis && data.result) {
          setSelectedAnalysis({
            analysis: data.analysis,
            result: data.result,
          });
        } else if (data.analysis && data.results) {
          // Handle case where results might be an array
          setSelectedAnalysis({
            analysis: data.analysis,
            result: Array.isArray(data.results)
              ? data.results[0]
              : data.results,
          });
        } else if (data.analysis && data.analysis_results) {
          // Handle case where the response has analysis_results array
          setSelectedAnalysis({
            analysis: data.analysis,
            result:
              Array.isArray(data.analysis_results) &&
              data.analysis_results.length > 0
                ? data.analysis_results[0]
                : null,
          });
        } else {
          console.error("Unexpected data structure:", data);
          setSelectedAnalysis(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch analysis details:", err);
        // Fallback: fetch analysis and results separately
        fetch(`/api/analysis/${analysisId}`)
          .then((res) => res.json())
          .then((analysisData: Analysis) => {
            return fetch(`/api/analysis/${analysisId}/results`)
              .then((res) => res.json())
              .then((resultsData: AnalysisResult) => {
                setSelectedAnalysis({
                  analysis: analysisData,
                  result: resultsData,
                });
              })
              .catch(() => {
                setSelectedAnalysis({
                  analysis: analysisData,
                  result: null,
                });
              });
          });
      });
  };

  const handleReanalyze = () => {
    console.log("Reanalyze clicked");
  };

  const handleDownload = () => {
    console.log("Download clicked");
  };

  const handleShare = () => {
    console.log("Share clicked");
  };

  const components = [
    {
      id: "all",
      label: "All Components",
      description: "Complete analysis interface",
    },
    {
      id: "header",
      label: "Analysis Header",
      description: "Document info and actions",
    },
    {
      id: "scores",
      label: "Score Breakdown",
      description: "Visual score analysis",
    },
    {
      id: "insights",
      label: "Insights Display",
      description: "Categorized findings",
    },
    { id: "tabs", label: "Results Tabs", description: "Tabbed interface" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis UI Components Demo</CardTitle>
          <CardDescription>
            Interactive demonstration of all analysis UI components with mock
            data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Component Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {components.map((component) => (
              <Button
                key={component.id}
                variant={
                  selectedComponent === component.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedComponent(component.id)}
              >
                {component.label}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading analysis data...</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load analysis data. Please try again.
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="ml-2"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* No Data State */}
          {!isLoading &&
            !error &&
            (!analysisList?.analyses || analysisList.analyses.length === 0) && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  No analyses found. Please create an analysis first to see the
                  components in action.
                </AlertDescription>
              </Alert>
            )}

          {/* No Completed Analysis State */}
          {!isLoading &&
            !error &&
            analysisList?.analyses &&
            analysisList.analyses.length > 0 &&
            !selectedAnalysis && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {completedAnalyses.length === 0 ? (
                    <>
                      No completed analyses with results found. The components
                      will show loading states until an analysis is completed.
                      <div className="mt-2 text-sm text-muted-foreground">
                        Available analyses:{" "}
                        {analysisList.analyses
                          .map((a) => `${a.file_name} (${a.status})`)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    <>
                      Found {completedAnalyses.length} completed analyses but
                      failed to load results.
                      <div className="mt-2 text-sm text-muted-foreground">
                        Completed analyses:{" "}
                        {completedAnalyses
                          .map(
                            (a) => `${a.file_name} (Score: ${a.overall_score})`
                          )
                          .join(", ")}
                      </div>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

          {/* Analysis Selector */}
          {completedAnalyses.length > 1 && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Select Analysis to Display</h4>
              <div className="flex flex-wrap gap-2">
                {completedAnalyses.map((analysis) => (
                  <Button
                    key={analysis.id}
                    variant={
                      selectedAnalysis?.analysis.id === analysis.id
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleAnalysisSelect(analysis.id)}
                  >
                    {analysis.file_name}
                    <Badge variant="secondary" className="ml-2">
                      {analysis.overall_score?.toFixed(1)}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Component Display */}
          {selectedAnalysis && (
            <div className="space-y-8">
              {/* Data Debug */}

              {selectedComponent === "all" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Complete Analysis Interface
                    </h3>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Real Data:</strong> Showing analysis of &ldquo;
                        {selectedAnalysis.analysis.file_name}&rdquo; (Score:{" "}
                        {selectedAnalysis.analysis.overall_score?.toFixed(1)}
                        /100, Risk:{" "}
                        {selectedAnalysis.analysis.risk_level || "Not assessed"}
                        )
                      </p>
                    </div>
                    <ResultsTabs
                      analysis={selectedAnalysis.analysis}
                      result={selectedAnalysis.result}
                      onReanalyze={handleReanalyze}
                      onDownload={handleDownload}
                      onShare={handleShare}
                    />
                  </div>
                </div>
              )}

              {selectedComponent === "header" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Analysis Header Component
                  </h3>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Real Data:</strong>{" "}
                      {selectedAnalysis.analysis.file_name}
                    </p>
                  </div>
                  <AnalysisHeader
                    analysis={selectedAnalysis.analysis}
                    result={selectedAnalysis.result}
                    onReanalyze={handleReanalyze}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                </div>
              )}

              {selectedComponent === "scores" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Score Breakdown Component
                  </h3>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Real Data:</strong> Overall score{" "}
                      {selectedAnalysis.analysis.overall_score?.toFixed(1)}/100
                    </p>
                  </div>
                  {selectedAnalysis.result && (
                    <ScoreBreakdown result={selectedAnalysis.result} />
                  )}
                </div>
              )}

              {selectedComponent === "insights" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Insights Display Component
                  </h3>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Real Data:</strong>{" "}
                      {selectedAnalysis.result?.insights.length || 0} insights,
                      {selectedAnalysis.result?.recommendations.length ||
                        0}{" "}
                      recommendations
                    </p>
                  </div>
                  {selectedAnalysis.result && (
                    <InsightsDisplay result={selectedAnalysis.result} />
                  )}
                </div>
              )}

              {selectedComponent === "tabs" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Results Tabs Component
                  </h3>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Real Data:</strong>{" "}
                      {selectedAnalysis.analysis.file_name}
                    </p>
                  </div>
                  <ResultsTabs
                    analysis={selectedAnalysis.analysis}
                    result={selectedAnalysis.result}
                    onReanalyze={handleReanalyze}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                </div>
              )}
            </div>
          )}

          {/* Component Information */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Component Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium">Analysis Header</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Document metadata and file info</li>
                  <li>• Status indicators with processing time</li>
                  <li>• Action buttons (reanalyze, download, share)</li>
                  <li>• Key insights preview</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium">Score Breakdown</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Circular progress visualization</li>
                  <li>• Individual metric breakdowns</li>
                  <li>• Color-coded indicators</li>
                  <li>• Score statistics and trends</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium">Insights Display</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Collapsible categorized insights</li>
                  <li>• Priority-based recommendations</li>
                  <li>• Confidence level indicators</li>
                  <li>• Questions and clarifications</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium">Results Tabs</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Responsive tab navigation</li>
                  <li>• Mobile dropdown support</li>
                  <li>• Loading and error states</li>
                  <li>• Integrated component display</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
