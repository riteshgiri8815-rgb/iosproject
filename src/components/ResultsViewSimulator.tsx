import React from 'react';
import { SearchMatch } from '../types';
import { 
  ChevronLeft, 
  Info, 
  Search, 
  FileText, 
  AlertCircle, 
  Share2, 
  ShieldCheck,
  CheckCircle,
  Pill
} from 'lucide-react';

interface ResultsViewSimulatorProps {
  searchQuery: string;
  matchedKeywords: string[];
  results: SearchMatch[];
  pdfFileName?: string;
  onBack: () => void;
}

export const ResultsViewSimulator: React.FC<ResultsViewSimulatorProps> = ({
  searchQuery,
  matchedKeywords,
  results,
  pdfFileName,
  onBack,
}) => {
  // Highlight keywords within text
  const highlightMatches = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text;

    // Build regex for all keywords
    const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isMatch = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark
            key={i}
            className="bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-semibold px-1 rounded-xs"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-sans text-slate-800 dark:text-slate-100 select-none pb-20">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors -ml-1 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>MediGuide</span>
        </button>

        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Search Results
        </span>

        <div className="w-12"></div>
      </div>

      {/* Mandatory Attribution Notice */}
      <div className="rounded-xl p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-teal-900 dark:text-teal-200">
          <strong>Source Attribution:</strong> Information shown here is retrieved directly from the PDF provided by the user (<em>{pdfFileName || 'Local Document'}</em>).
        </p>
      </div>

      {/* Searched Keywords Summary Header */}
      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Searched Symptoms & Keywords
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          {matchedKeywords.length > 0 ? (
            matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800"
              >
                <Search className="w-3 h-3 text-teal-600" />
                {kw}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic font-mono">{searchQuery}</span>
          )}
        </div>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center space-y-3 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-xs mx-auto">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              No matching information found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No occurrences of &ldquo;{searchQuery}&rdquo; were detected in{' '}
              {pdfFileName ? <code className="text-teal-600 dark:text-teal-400">{pdfFileName}</code> : 'the uploaded PDF'}.
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Try searching for alternate symptoms like <em>headache</em>, <em>fever</em>, <em>cough</em>, or <em>pain</em>.
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-2 px-4 py-2 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 rounded-lg hover:bg-teal-100"
          >
            Adjust Search Terms
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>
              Found {results.length} relevant section{results.length > 1 ? 's' : ''} in document:
            </span>
          </div>

          {results.map((match) => (
            <div
              key={match.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2.5 hover:border-teal-400/60 transition-all"
            >
              {/* Card Title & Page Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-750 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {match.medicineName || 'Relevant Document Section'}
                  </h3>
                </div>

                <div className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 text-[11px] font-semibold shrink-0">
                  Page {match.pageNumber}
                </div>
              </div>

              {/* Excerpt Snippet with Highlights */}
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                {highlightMatches(match.snippet, matchedKeywords)}
              </p>

              {/* Matched Tags & Relevancy */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400">Matched:</span>
                  {match.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium text-[10px]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                <span className="text-slate-400 text-[10px] font-mono">
                  Score: {match.relevanceScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Footnote */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient Safety Notice</span>
        </div>
        <p>
          Always read original medicine packaging. MediGuide does not endorse dosage or treatment choices. Consult a licensed physician or pharmacist for medical decisions.
        </p>
      </div>
    </div>
  );
};
