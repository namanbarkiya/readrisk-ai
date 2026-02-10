"use client";

import React from "react";
import { AlertCircle, CheckCircle, Clock, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: "validating" | "uploading" | "processing" | "completed" | "error";
  error?: string;
  uploadSpeed?: string;
  timeRemaining?: string;
  fileSize?: string;
}

export function UploadProgress({
  fileName,
  progress,
  status,
  error,
  uploadSpeed,
  timeRemaining,
  fileSize,
}: UploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "validating":
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case "uploading":
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "processing":
        return <Clock className="h-5 w-5 text-orange-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Upload className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "validating":
        return "Validating PDF content...";
      case "uploading":
        return "Uploading file...";
      case "processing":
        return "Processing document...";
      case "completed":
        return "Upload completed!";
      case "error":
        return "Upload failed";
      default:
        return "Preparing upload...";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "validating":
        return "bg-yellow-100 text-yellow-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "validating":
        return "bg-yellow-500";
      case "uploading":
        return "bg-blue-500";
      case "processing":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-medium text-sm truncate max-w-[200px]">
                  {fileName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {getStatusText()}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor()}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              style={
                {
                  "--progress-color": getProgressColor().replace("bg-", ""),
                } as React.CSSProperties
              }
            />
          </div>

          {/* Upload Details */}
          {(uploadSpeed || timeRemaining || fileSize) && (
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              {fileSize && (
                <div className="text-center">
                  <p className="font-medium">File Size</p>
                  <p>{fileSize}</p>
                </div>
              )}
              {uploadSpeed && (
                <div className="text-center">
                  <p className="font-medium">Speed</p>
                  <p>{uploadSpeed}</p>
                </div>
              )}
              {timeRemaining && (
                <div className="text-center">
                  <p className="font-medium">Time Left</p>
                  <p>{timeRemaining}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Upload failed</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Steps */}
          {(status === "processing" || status === "validating") && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Processing steps:
              </p>
              <div className="space-y-1">
                {status === "validating" && (
                  <>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      <span>Validating PDF content and parsing capability</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>File upload (pending validation)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Extracting document content</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Analyzing with AI</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Generating risk assessment</span>
                    </div>
                  </>
                )}
                {status === "processing" && (
                  <>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>PDF validation completed</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>File uploaded successfully</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span>
                        Extracting document content (using pdf-parse-new)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Analyzing with AI</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Generating risk assessment</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
