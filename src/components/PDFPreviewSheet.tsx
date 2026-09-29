import React, { useState } from 'react';
import { ExtractedPDF } from '../types';
import { X, FileText, ChevronLeft, ChevronRight, Hash, Layers } from 'lucide-react';

interface PDFPreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pdf: ExtractedPDF | null;
}

export const PDFPreviewSheet: React.FC<PDFPreviewSheetProps> = ({ isOpen, onClose, pdf }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen || !pdf) return null;

  const activePage = pdf.pages.find((p) => p.pageNumber === currentPage) || pdf.pages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                {pdf.fileName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PDFKit Extracted Raw Text Stream · {pdf.totalPages} Total Pages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Page Switcher Navigation */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>
              Page <strong className="font-semibold text-slate-900 dark:text-slate-100">{currentPage}</strong> of {pdf.totalPages}
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              {activePage?.wordCount || 0} words extracted
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pdf.totalPages, p + 1))}
              disabled={currentPage >= pdf.totalPages}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white dark:bg-slate-900/90 select-text">
          {activePage?.text ? (
            activePage.text
          ) : (
            <div className="py-12 text-center text-slate-400 italic">
              No readable text glyphs found on this page.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            <span>Character count: {activePage?.text.length || 0}</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
