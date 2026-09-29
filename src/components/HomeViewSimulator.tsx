import React from 'react';
import { ExtractedPDF } from '../types';
import { 
  Cross, 
  FileUp, 
  FileText, 
  Search, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Loader2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface HomeViewSimulatorProps {
  currentPDF: ExtractedPDF | null;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onOpenDocumentPicker: () => void;
  onOpenPreviewSheet: () => void;
  onTriggerSearch: () => void;
  isExtracting: boolean;
  isSearching: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onDismissError: () => void;
}

const COMMON_SYMPTOMS = [
  'Headache',
  'Fever',
  'Cough',
  'Cold',
  'Stomach Pain',
  'Sore Throat',
  'Allergy',
  'Dehydration',
  'Motion Sickness'
];

export const HomeViewSimulator: React.FC<HomeViewSimulatorProps> = ({
  currentPDF,
  searchQuery,
  onSearchQueryChange,
  onOpenDocumentPicker,
  onOpenPreviewSheet,
  onTriggerSearch,
  isExtracting,
  isSearching,
  errorMessage,
  successMessage,
  onDismissError,
}) => {
  const handleChipClick = (symptom: string) => {
    if (!searchQuery.trim()) {
      onSearchQueryChange(symptom);
    } else {
      const lower = searchQuery.toLowerCase();
      if (!lower.includes(symptom.toLowerCase())) {
        onSearchQueryChange(`${searchQuery.trim()}, ${symptom}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentPDF && searchQuery.trim()) {
      onTriggerSearch();
    }
  };

  const canSearch = Boolean(currentPDF && !isExtracting && searchQuery.trim().length > 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-sans text-slate-800 dark:text-slate-100 select-none pb-20">
      
      {/* Brand Header (SwiftUI Navigation Title Area) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs">
            <Cross className="w-5 h-5 fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            MediGuide
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          PDF-Based Medicine Information & Offline Symptom Guide
        </p>
      </div>

      {/* Mandatory Medical Safety Disclaimer Card */}
      <div className="rounded-xl p-3.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Medical Safety Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
              This application does <strong>NOT diagnose diseases</strong>, prescribe medicines, recommend dosage, or determine suitability for any individual. It strictly searches text from your uploaded PDF guide.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert Banner if unreadable or scanned PDF */}
      {errorMessage && (
        <div className="rounded-xl p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-rose-800 dark:text-rose-200">
              PDF Extraction Notice
            </div>
            <div className="text-rose-700 dark:text-rose-300 text-[11px] leading-normal">
              {errorMessage}
            </div>
          </div>
          <button
            onClick={onDismissError}
            className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Extraction Banner */}
      {successMessage && !errorMessage && (
        <div className="rounded-xl p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="truncate">{successMessage}</span>
        </div>
      )}

      {/* Section 1: Upload / Selected PDF Card */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>1. Medicine Reference PDF</span>
          {currentPDF && (
            <button
              onClick={onOpenPreviewSheet}
              className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View Extracted Text
            </button>
          )}
        </label>

        {currentPDF ? (
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {currentPDF.fileName}
                </div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>
                    {currentPDF.totalPages} page(s) indexed for offline search
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenDocumentPicker}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenDocumentPicker}
            disabled={isExtracting}
            className="w-full p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-white dark:bg-slate-800/40 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                {isExtracting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileUp className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isExtracting ? 'Extracting readable text...' : 'Select Medicine PDF'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Choose from Files or select sample formulary
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Section 2: Symptom Search Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          2. Enter Symptoms or Keywords
        </label>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. headache, fever, cough, cold, stomach pain"
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-2xs"
          />

          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Symptom Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-500" />
            <span>Tap quick symptom examples:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {COMMON_SYMPTOMS.map((symptom) => (
              <button
                key={symptom}
                onClick={() => handleChipClick(symptom)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-all"
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Search Action Button */}
      <div className="pt-2">
        <button
          onClick={onTriggerSearch}
          disabled={!canSearch}
          className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
            canSearch
              ? 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white shadow-teal-600/20'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching local PDF text...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Search Extracted PDF</span>
            </>
          )}
        </button>

        {!currentPDF && (
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Upload or select a medicine PDF above to activate local search.
          </p>
        )}
      </div>

      {/* Info Card on Local Processing */}
      <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-2">
        100% Offline Processing · Apple PDFKit Architecture · No Data Transmitted
      </div>
    </div>
  );
};
