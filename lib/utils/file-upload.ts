import { extractPDFFromURL } from "./pdf-extractor";

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
 * Validate PDF parsing capability before upload
 */
export async function validatePDFParsing(
  file: File
): Promise<FileValidationResult> {
  try {
    console.log("🔍 [FILE VALIDATION] Starting PDF parsing validation...");

    // Create a temporary URL for the file
    const fileUrl = URL.createObjectURL(file);

    try {
      // Try to extract text from the PDF
      const result = await extractPDFFromURL(fileUrl);

      // Check if we got meaningful text
      if (!result.text || result.text.trim().length === 0) {
        return {
          isValid: false,
          error:
            "PDF appears to be empty or contains no readable text. Please check if the PDF contains actual text content.",
        };
      }

      // Check minimum word count (at least 10 words)
      const wordCount = result.text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      if (wordCount < 10) {
        return {
          isValid: false,
          error: `PDF contains too little text (${wordCount} words). Please ensure the PDF contains sufficient readable content for analysis.`,
        };
      }

      console.log("✅ [FILE VALIDATION] PDF parsing validation successful");

      return { isValid: true };
    } finally {
      URL.revokeObjectURL(fileUrl);
    }
  } catch (error) {
    console.error("❌ [FILE VALIDATION] PDF parsing validation failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("password-protected")) {
      return {
        isValid: false,
        error:
          "PDF is password-protected. Please remove the password protection and try again.",
      };
    }

    if (errorMessage.includes("corrupted")) {
      return {
        isValid: false,
        error:
          "PDF appears to be corrupted. Please try a different PDF file or re-save the document.",
      };
    }

    if (errorMessage.includes("image-only")) {
      return {
        isValid: false,
        error:
          "PDF contains only images with no readable text. Please use a PDF with actual text content.",
      };
    }

    return {
      isValid: false,
      error: `PDF parsing failed: ${errorMessage}. Please ensure the PDF contains readable text and is not corrupted.`,
    };
  }
}

/**
 * Comprehensive file validation including PDF parsing check
 */
export async function validateFileWithParsing(
  file: File
): Promise<FileValidationResult> {
  // First do basic validation
  const basicValidation = validateFile(file);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // If it's a PDF, also validate parsing capability
  if (file.type === "application/pdf") {
    return await validatePDFParsing(file);
  }

  // For non-PDF files, basic validation is sufficient
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
