// =====================================================
// DOCUMENT TEXT EXTRACTION UTILITY
// =====================================================
// Handles multiple file types with appropriate extraction methods
// =====================================================
import { PDFExtractionResult, extractPDFFromURL } from "./pdf-extractor";

export interface DocumentExtractionResult {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    language?: string;
    title?: string;
    author?: string;
    subject?: string;
    fileType: string;
    extractionMethod: string;
  };
}

/**
 * Extract text content from document URL based on file type
 */
export async function extractDocumentContent(
  fileUrl: string,
  fileType: string
): Promise<DocumentExtractionResult> {
  try {
    console.log("📄 [DOCUMENT EXTRACTOR] Starting document extraction...");
    console.log("📄 [DOCUMENT EXTRACTOR] File URL:", fileUrl);
    console.log("📄 [DOCUMENT EXTRACTOR] File Type:", fileType);

    const normalizedFileType = fileType.toLowerCase();
    console.log(
      "📄 [DOCUMENT EXTRACTOR] Normalized file type:",
      normalizedFileType
    );

    let result: DocumentExtractionResult;

    // Handle MIME types and file extensions
    if (
      normalizedFileType === "pdf" ||
      normalizedFileType === "application/pdf"
    ) {
      console.log("📄 [DOCUMENT EXTRACTOR] Using PDF extraction method");
      result = await extractPDFContent(fileUrl);
    } else if (
      normalizedFileType === "docx" ||
      normalizedFileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("📄 [DOCUMENT EXTRACTOR] Using DOCX extraction method");
      result = await extractDOCXContent(fileUrl);
    } else if (
      normalizedFileType === "xlsx" ||
      normalizedFileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      console.log("📄 [DOCUMENT EXTRACTOR] Using XLSX extraction method");
      result = await extractXLSXContent(fileUrl);
    } else if (
      normalizedFileType === "txt" ||
      normalizedFileType === "text/plain"
    ) {
      console.log("📄 [DOCUMENT EXTRACTOR] Using TXT extraction method");
      result = await extractTXTContent(fileUrl);
    } else {
      console.log("📄 [DOCUMENT EXTRACTOR] Using generic extraction method");
      result = await extractGenericContent(fileUrl, fileType);
    }

    console.log(
      "✅ [DOCUMENT EXTRACTOR] Document extraction completed successfully"
    );
    console.log(
      "📊 [DOCUMENT EXTRACTOR] Final result metadata:",
      result.metadata
    );

    return result;
  } catch (error) {
    console.error("❌ [DOCUMENT EXTRACTOR] Document extraction error:", error);
    throw new Error(
      `Failed to extract content from ${fileType} document: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract content from PDF files
 */
async function extractPDFContent(
  fileUrl: string
): Promise<DocumentExtractionResult> {
  console.log("📄 [DOCUMENT EXTRACTOR] Starting PDF content extraction...");

  try {
    const pdfResult = await extractPDFFromURL(fileUrl);

    console.log(
      "📄 [DOCUMENT EXTRACTOR] PDF extraction completed successfully"
    );
    console.log(
      "📄 [DOCUMENT EXTRACTOR] PDF text length:",
      pdfResult.text.length
    );
    console.log(
      "📄 [DOCUMENT EXTRACTOR] PDF word count:",
      pdfResult.metadata.wordCount
    );

    return {
      text: pdfResult.text,
      metadata: {
        pageCount: pdfResult.metadata.pageCount,
        wordCount: pdfResult.metadata.wordCount,
        language: pdfResult.metadata.language || "en",
        title: pdfResult.metadata.title,
        author: pdfResult.metadata.author,
        subject: pdfResult.metadata.subject,
        fileType: "pdf",
        extractionMethod: "pdf-parse-new",
      },
    };
  } catch (error) {
    console.error("📄 [DOCUMENT EXTRACTOR] PDF extraction failed:", error);

    // Fail immediately - no fallbacks
    throw new Error(
      `PDF parsing failed: ${error instanceof Error ? error.message : "Unknown error"}. Please fix your PDF document or convert it to a text file or DOCX format. The document may be corrupted, password-protected, or contain only images.`
    );
  }
}

/**
 * Extract content from DOCX files
 */
async function extractDOCXContent(
  fileUrl: string
): Promise<DocumentExtractionResult> {
  const mammoth = await import("mammoth");
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch DOCX file: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return {
    text: result.value,
    metadata: {
      wordCount: result.value.split(/\s+/).filter((word) => word.length > 0)
        .length,
      language: "en",
      fileType: "docx",
      extractionMethod: "mammoth",
    },
  };
}

/**
 * Extract content from XLSX files
 */
async function extractXLSXContent(
  fileUrl: string
): Promise<DocumentExtractionResult> {
  // For XLSX files, we'll try to extract text content
  // In a production environment, you might want to use a library like 'xlsx' for better extraction
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch XLSX file: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();

  return {
    text: text.substring(0, 50000), // Limit for spreadsheet content
    metadata: {
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      language: "en",
      fileType: "xlsx",
      extractionMethod: "text-extraction",
    },
  };
}

/**
 * Extract content from TXT files
 */
async function extractTXTContent(
  fileUrl: string
): Promise<DocumentExtractionResult> {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch TXT file: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();

  return {
    text: text,
    metadata: {
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      language: "en",
      fileType: "txt",
      extractionMethod: "direct-text",
    },
  };
}

/**
 * Extract content from generic/unknown file types
 */
async function extractGenericContent(
  fileUrl: string,
  fileType: string
): Promise<DocumentExtractionResult> {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file: ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();

  return {
    text: text.substring(0, 50000), // Limit for unknown file types
    metadata: {
      wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
      language: "en",
      fileType: fileType,
      extractionMethod: "fallback-text",
    },
  };
}

/**
 * Validate if the file type is supported
 */
export function isSupportedFileType(fileType: string): boolean {
  const supportedTypes = [
    "pdf",
    "application/pdf",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "txt",
    "text/plain",
  ];
  return supportedTypes.includes(fileType.toLowerCase());
}

/**
 * Get the recommended extraction method for a file type
 */
export function getExtractionMethod(fileType: string): string {
  const normalizedFileType = fileType.toLowerCase();

  if (
    normalizedFileType === "pdf" ||
    normalizedFileType === "application/pdf"
  ) {
    return "pdf-parse-new";
  } else if (
    normalizedFileType === "docx" ||
    normalizedFileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "mammoth";
  } else if (
    normalizedFileType === "xlsx" ||
    normalizedFileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "xlsx-parser";
  } else if (
    normalizedFileType === "txt" ||
    normalizedFileType === "text/plain"
  ) {
    return "direct-text";
  } else {
    return "fallback-text";
  }
}
