import React from 'react';
import { 
  ShieldCheck, 
  XOctagon, 
  Pill, 
  Scale, 
  UserCheck, 
  WifiOff, 
  FileCode2, 
  Info,
  BookOpen
} from 'lucide-react';

export const AboutViewSimulator: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-sans text-slate-800 dark:text-slate-100 select-none pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            About & Safety
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Educational Purpose & Clinical Safeguards
          </p>
        </div>
      </div>

      {/* Purpose of the Application */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
          <BookOpen className="w-4 h-4 text-teal-600" />
          <span>Purpose of MediGuide</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          MediGuide is an educational reference application created to demonstrate local, offline document parsing using Apple&apos;s <strong>PDFKit</strong> framework. It assists students and healthcare researchers in quickly locating keywords and symptoms within approved medical leaflets or formulary guidelines uploaded by the user.
        </p>
      </div>

      {/* Non-Negotiable Medical Standards */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Clinical Safety Standards
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <XOctagon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                1. Does Not Diagnose Diseases
              </h4>
              <p className="text-[11px] leading-relaxed text-rose-800/90 dark:text-rose-300/80 mt-0.5">
                The software does not perform differential diagnosis or clinical evaluation of health conditions.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                2. Does Not Prescribe Medicines
              </h4>
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                The app never recommends or prescribes drug regimens or therapeutic treatments.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                3. Does Not Determine Dosage
              </h4>
              <p className="text-[11px] leading-relaxed text-purple-800/90 dark:text-purple-300/80 mt-0.5">
                Dosage calculations depend on individual age, weight, and renal status. Search snippets must not be used for dosing.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                4. Mandatory Professional Consultation
              </h4>
              <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300/80 mt-0.5">
                Users must consult a licensed physician, general practitioner, or certified pharmacist for any medical advice.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                5. 100% Offline & Private
              </h4>
              <p className="text-[11px] leading-relaxed text-teal-800/90 dark:text-teal-300/80 mt-0.5">
                Zero internet connection required. No telemetry, no cloud backend, and no external AI models. All operations run locally on the device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specs for Project Evaluators */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <FileCode2 className="w-4 h-4 text-teal-600" />
          <span>Xcode Technical Specifications</span>
        </div>
        <div className="text-xs space-y-1.5 font-mono text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Framework:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">SwiftUI (iOS 16+)</span>
          </div>
          <div className="flex justify-between">
            <span>PDF Engine:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">Apple PDFKit</span>
          </div>
          <div className="flex justify-between">
            <span>Matching:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">SymptomMatcher.swift</span>
          </div>
          <div className="flex justify-between">
            <span>Picker:</span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">UIDocumentPickerViewController</span>
          </div>
        </div>
      </div>
    </div>
  );
};
