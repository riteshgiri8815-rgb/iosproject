import { ExtractedPDF, PDFPageContent } from '../types';

export class PDFTextExtractorWeb {
  /**
   * Extracts readable text page-by-page from an uploaded PDF File.
   * Mirrors the behavior of iOS PDFKit's PDFDocument text extraction.
   */
  static async extractFromFile(file: File): Promise<ExtractedPDF> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      return await this.extractFromArrayBuffer(arrayBuffer, file.name, file.size);
    } catch (error: any) {
      if (error?.message?.includes('OCR support') || error?.message?.includes('readable text')) {
        throw error;
      }
      throw new Error(`Failed to parse PDF document: ${error?.message || 'Invalid or corrupted file.'}`);
    }
  }

  static async extractFromArrayBuffer(
    buffer: ArrayBuffer,
    fileName: string,
    fileSize: number
  ): Promise<ExtractedPDF> {
    try {
      // Dynamic import to keep initial bundle lightweight and robust
      const pdfjs = await import('pdfjs-dist');
      
      // Configure worker if in browser
      if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
        // Use unpkg / cdnjs fallback or worker blob
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const pages: PDFPageContent[] = [];
      let fullTextCombined = '';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        const words = pageText.length > 0 ? pageText.split(/\s+/).length : 0;
        
        pages.push({
          pageNumber: pageNum,
          text: pageText,
          wordCount: words,
        });

        fullTextCombined += ' ' + pageText;
      }

      fullTextCombined = fullTextCombined.trim();

      // Check if document has readable text (scanned PDF detection)
      if (fullTextCombined.length === 0) {
        throw new Error('This PDF does not contain readable text. OCR support can be added in a future version.');
      }

      return {
        fileName,
        fileSize,
        totalPages,
        pages,
        rawText: fullTextCombined,
        isScannedOnly: false,
      };
    } catch (err: any) {
      if (err?.message?.includes('OCR support')) {
        throw err;
      }
      
      // Fallback: If pdfjs worker fails due to sandbox restrictions,
      // provide raw string extraction heuristic or throw graceful notice
      const fallbackText = this.fallbackRawStringExtractor(buffer);
      if (fallbackText && fallbackText.trim().length > 30) {
        return {
          fileName,
          fileSize,
          totalPages: 1,
          pages: [
            {
              pageNumber: 1,
              text: fallbackText,
              wordCount: fallbackText.split(/\s+/).length,
            },
          ],
          rawText: fallbackText,
        };
      }

      throw new Error('This PDF does not contain readable text. OCR support can be added in a future version.');
    }
  }

  /**
   * Resilient fallback binary ASCII text extractor for text streams in PDF
   */
  private static fallbackRawStringExtractor(buffer: ArrayBuffer): string {
    try {
      const bytes = new Uint8Array(buffer);
      let str = '';
      // Read chunks for ASCII printable characters
      const len = Math.min(bytes.length, 500000);
      for (let i = 0; i < len; i++) {
        const c = bytes[i];
        if ((c >= 32 && c <= 126) || c === 10 || c === 13) {
          str += String.fromCharCode(c);
        }
      }

      // Extract text within BT ... ET blocks if present
      const matches = str.match(/\(([^()]+)\)\s*Tj/g);
      if (matches && matches.length > 0) {
        return matches
          .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
          .join(' ');
      }
      return '';
    } catch {
      return '';
    }
  }
}
