declare module "pdf-parse-new" {
  interface PDFData {
    text: string;
    numpages: number;
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      CreationDate?: string;
      ModDate?: string;
      Creator?: string;
      Producer?: string;
    };
  }

  function pdfParse(
    buffer: Buffer,
    options?: {
      max?: number;
      version?: string;
    }
  ): Promise<PDFData>;

  export = pdfParse;
}
