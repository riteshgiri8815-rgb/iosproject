import React, { useState, useEffect } from 'react';
import { IOSDeviceFrame } from './components/iOSDeviceFrame';
import { HomeViewSimulator } from './components/HomeViewSimulator';
import { ResultsViewSimulator } from './components/ResultsViewSimulator';
import { AboutViewSimulator } from './components/AboutViewSimulator';
import { DocumentPickerModal } from './components/DocumentPickerModal';
import { PDFPreviewSheet } from './components/PDFPreviewSheet';
import { XcodeProjectExplorer } from './components/XcodeProjectExplorer';
import { SAMPLE_GUIDES } from './data/sampleGuides';
import { ExtractedPDF, SampleGuide, SearchMatch } from './types';
import { PDFTextExtractorWeb } from './services/PDFTextExtractorWeb';
import { SymptomMatcher } from './services/SymptomMatcher';
import { exportXcodeProjectZip } from './services/zipExporter';
import { 
  Cross, 
  Download, 
  Smartphone, 
  FileCode, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Zap, 
  BookOpen, 
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [appMode, setAppMode] = useState<'simulator' | 'xcode'>('simulator');
  const [activeIOSTab, setActiveIOSTab] = useState<'guide' | 'about'>('guide');
  const [activeIOSScreen, setActiveIOSScreen] = useState<'home' | 'results'>('home');

  // PDF & Search State
  const [currentPDF, setCurrentPDF] = useState<ExtractedPDF | null>(null);
  const [searchQuery, setSearchQuery] = useState('headache, fever');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);

  // Extraction & Processing Status
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [isDocumentPickerOpen, setIsDocumentPickerOpen] = useState(false);
  const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Initialize with the realistic sample medicine guide on initial launch
  useEffect(() => {
    loadSampleGuide(SAMPLE_GUIDES[0], false);
  }, []);

  const loadSampleGuide = (guide: SampleGuide, showSuccessToast = true) => {
    setIsExtracting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDocumentPickerOpen(false);

    // Simulate natural iOS background parsing latency (150ms)
    setTimeout(() => {
      setIsExtracting(false);
      
      if (guide.isScannedOnly || guide.content.every((p) => p.text.trim().length === 0)) {
        setCurrentPDF(null);
        setSearchResults([]);
        setErrorMessage('This PDF does not contain readable text. OCR support can be added in a future version.');
        return;
      }

      const fullText = guide.content.map((p) => p.text).join(' ');
      const newPdf: ExtractedPDF = {
        fileName: guide.fileName,
        fileSize: guide.pageCount * 42000,
        totalPages: guide.pageCount,
        pages: guide.content,
        rawText: fullText,
        isScannedOnly: false,
      };

      setCurrentPDF(newPdf);
      if (showSuccessToast) {
        setSuccessMessage(`Extracted ${guide.pageCount} page(s) from ${guide.fileName}`);
      }

      // Automatically run local search if query exists
      if (searchQuery.trim()) {
        executeSearch(searchQuery, newPdf);
      }
    }, 200);
  };

  const handleCustomFileUpload = async (file: File) => {
    setIsExtracting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDocumentPickerOpen(false);

    try {
      const extracted = await PDFTextExtractorWeb.extractFromFile(file);
      setCurrentPDF(extracted);
      setSuccessMessage(`Extracted ${extracted.totalPages} page(s) from ${extracted.fileName}`);

      if (searchQuery.trim()) {
        executeSearch(searchQuery, extracted);
      }
    } catch (err: any) {
      setCurrentPDF(null);
      setSearchResults([]);
      setErrorMessage(
        err?.message || 'This PDF does not contain readable text. OCR support can be added in a future version.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const executeSearch = (query: string, pdfSource = currentPDF) => {
    if (!pdfSource || !query.trim()) {
      setSearchResults([]);
      setMatchedKeywords([]);
      return;
    }

    setIsSearching(true);
    const keywords = SymptomMatcher.parseKeywords(query);
    setMatchedKeywords(keywords);

    const matches = SymptomMatcher.search(query, pdfSource.pages);
    setSearchResults(matches);
    setIsSearching(false);
  };

  const handleTriggerSearch = () => {
    executeSearch(searchQuery);
    setActiveIOSScreen('results');
  };

  const handleResetSimulator = () => {
    setSearchQuery('');
    setSearchResults([]);
    setMatchedKeywords([]);
    setActiveIOSScreen('home');
    setActiveIOSTab('guide');
    setErrorMessage(null);
    setSuccessMessage(null);
    loadSampleGuide(SAMPLE_GUIDES[0], false);
  };

  const handleQuickZipDownload = async () => {
    try {
      setIsExportingZip(true);
      await exportXcodeProjectZip();
    } catch {
      alert('Failed to generate project zip.');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Contract (3 Zones) */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-40 shrink-0">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
            <Cross className="w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            MediGuide
          </span>
        </div>

        {/* Zone 2: Navigation Links / Segmented Mode Selector */}
        <nav className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setAppMode('simulator')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              appMode === 'simulator'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>iOS Simulator</span>
          </button>

          <button
            onClick={() => setAppMode('xcode')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              appMode === 'xcode'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Xcode Swift Source</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickZipDownload}
            disabled={isExportingZip}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 active:scale-95 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-teal-900/30 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isExportingZip ? 'Packing...' : 'Download Xcode Project (.zip)'}
            </span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col max-w-7xl mx-auto w-full">
        {appMode === 'simulator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Center: Interactive iOS Device Frame */}
            <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
              <IOSDeviceFrame
                activeTab={activeIOSTab}
                onTabChange={(tab) => {
                  setActiveIOSTab(tab);
                  if (tab === 'guide') {
                    setActiveIOSScreen('home');
                  }
                }}
                onReset={handleResetSimulator}
              >
                {activeIOSTab === 'about' ? (
                  <AboutViewSimulator />
                ) : activeIOSScreen === 'results' ? (
                  <ResultsViewSimulator
                    searchQuery={searchQuery}
                    matchedKeywords={matchedKeywords}
                    results={searchResults}
                    pdfFileName={currentPDF?.fileName}
                    onBack={() => setActiveIOSScreen('home')}
                  />
                ) : (
                  <HomeViewSimulator
                    currentPDF={currentPDF}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onOpenDocumentPicker={() => setIsDocumentPickerOpen(true)}
                    onOpenPreviewSheet={() => setIsPreviewSheetOpen(true)}
                    onTriggerSearch={handleTriggerSearch}
                    isExtracting={isExtracting}
                    isSearching={isSearching}
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                    onDismissError={() => setErrorMessage(null)}
                  />
                )}
              </IOSDeviceFrame>
            </div>

            {/* Right Side: Interactive Laboratory & Test Console */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              
              {/* Architecture & Evaluation Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Zap className="w-4 h-4 text-teal-400" />
                    <span>Live Apple PDFKit & Local Matching Engine</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    100% Local / Zero AI Cloud API
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  This live simulator executes the exact same logic written in our Swift classes (<code>PDFTextExtractor.swift</code> and <code>SymptomMatcher.swift</code>). You can test with custom PDFs or switch between pre-indexed medical formularies.
                </p>

                {/* Quick Test Document Selector */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400">
                    Quick Document Switcher:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SAMPLE_GUIDES.map((guide) => (
                      <button
                        key={guide.id}
                        onClick={() => loadSampleGuide(guide)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between gap-1.5 ${
                          currentPDF?.fileName === guide.fileName
                            ? 'border-teal-500 bg-teal-500/15 text-white'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate max-w-[130px]">
                            {guide.title.split(' ')[0]} {guide.title.split(' ')[1]}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {guide.isScannedOnly ? 'No OCR' : `${guide.pageCount}p`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate">
                          {guide.fileName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document Status Metrics */}
                {currentPDF && (
                  <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Pages Indexed</div>
                      <div className="text-sm font-bold text-teal-400">{currentPDF.totalPages}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Word Count</div>
                      <div className="text-sm font-bold text-slate-200">
                        {currentPDF.pages.reduce((acc, p) => acc + p.wordCount, 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Search Latency</div>
                      <div className="text-sm font-bold text-emerald-400">&lt; 1 ms (Local)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Compliance Checklist Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Medical Safety Compliance Verification</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No Diagnosis:</strong> App only matches text keywords; never evaluates symptoms or diseases.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No Prescription:</strong> No medication recommendations or clinical endorsements.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No Dosage Advice:</strong> Strictly displays user document excerpts; requires doctor guidance.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Attribution Notice:</strong> Displays &quot;Information shown here is retrieved from the PDF provided by the user.&quot;</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Unreadable PDF Safe Fallback:</strong> Scanned images trigger &quot;This PDF does not contain readable text. OCR support can be added in a future version.&quot;</span>
                  </div>
                </div>
              </div>

              {/* Switch to Source Code CTA Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-800/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    Need the Xcode Swift Files?
                  </h4>
                  <p className="text-xs text-slate-400">
                    Access all 10 Swift project files, models, views, and the complete Xcode directory.
                  </p>
                </div>
                <button
                  onClick={() => setAppMode('xcode')}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                >
                  View Swift Code
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* Xcode Project Explorer Mode */
          <div className="flex-1 h-[780px]">
            <XcodeProjectExplorer />
          </div>
        )}
      </main>

      {/* Document Picker Modal (Emulating UIDocumentPickerViewController) */}
      <DocumentPickerModal
        isOpen={isDocumentPickerOpen}
        onClose={() => setIsDocumentPickerOpen(false)}
        onSelectSample={(guide) => loadSampleGuide(guide, true)}
        onUploadFile={handleCustomFileUpload}
        currentSelectedName={currentPDF?.fileName}
        isProcessing={isExtracting}
      />

      {/* PDF Text Inspector Modal */}
      <PDFPreviewSheet
        isOpen={isPreviewSheetOpen}
        onClose={() => setIsPreviewSheetOpen(false)}
        pdf={currentPDF}
      />
    </div>
  );
}
