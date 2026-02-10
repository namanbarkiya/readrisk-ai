"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { FilePreview } from "@/components/analysis/file-preview";
import { FileUpload } from "@/components/analysis/file-upload";
import { UploadProgress } from "@/components/analysis/upload-progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { useCreateAnalysis } from "@/lib/query/hooks/analysis";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { uploadState, validateAndUpload, resetUpload } = useFileUpload();
  const createAnalysisMutation = useCreateAnalysis();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisId(null);
    resetUpload();
  };

  const handleUploadStart = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // Upload and validate file
      const uploadResult = await validateAndUpload(selectedFile);

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Upload failed");
        setIsProcessing(false);
        // Remove file on parsing error
        if (
          uploadResult.error?.includes("PDF parsing failed") ||
          uploadResult.error?.includes("failed to parse")
        ) {
          setSelectedFile(null);
        }
        return;
      }

      // Remove file when analysis starts to prevent multiple clicks
      setSelectedFile(null);

      // Create analysis
      createAnalysisMutation.mutate(
        {
          file_name: selectedFile.name,
          file_type: selectedFile.type as "pdf" | "docx" | "xlsx",
          file_size: selectedFile.size,
          file_url: uploadResult.fileUrl!,
        },
        {
          onSuccess: (data) => {
            setAnalysisId(data.id);
            toast.success("Analysis started successfully!");
            setIsProcessing(false);
          },
          onError: (error) => {
            toast.error("Analysis creation failed");
            setIsProcessing(false);
          },
        }
      );
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast.error("Failed to start analysis");
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAnalysisId(null);
    resetUpload();
  };

  const handleViewResults = () => {
    if (analysisId) {
      router.push(`/dashboard/analyses/${analysisId}`);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setAnalysisId(null);
    resetUpload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Analysis</h1>
        <p className="text-muted-foreground">
          Upload and analyze a document for risk assessment
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* File Upload Section */}
        {!selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                onUploadStart={() => {}}
                onUploadComplete={() => {}}
                onUploadError={(error) => toast.error(error)}
                isUploading={false}
                uploadProgress={0}
              />
            </CardContent>
          </Card>
        )}

        {/* File Preview Section */}
        {selectedFile && !isProcessing && !analysisId && (
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <FilePreview
                file={selectedFile}
                onStartAnalysis={handleUploadStart}
                onRemoveFile={handleRemoveFile}
                isProcessing={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Upload Progress Section */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadProgress
                fileName={selectedFile?.name || ""}
                progress={uploadState.progress}
                status={
                  uploadState.isValidating
                    ? "validating"
                    : uploadState.isUploading
                      ? "uploading"
                      : "processing"
                }
                error={uploadState.error || undefined}
                uploadSpeed={uploadState.uploadSpeed}
                timeRemaining={uploadState.timeRemaining}
                fileSize={
                  selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : undefined
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Success Section */}
        {analysisId && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Started Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2">
                  Your analysis is now processing
                </h3>
                <p className="text-muted-foreground mb-6">
                  We&apos;ll analyze your document and provide detailed risk
                  insights. This typically takes 15-30 seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleViewResults} size="lg">
                    View Analysis
                  </Button>
                  <Button
                    onClick={handleNewAnalysis}
                    variant="outline"
                    size="lg"
                  >
                    Start Another Analysis
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI analyzes document content</li>
                    <li>• Risk factors are identified</li>
                    <li>• Comprehensive scoring is calculated</li>
                    <li>• Detailed insights are generated</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">You&apos;ll receive:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Overall risk score (0-100)</li>
                    <li>• Risk level classification</li>
                    <li>• Key insights and findings</li>
                    <li>• Actionable recommendations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Supported File Types</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF Documents (.pdf)</li>
                <li>• Word Documents (.docx)</li>
                <li>• Excel Spreadsheets (.xlsx)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">File Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum file size: 10MB</li>
                <li>• Processing time: 15-30 seconds</li>
                <li>• Supported languages: English</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Sample Test Document</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download our sample risk assessment document to test the analysis
              functionality:
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/sample-test-document.txt";
                link.download = "sample-risk-assessment.txt";
                link.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Download Sample Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
