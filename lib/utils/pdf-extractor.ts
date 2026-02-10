// =====================================================
// PDF TEXT EXTRACTION UTILITY
// =====================================================
// Uses pdf-parse-new library for reliable PDF text extraction
// =====================================================
import pdfParse from "pdf-parse-new";

export interface PDFExtractionResult {
  text: string;
  metadata: {
    pageCount: number;
    wordCount: number;
    language?: string;
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * Extract text content from PDF buffer
 */
export async function extractPDFText(
  pdfBuffer: Buffer
): Promise<PDFExtractionResult> {
  try {
    console.log("📄 [PDF EXTRACTOR] Starting pdf-parse-new extraction...");
    console.log("📄 [PDF EXTRACTOR] Buffer size:", pdfBuffer.length, "bytes");

    // Validate PDF header
    if (!isValidPDF(pdfBuffer)) {
      throw new Error("Invalid PDF file - missing PDF header");
    }

    // Try pdf-parse-new with different configurations
    let data;
    let parseError;

    // Try different configurations
    const configs = [
      { max: 0, version: "v2.0.0" },
      { max: 0 }, // No version specified
      { max: 10 }, // Limit to 10 pages
      {}, // Default configuration
    ];

    for (const config of configs) {
      try {
        console.log("📄 [PDF EXTRACTOR] Trying config:", config);
        data = await pdfParse(pdfBuffer, config);

        if (data && data.text && data.text.trim().length > 0) {
          console.log(
            "📄 [PDF EXTRACTOR] pdf-parse-new extraction successful with config:",
            config
          );
          break;
        } else {
          console.log("📄 [PDF EXTRACTOR] Config returned empty text:", config);
        }
      } catch (error) {
        parseError = error;
        console.log("📄 [PDF EXTRACTOR] Config failed:", config, error);
        continue;
      }
    }

    // If all configs failed
    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error(
        `PDF parsing failed with all configurations. Last error: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`
      );
    }

    console.log("📄 [PDF EXTRACTOR] PDF parsing completed");
    console.log(
      "📄 [PDF EXTRACTOR] Raw extracted text length:",
      data.text?.length || 0
    );
    console.log("📄 [PDF EXTRACTOR] Number of pages:", data.numpages || 0);
    console.log("📄 [PDF EXTRACTOR] PDF info:", data.info);

    // Log a sample of the raw text to debug
    if (data.text) {
      console.log(
        "📄 [PDF EXTRACTOR] Raw text sample (first 500 chars):",
        data.text.substring(0, 500)
      );
    }

    // Validate extracted text
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text content extracted from PDF");
    }

    // Clean the extracted text
    const cleanedText = cleanText(data.text);

    console.log("📄 [PDF EXTRACTOR] Cleaned text length:", cleanedText.length);

    // Log only first and last 200 chars to avoid binary data in logs
    if (cleanedText.length > 0) {
      console.log(
        "📄 [PDF EXTRACTOR] First 200 chars of cleaned text:",
        cleanedText.substring(0, 200)
      );
      console.log(
        "📄 [PDF EXTRACTOR] Last 200 chars of cleaned text:",
        cleanedText.substring(Math.max(0, cleanedText.length - 200))
      );
    }

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error("No text content found in PDF after cleaning");
    }

    const wordCount = cleanedText
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const language = detectLanguage(cleanedText);

    console.log("📄 [PDF EXTRACTOR] Word count:", wordCount);
    console.log("📄 [PDF EXTRACTOR] Detected language:", language);

    return {
      text: cleanedText,
      metadata: {
        pageCount: data.numpages || 1,
        wordCount: wordCount,
        language: language,
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
      },
    };
  } catch (error) {
    console.error("❌ [PDF EXTRACTOR] PDF extraction error:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}. Please try converting your PDF to a text file or DOCX format for better results.`
    );
  }
}

/**
 * Cleans extracted text from PDF
 */
