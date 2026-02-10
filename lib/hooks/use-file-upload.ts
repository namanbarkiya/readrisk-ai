import { useCallback, useState } from "react";
import { uploadFileToStorage, validateFile } from "@/lib/utils/file-upload";

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadSpeed: string;
  timeRemaining: string;
  isValidating?: boolean;
}

export interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (
    file: File
  ) => Promise<{ success: boolean; fileUrl?: string; error?: string }>;
  resetUpload: () => void;
  validateAndUpload: (
    file: File
  ) => Promise<{ success: boolean; fileUrl?: string; error?: string }>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadSpeed: "",
    timeRemaining: "",
    isValidating: false,
  });

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadSpeed: "",
      timeRemaining: "",
      isValidating: false,
    });
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const estimatedProgress = Math.min((elapsed / 5000) * 100, 95); // Assume 5 seconds for upload

        // Calculate upload speed
        const timeDiff = now - lastTime;
        if (timeDiff > 0) {
          const loadedDiff = (estimatedProgress / 100) * file.size - lastLoaded;
          const speed = loadedDiff / (timeDiff / 1000);
          const uploadSpeed = formatUploadSpeed(speed);

          // Calculate time remaining
          const remaining = file.size - (estimatedProgress / 100) * file.size;
          const timeRemaining = estimateTimeRemaining(remaining, speed);

          setUploadState((prev) => ({
            ...prev,
            progress: estimatedProgress,
            uploadSpeed,
            timeRemaining,
          }));

          lastLoaded = (estimatedProgress / 100) * file.size;
          lastTime = now;
        }
      }, 100);

      // Upload file to server
      const result = await uploadFileToStorage(file);

      clearInterval(progressInterval);

      if (result.success) {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 100,
          error: null,
        }));

        return result;
      } else {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: result.error || "Upload failed",
        }));

        return result;
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));

      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }, []);

  const validateAndUpload = useCallback(
    async (file: File) => {
      // Set validating state
      setUploadState((prev) => ({
        ...prev,
        isValidating: true,
        error: null,
      }));

      try {
        // First validate the file (size and type only on client)
        const validation = validateFile(file);

        if (!validation.isValid) {
          setUploadState((prev) => ({
            ...prev,
            isValidating: false,
            error: validation.error || "File validation failed",
          }));

          return {
            success: false,
            error: validation.error || "File validation failed",
          };
        }

        // If validation passes, proceed with upload
        setUploadState((prev) => ({
          ...prev,
          isValidating: false,
        }));

        return await uploadFile(file);
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          isValidating: false,
          error: error instanceof Error ? error.message : "Validation failed",
        }));

        return {
          success: false,
          error: error instanceof Error ? error.message : "Validation failed",
        };
      }
    },
    [uploadFile]
  );

  return {
    uploadState,
    uploadFile,
    resetUpload,
    validateAndUpload,
  };
}

// Helper function to format upload speed
function formatUploadSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return "0 B/s";

  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));

  return (
    parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  );
}

// Helper function to estimate time remaining
function estimateTimeRemaining(remaining: number, speed: number): string {
  if (speed === 0) return "Calculating...";

  const timeRemaining = remaining / speed;

  if (timeRemaining < 1000) return "Less than 1 second";
  if (timeRemaining < 60000) return `${Math.round(timeRemaining / 1000)}s`;

  const minutes = Math.round(timeRemaining / 60000);
  return `${minutes}m`;
}
