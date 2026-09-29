import { PDFPageContent, SearchMatch } from '../types';

export class SymptomMatcher {
  /**
   * Parses the search input string into individual clean search keywords.
   * Handles commas, slashes, spaces, and punctuation.
   */
  static parseKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .split(/[,;/+&|\n\t]+|\s+/)
      .map((k) => k.trim().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, ''))
      .filter((k) => k.length >= 2);
  }

  /**
   * Searches extracted PDF page contents for given symptom keywords.
   * 100% offline, local matching engine matching iOS Swift logic.
   */
  static search(keywordsInput: string | string[], pages: PDFPageContent[]): SearchMatch[] {
    const rawKeywords =
      typeof keywordsInput === 'string'
        ? this.parseKeywords(keywordsInput)
        : keywordsInput.map((k) => k.toLowerCase().trim()).filter((k) => k.length >= 2);

    if (rawKeywords.length === 0 || pages.length === 0) {
      return [];
    }

    const results: SearchMatch[] = [];
    const seenSignatures = new Set<string>();

    for (const page of pages) {
      if (!page.text || page.text.trim().length === 0) continue;

      // Split page content into structural blocks or paragraphs
      const paragraphs = page.text
        .split(/(?:\r?\n){2,}|(?<=\.)\s{2,}|(?=\b\d+\.\s+[A-Z])|(?=SECTION\s+\d+:)/g)
        .map((p) => p.trim())
        .filter((p) => p.length > 20);

      // If text didn't break into multi-paragraphs, split by lines or sentences
      const blocks = paragraphs.length > 0 ? paragraphs : page.text.split(/(?<=[.!?])\s+/);

      for (const block of blocks) {
        const lowerBlock = block.toLowerCase();
        const matched = rawKeywords.filter((kw) => lowerBlock.includes(kw));

        if (matched.length > 0) {
          // Identify potential medicine name at the beginning of the block
          const medicineName = this.extractMedicineName(block);

          // Build a readable context snippet
          const snippet = this.buildSnippet(block, matched);

          // Create a deduplication signature (combines page and normalized text fragment)
          const signature = `${page.pageNumber}:${block.slice(0, 80).toLowerCase().replace(/\s+/g, ' ')}`;

          if (!seenSignatures.has(signature)) {
            seenSignatures.add(signature);

            // Relevance score: higher if multiple keywords match and if medicine name exists
            const relevanceScore =
              matched.length * 10 +
              (medicineName ? 8 : 0) +
              (lowerBlock.includes('indication') || lowerBlock.includes('relief') ? 5 : 0);

            results.push({
              id: `match-p${page.pageNumber}-${results.length + 1}`,
              pageNumber: page.pageNumber,
              medicineName,
              matchedKeywords: matched,
              snippet,
              fullParagraph: block,
              relevanceScore,
            });
          }
        }
      }
    }

    // Sort by relevance score descending, then by page number ascending
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore || a.pageNumber - b.pageNumber);
  }

  /**
   * Helper to detect medicine names or section headers in the matched block
   */
  private static extractMedicineName(block: string): string | undefined {
    // Look for patterns like "1. PARACETAMOL (ACETAMINOPHEN)" or "PARACETAMOL" or "IBUPROFEN"
    const numberedPattern = /(?:^\s*\d+\.\s+)?([A-Z0-9\s\-\/]{3,35}(?:\([A-Z0-9\s\-\/]+\))?)/m;
    const match = block.match(numberedPattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ensure it's not a generic word like "SECTION" or "ESSENTIAL"
      if (
        !candidate.startsWith('SECTION') &&
        !candidate.startsWith('ESSENTIAL') &&
        !candidate.startsWith('PAGE') &&
        candidate.length >= 3 &&
        candidate.length <= 40
      ) {
        return candidate;
      }
    }
    return undefined;
  }

  /**
   * Extracts a focused snippet around the first matched keyword
   */
  private static buildSnippet(text: string, matchedKeywords: string[]): string {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length <= 260) {
      return cleanText;
    }

    // Find the earliest occurrence of any matched keyword
    let earliestIndex = cleanText.length;
    let foundWord = '';
    const lower = cleanText.toLowerCase();

    for (const kw of matchedKeywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1 && idx < earliestIndex) {
        earliestIndex = idx;
        foundWord = kw;
      }
    }

    if (earliestIndex === cleanText.length) {
      return cleanText.slice(0, 260) + '...';
    }

    // Window around match
    const start = Math.max(0, earliestIndex - 70);
    const end = Math.min(cleanText.length, earliestIndex + foundWord.length + 140);

    let snippet = cleanText.slice(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < cleanText.length) snippet = snippet + '...';

    return snippet;
  }
}
