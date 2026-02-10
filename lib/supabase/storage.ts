// =====================================================
// SUPABASE STORAGE CONFIGURATION
// =====================================================
// File upload and storage management for RiskRead AI
// =====================================================
import type { FileUploadConfig, FileUploadResult } from "@/lib/types/analysis";
import { createClient } from "./client";

// =====================================================
// STORAGE CONFIGURATION
// =====================================================

export const STORAGE_CONFIG: FileUploadConfig = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"), // 10MB default
  supportedTypes: (
    process.env.NEXT_PUBLIC_SUPPORTED_FILE_TYPES || "pdf,docx,xlsx,txt"
  ).split(","),
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
};

export const STORAGE_BUCKETS = {
  ANALYSIS_FILES: "analysis-files",
} as const;

// =====================================================
// FILE VALIDATION UTILITIES
// =====================================================

export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > STORAGE_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `File size must be less than ${STORAGE_CONFIG.maxFileSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (
    !fileExtension ||
    !STORAGE_CONFIG.supportedTypes.includes(fileExtension)
  ) {
    return {
      isValid: false,
      error: `File type must be one of: ${STORAGE_CONFIG.supportedTypes.join(", ").toUpperCase()}`,
    };
  }

  // Check MIME type
  if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "File type not supported",
    };
  }

  return { isValid: true };
}

export function getFileTypeFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "unknown";
}

export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const sanitizedName = originalName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-zA-Z0-9-_]/g, "_");

  return `${userId}/${timestamp}_${sanitizedName}.${extension}`;
}

// =====================================================
// STORAGE OPERATIONS
// =====================================================

export async function uploadFile(
  file: File,
  userId: string
): Promise<FileUploadResult> {
  const supabase = createClient();

  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Generate file path
  const fileName = generateFileName(file.name, userId);
  const filePath = `${STORAGE_BUCKETS.ANALYSIS_FILES}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.ANALYSIS_FILES)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("File upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.ANALYSIS_FILES)
    .getPublicUrl(fileName);

  return {
    file_url: urlData.publicUrl,
    file_name: file.name,
    file_size: file.size,
    file_type: getFileTypeFromExtension(file.name),
  };
}

export async function deleteFile(filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.ANALYSIS_FILES)
    .remove([filePath]);

  if (error) {
    console.error("File deletion error:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function getFileUrl(filePath: string): Promise<string> {
  const supabase = createClient();

  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.ANALYSIS_FILES)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.ANALYSIS_FILES)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error("Signed URL creation error:", error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// =====================================================
// BUCKET MANAGEMENT
// =====================================================

export async function createAnalysisBucket(): Promise<void> {
  const supabase = createClient();

  // Check if bucket exists
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    console.error("Error listing buckets:", listError);
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const bucketExists = buckets?.some(
    (bucket) => bucket.name === STORAGE_BUCKETS.ANALYSIS_FILES
  );

  if (!bucketExists) {
    // Create bucket
    const { error: createError } = await supabase.storage.createBucket(
      STORAGE_BUCKETS.ANALYSIS_FILES,
      {
        public: false,
        allowedMimeTypes: STORAGE_CONFIG.allowedMimeTypes,
        fileSizeLimit: STORAGE_CONFIG.maxFileSize,
      }
    );

    if (createError) {
      console.error("Error creating bucket:", createError);
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
  }
}

export async function getBucketInfo(): Promise<{
  name: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: string[];
}> {
  const supabase = createClient();

  const { data, error } = await supabase.storage.getBucket(
    STORAGE_BUCKETS.ANALYSIS_FILES
  );

  if (error) {
    console.error("Error getting bucket info:", error);
    throw new Error(`Failed to get bucket info: ${error.message}`);
  }

  return {
    name: data.name,
    public: data.public,
    fileSizeLimit: data.fileSizeLimit,
    allowedMimeTypes: data.allowedMimeTypes,
  };
}

// =====================================================
// FILE METADATA OPERATIONS
// =====================================================

export async function getFileMetadata(filePath: string): Promise<{
  name: string;
  size: number;
  mimeType: string;
  lastAccessed: string;
  created: string;
  updated: string;
}> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.ANALYSIS_FILES)
    .list(filePath.split("/").slice(0, -1).join("/"), {
      limit: 1,
      offset: 0,
      search: filePath.split("/").pop(),
    });

  if (error) {
    console.error("Error getting file metadata:", error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }

  const file = data?.[0];
  if (!file) {
    throw new Error("File not found");
  }

  return {
    name: file.name,
    size: file.metadata?.size || 0,
    mimeType: file.metadata?.mimetype || "",
    lastAccessed: file.updated_at,
    created: file.created_at,
    updated: file.updated_at,
  };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const extension = filename.split(".").pop()?.toLowerCase();
  return imageExtensions.includes(extension || "");
}

export function isDocumentFile(filename: string): boolean {
  const documentExtensions = ["pdf", "doc", "docx", "txt"];
  const extension = filename.split(".").pop()?.toLowerCase();
  return documentExtensions.includes(extension || "");
}

export function isSpreadsheetFile(filename: string): boolean {
  const spreadsheetExtensions = ["xls", "xlsx", "csv"];
  const extension = filename.split(".").pop()?.toLowerCase();
  return spreadsheetExtensions.includes(extension || "");
}
