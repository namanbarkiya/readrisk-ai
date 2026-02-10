export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "text/plain": [".txt"],
};

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file type and size
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds the maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  // Check file type
  const isValidType = Object.keys(SUPPORTED_FILE_TYPES).includes(file.type);
  if (!isValidType) {
    return {
      isValid: false,
      error:
        "File type not supported. Please upload PDF, DOCX, XLSX, or TXT files.",
    };
  }

  return { isValid: true };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");

  return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Upload file to server via API
 */
export async function uploadFileToStorage(
  file: File
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || "Failed to upload file",
      };
    }

    const data = await response.json();

    return {
      success: true,
      fileUrl: data.fileUrl,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get file type category
 */
export function getFileTypeCategory(fileName: string): string {
  const extension = getFileExtension(fileName);

  switch (extension) {
    case "pdf":
      return "document";
    case "docx":
      return "document";
    case "xlsx":
      return "spreadsheet";
    default:
      return "unknown";
  }
}

/**
 * Calculate upload progress
 */
export function calculateUploadProgress(loaded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
}

/**
 * Format upload speed
 */
export function formatUploadSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return "0 B/s";

  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));

  return (
    parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  );
}

/**
 * Estimate time remaining
 */
export function estimateTimeRemaining(
  loaded: number,
  total: number,
  startTime: number
): string {
  if (loaded === 0) return "Calculating...";

  const elapsed = Date.now() - startTime;
  const rate = loaded / elapsed;
  const remaining = total - loaded;
  const timeRemaining = remaining / rate;

  if (timeRemaining < 1000) return "Less than 1 second";
  if (timeRemaining < 60000) return `${Math.round(timeRemaining / 1000)}s`;

  const minutes = Math.round(timeRemaining / 60000);
  return `${minutes}m`;
}
