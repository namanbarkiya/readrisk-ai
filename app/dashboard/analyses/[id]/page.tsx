"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ResultsTabs } from "@/components/analysis/results-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAnalysis, useAnalysisStatus } from "@/lib/query/hooks/analysis";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const { data: analysisObj, isLoading, error } = useAnalysis(analysisId);
  const { data: statusData } = useAnalysisStatus(analysisId);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load analysis");
      router.push("/dashboard/analyses");
    }
  }, [error, router]);

  // Handle reanalysis
  const handleReanalyze = async () => {
    if (!analysisObj?.analysis) return;

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
        toast.success("Analysis restarted successfully!");
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast.error("Failed to restart analysis");
      }
    } catch (error) {
      console.error("Error restarting analysis:", error);
      toast.error("Failed to restart analysis");
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!analysisObj?.analysis) return;

    // Create a JSON blob with the analysis data
    const dataStr = JSON.stringify(analysisObj?.analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysisObj?.analysis.file_name.replace(/\.[^/.]+$/, "")}-analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Analysis data downloaded");
  };

  // Handle share
  const handleShare = () => {
    if (!analysisObj?.analysis) return;

    const url = `${window.location.origin}/dashboard/analyses/${analysisId}`;

    if (navigator.share) {
      navigator.share({
        title: `Analysis: ${analysisObj?.analysis.file_name}`,
        text: `View the risk analysis for ${analysisObj?.analysis.file_name}`,
        url: url,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Analysis link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisObj?.analysis) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">Analysis not found</h3>
            <p className="text-muted-foreground mb-4">
              The analysis you&apos;re looking for doesn&apos;t exist or has
              been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {analysisObj?.analysis.file_name}
          </h1>
          <p className="text-muted-foreground">
            Analysis created on{" "}
            {new Date(analysisObj?.analysis.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {analysisObj?.analysis.status === "failed" && (
            <Button onClick={handleReanalyze} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reanalyze
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {analysisObj?.analysis.status === "processing" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <div>
                <p className="font-medium text-blue-900">
                  Analysis in Progress
                </p>
                <p className="text-sm text-blue-700">
                  Your document is being analyzed. This may take a few moments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisObj?.analysis.status === "failed" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="text-red-600">⚠️</div>
              <div>
                <p className="font-medium text-red-900">Analysis Failed</p>
                <p className="text-sm text-red-700">
                  The analysis encountered an error. You can try reanalyzing the
                  document.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Tabs */}
      <ResultsTabs
        analysis={analysisObj?.analysis}
        result={analysisObj?.result || null}
        onReanalyze={handleReanalyze}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      {/* Processing Status Updates */}
      {analysisObj?.analysis.status === "processing" && statusData && (
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
                    {analysisObj?.analysis.file_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>File Type:</span>
                  <span className="font-medium">
                    {analysisObj?.analysis.file_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="font-medium">
                    {(analysisObj?.analysis.file_size / 1024 / 1024).toFixed(2)}{" "}
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
                    {analysisObj?.analysis.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {new Date(
                      analysisObj?.analysis.created_at
                    ).toLocaleString()}
                  </span>
                </div>
                {analysisObj?.analysis.updated_at && (
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="font-medium">
                      {new Date(
                        analysisObj?.analysis.updated_at
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                {analysisObj?.analysis.overall_score && (
                  <div className="flex justify-between">
                    <span>Overall Score:</span>
                    <span className="font-medium">
                      {analysisObj?.analysis.overall_score.toFixed(1)}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