function cleanText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove page numbers and headers/footers (common patterns)
      .replace(/Page \d+ of \d+/gi, "")
      .replace(/^\d+\s*$/gm, "")
      // Remove common document artifacts
      .replace(/\f/g, "") // Form feed characters
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n")
      // Remove excessive line breaks
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      // Remove PDF-specific artifacts
      .replace(/\/\w+\s+\d+\s+R/g, "") // PDF object references
      .replace(/<<[^>]*>>/g, "") // PDF dictionary objects
      .replace(/\/\w+\s+\[[^\]]*\]/g, "") // PDF array objects
      .replace(/stream[\s\S]*?endstream/g, "") // PDF stream objects
      .replace(/\/\w+\s+\d+\s+\d+\s+R/g, "") // PDF indirect object references
      // Remove encoded characters and artifacts
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .replace(/\\u[0-9a-fA-F]{4}/g, "") // Remove Unicode escape sequences
      .replace(/\\n/g, "\n") // Convert escaped newlines
      .replace(/\\t/g, "\t") // Convert escaped tabs
      .replace(/\\r/g, "\n") // Convert escaped carriage returns
      // Remove other common PDF artifacts
      .replace(/[^\w\s.,!?;:()\-'"]/g, "") // Keep only common punctuation and alphanumeric
      .replace(/\s+/g, " ") // Clean up any remaining multiple spaces
      .trim()
  );
}

/**
 * Extract text content from PDF URL
 */
export async function extractPDFFromURL(
  pdfUrl: string
): Promise<PDFExtractionResult> {
  try {
    console.log("📄 [PDF EXTRACTOR] Starting PDF extraction from URL:", pdfUrl);

    // Fetch the PDF file
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
    }

    console.log(
      "📄 [PDF EXTRACTOR] PDF fetched successfully, status:",
      response.status
    );
    console.log(
      "📄 [PDF EXTRACTOR] Content-Type:",
      response.headers.get("content-type")
    );
    console.log(
      "📄 [PDF EXTRACTOR] Content-Length:",
      response.headers.get("content-length")
    );

    // Get the PDF as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 [PDF EXTRACTOR] Buffer size:", buffer.length, "bytes");

    // Only log first few bytes to avoid binary data in logs
    const headerBytes = buffer.toString("hex", 0, 20);
    console.log(
      "📄 [PDF EXTRACTOR] Buffer header (first 20 bytes):",
      headerBytes
    );

    // Validate PDF
    if (!isValidPDF(buffer)) {
      console.error("📄 [PDF EXTRACTOR] Invalid PDF file - missing PDF header");
      throw new Error("Invalid PDF file - missing PDF header");
    }

    console.log("📄 [PDF EXTRACTOR] PDF header validated successfully");

    // Extract text from buffer
    const result = await extractPDFText(buffer);

    console.log("📄 [PDF EXTRACTOR] PDF extraction completed successfully");
    console.log(
      "📄 [PDF EXTRACTOR] Extracted text length:",
      result.text.length
    );
    console.log(
      "📄 [PDF EXTRACTOR] Number of pages:",
      result.metadata.pageCount
    );

    return result;
  } catch (error) {
    console.error("❌ [PDF EXTRACTOR] PDF URL extraction error:", error);
    throw new Error(
      `Failed to extract PDF from URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Simple language detection (basic implementation)
 */
function detectLanguage(text: string): string {
  // This is a basic implementation - in production you might want to use a proper language detection library
  const englishWords = [
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ];
  const spanishWords = [
    "el",
    "la",
    "de",
    "que",
    "y",
    "a",
    "en",
    "un",
    "es",
    "se",
    "no",
    "te",
  ];
  const frenchWords = [
    "le",
    "la",
    "de",
    "et",
    "un",
    "une",
    "des",
    "du",
    "que",
    "qui",
    "dans",
    "sur",
  ];

  const words = text.toLowerCase().split(/\s+/);
  const sampleSize = Math.min(100, words.length);
  const sample = words.slice(0, sampleSize);

  let englishCount = 0;
  let spanishCount = 0;
  let frenchCount = 0;

  sample.forEach((word) => {
    if (englishWords.includes(word)) englishCount++;
    if (spanishWords.includes(word)) spanishCount++;
    if (frenchWords.includes(word)) frenchCount++;
  });

  if (englishCount > spanishCount && englishCount > frenchCount) return "en";
  if (spanishCount > englishCount && spanishCount > frenchCount) return "es";
  if (frenchCount > englishCount && frenchCount > spanishCount) return "fr";

  return "en"; // Default to English
}

/**
 * Validate if the buffer contains a valid PDF
 */
export function isValidPDF(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  // Check PDF magic number
  const pdfHeader = buffer.toString("ascii", 0, 4);
  return pdfHeader === "%PDF";
}
