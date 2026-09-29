import React, { useState } from 'react';
import { SWIFT_SOURCE_FILES, SwiftFileDefinition } from '../swiftCode/swiftFilesData';
import { exportXcodeProjectZip } from '../services/zipExporter';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  HelpCircle,
  Terminal,
  Cpu,
  ShieldCheck
} from 'lucide-react';

export const XcodeProjectExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SwiftFileDefinition>(
    SWIFT_SOURCE_FILES.find((f) => f.name === 'HomeView.swift') || SWIFT_SOURCE_FILES[0]
  );
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'viva'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await exportXcodeProjectZip();
    } catch (err) {
      console.error(err);
      alert('Failed to generate project zip.');
    } finally {
      setIsExporting(false);
    }
  };

  // Group files by category
  const categories = ['App', 'Models', 'Views', 'ViewModels', 'Services', 'Resources'] as const;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Xcode Project & Swift Source Code
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                Swift 5 / SwiftUI
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Offline Apple PDFKit & Local String Matcher Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Code vs Viva Prep */}
          <div className="flex p-0.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'code' ? 'bg-teal-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Swift Files
            </button>
            <button
              onClick={() => setActiveTab('viva')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                activeTab === 'viva' ? 'bg-teal-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Project Viva Q&A</span>
            </button>
          </div>

          {/* Download Zip */}
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-900/30"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Packing Zip...' : 'Download Xcode Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'viva' ? (
        /* Project Presentation / Viva Defense Panel */
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Project Presentation & Viva Defense Guide
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Concise, high-scoring technical explanations prepared for project reviews, examiners, and evaluators.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">1</span>
                  Why did you choose Apple&apos;s native PDFKit instead of third-party libraries?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  PDFKit is Apple&apos;s official first-party framework bundled natively with iOS since iOS 11. Using PDFKit eliminates external third-party dependencies (like CocoaPods or Carthage), ensures zero security vulnerabilities, guarantees 100% offline execution without cloud APIs, and utilizes Apple&apos;s hardware acceleration for parsing text glyphs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">2</span>
                  How does PDF text extraction work in PDFTextExtractor.swift?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  We instantiate <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">PDFDocument(url:)</code> with security-scoped resource access. We iterate across pages with <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">for index in 0..&lt;document.pageCount</code>, calling <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">page.string</code>. If total extracted character length is zero across all pages, we detect a raster/scanned image PDF and display: <em>&ldquo;This PDF does not contain readable text. OCR support can be added in a future version.&rdquo;</em>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">3</span>
                  How is the local symptom matching algorithm implemented?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">SymptomMatcher.swift</code> tokenizes the user&apos;s query into distinct lowercase keywords. It segments the extracted PDF page into logical paragraphs. For every paragraph, it calculates keyword presence, extracts potential medicine names, creates surrounding context snippets, and uses a page-signature set to deduplicate results. Everything operates entirely on device CPU memory without cloud latency or subscription fees.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-bold">4</span>
                  How does the application comply with medical safety guidelines?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  The application adheres strictly to medical non-diagnosis guidelines: it never synthesizes clinical diagnoses, does not prescribe drugs, never calculates dosages, and always labels displayed content with: <em>&ldquo;Information shown here is retrieved from the PDF provided by the user.&rdquo;</em> Prominent disclaimers instruct users to consult registered physicians.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Code Workspace */
        <div className="flex-1 flex overflow-hidden">
          {/* File Sidebar Tree */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/40 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/80 text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>PROJECT NAVIGATOR</span>
              <span className="text-[10px] font-mono text-slate-500">
                {SWIFT_SOURCE_FILES.length} files
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
              {categories.map((category) => {
                const files = SWIFT_SOURCE_FILES.filter((f) => f.category === category);
                if (files.length === 0) return null;

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <FolderOpen className="w-3.5 h-3.5 text-teal-400/80" />
                      <span>{category}</span>
                    </div>

                    <div className="space-y-0.5 pl-3">
                      {files.map((file) => {
                        const isSelected = selectedFile.path === file.path;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                              isSelected
                                ? 'bg-teal-500/20 text-teal-300 font-medium'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                            <span className="truncate">{file.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Root README */}
              <div className="pt-2 border-t border-slate-800/60">
                {SWIFT_SOURCE_FILES.filter((f) => f.path === 'README.md').map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedFile.path === file.path
                        ? 'bg-teal-500/20 text-teal-300 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">README.md</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Viewer Main Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
            {/* File Path & Copy Toolbar */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-slate-400 truncate">{selectedFile.path}</span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline truncate max-w-sm">
                  {selectedFile.description}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-xs shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-teal-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Swift Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 select-text">
              <pre className="flex">
                <code className="text-slate-600 select-none pr-4 text-right border-r border-slate-800 inline-block font-mono">
                  {selectedFile.content.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </code>
                <code className="pl-4 text-slate-200 whitespace-pre overflow-x-auto inline-block flex-1">
                  {selectedFile.content}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
