export interface PDFPageContent {
  pageNumber: number;
  text: string;
  wordCount: number;
}

export interface ExtractedPDF {
  fileName: string;
  fileSize: number;
  totalPages: number;
  pages: PDFPageContent[];
  rawText: string;
  isScannedOnly?: boolean;
}

export interface SearchMatch {
  id: string;
  pageNumber: number;
  medicineName?: string;
  matchedKeywords: string[];
  snippet: string;
  fullParagraph: string;
  relevanceScore: number;
}

export interface SampleGuide {
  id: string;
  title: string;
  fileName: string;
  description: string;
  pageCount: number;
  isScannedOnly?: boolean;
  content: PDFPageContent[];
}
