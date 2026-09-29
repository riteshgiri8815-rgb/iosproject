import React, { useRef, useState } from 'react';
import { SAMPLE_GUIDES } from '../data/sampleGuides';
import { SampleGuide } from '../types';
import { FileUp, FileText, CheckCircle2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface DocumentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (guide: SampleGuide) => void;
  onUploadFile: (file: File) => void;
  currentSelectedName?: string;
  isProcessing?: boolean;
}

export const DocumentPickerModal: React.FC<DocumentPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onUploadFile,
  currentSelectedName,
  isProcessing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF document (.pdf).');
        return;
      }
      onUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please drop a valid PDF document (.pdf).');
        return;
      }
      onUploadFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* iOS Sheet Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Select Medicine PDF Document
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              iOS Files / UIDocumentPickerViewController
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Custom File Upload Drag & Drop Area */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Upload Your Own PDF
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragOver
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                  : 'border-slate-200 dark:border-slate-700/80 hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Click to browse or drop your PDF here
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Accepts pharmaceutical guides, leaflets, or formulary files
                </div>
              </div>
            </div>
          </div>

          {/* Built-in Sample PDFs */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Or Choose Built-in Sample PDF Guides
            </div>

            <div className="space-y-2.5">
              {SAMPLE_GUIDES.map((guide) => {
                const isSelected = currentSelectedName === guide.fileName;

                return (
                  <button
                    key={guide.id}
                    onClick={() => onSelectSample(guide)}
                    disabled={isProcessing}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 ring-1 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        guide.isScannedOnly
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                          : 'bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                      }`}
                    >
                      {guide.isScannedOnly ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {guide.title}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {guide.description}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <span>{guide.fileName}</span>
                        <span>·</span>
                        <span>{guide.pageCount} page(s)</span>
                        {guide.isScannedOnly && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              Tests unreadable PDF notice
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              <strong>Local Extraction Notice:</strong> In compliance with offline-first iOS architecture, PDFs are parsed entirely on your device with zero cloud uploads.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
