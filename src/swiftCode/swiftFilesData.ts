export interface SwiftFileDefinition {
  path: string;
  name: string;
  category: 'App' | 'Models' | 'Views' | 'ViewModels' | 'Services' | 'Resources';
  description: string;
  content: string;
}

export const SWIFT_SOURCE_FILES: SwiftFileDefinition[] = [
  {
    path: 'MediGuide/App/MediGuideApp.swift',
    name: 'MediGuideApp.swift',
    category: 'App',
    description: 'The main entry point for the MediGuide iOS application. Sets up the shared ViewModel and loads ContentView.',
    content: `//
//  MediGuideApp.swift
//  MediGuide
//
//  Created for MediGuide: PDF-Based Medicine Information & Symptom Guide.
//  Target Platform: iOS 16.0+
//  Framework: SwiftUI, PDFKit
//

import SwiftUI

@main
struct MediGuideApp: App {
    // Shared ViewModel instantiated at app launch to maintain state across views
    @StateObject private var viewModel = MediGuideViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
                .preferredColorScheme(.light) // Clean clinical light aesthetic
        }
    }
}
`
  },
  {
    path: 'MediGuide/Models/SearchResult.swift',
    name: 'SearchResult.swift',
    category: 'Models',
    description: 'Data model representing a localized text match from the user-provided PDF, including page number and matched keywords.',
    content: `//
//  SearchResult.swift
//  MediGuide
//
//  Represents a single match found within the user's PDF document.
//

import Foundation

public struct SearchResult: Identifiable, Hashable {
    public let id: UUID
    public let pageNumber: Int
    public let medicineName: String?
    public let matchedKeywords: [String]
    public let snippet: String
    public let fullSectionText: String
    public let relevanceScore: Int
    
    public init(
        id: UUID = UUID(),
        pageNumber: Int,
        medicineName: String? = nil,
        matchedKeywords: [String],
        snippet: String,
        fullSectionText: String,
        relevanceScore: Int = 1
    ) {
        self.id = id
        self.pageNumber = pageNumber
        self.medicineName = medicineName
        self.matchedKeywords = matchedKeywords
        self.snippet = snippet
        self.fullSectionText = fullSectionText
        self.relevanceScore = relevanceScore
    }
}

public struct PDFPageContent: Identifiable, Hashable {
    public let id = UUID()
    public let pageNumber: Int
    public let text: String
    public let wordCount: Int
    
    public init(pageNumber: Int, text: String) {
        self.pageNumber = pageNumber
        self.text = text
        self.wordCount = text.split(whereSeparator: { $0.isWhitespace }).count
    }
}
`
  },
  {
    path: 'MediGuide/Models/MedicineEntry.swift',
    name: 'MedicineEntry.swift',
    category: 'Models',
    description: 'Lightweight model used when a distinct medicine title/heading is identified within matching PDF paragraphs.',
    content: `//
//  MedicineEntry.swift
//  MediGuide
//
//  Represents an identified medicinal item extracted from the document.
//

import Foundation

public struct MedicineEntry: Identifiable, Hashable {
    public let id: UUID
    public let name: String
    public let indicationKeywords: [String]
    public let sourcePage: Int
    public let rawExcerpt: String
    
    public init(
        id: UUID = UUID(),
        name: String,
        indicationKeywords: [String],
        sourcePage: Int,
        rawExcerpt: String
    ) {
        self.id = id
        self.name = name
        self.indicationKeywords = indicationKeywords
        self.sourcePage = sourcePage
        self.rawExcerpt = rawExcerpt
    }
}
`
  },
  {
    path: 'MediGuide/Services/PDFTextExtractor.swift',
    name: 'PDFTextExtractor.swift',
    category: 'Services',
    description: 'Core PDFKit service that opens the local PDF file, iterates through every page, and extracts readable text.',
    content: `//
//  PDFTextExtractor.swift
//  MediGuide
//
//  Reusable PDFKit service to extract readable text page-by-page from local files.
//  Handles scanned/image-only PDFs gracefully without crashing.
//

import Foundation
import PDFKit

public enum PDFExtractorError: LocalizedError {
    case fileAccessFailed
    case unreadableDocument
    case noReadableTextFound
    
    public var errorDescription: String? {
        switch self {
        case .fileAccessFailed:
            return "Unable to access the selected PDF file. Please ensure iOS permissions are granted."
        case .unreadableDocument:
            return "The selected document is not a valid PDF or is password protected."
        case .noReadableTextFound:
            return "This PDF does not contain readable text. OCR support can be added in a future version."
        }
    }
}

public final class PDFTextExtractor {
    
    public static let shared = PDFTextExtractor()
    
    private init() {}
    
    /// Extracts readable text page-by-page from a given local PDF URL.
    /// Runs asynchronously on a background thread to keep SwiftUI interface fluid.
    public func extractText(from url: URL) async throws -> [PDFPageContent] {
        return try await Task.detached(priority: .userInitiated) {
            // Start security-scoped resource access if document picker provided a scoped URL
            let hasSecurityScope = url.startAccessingSecurityScopedResource()
            defer {
                if hasSecurityScope {
                    url.stopAccessingSecurityScopedResource()
                }
            }
            
            guard let pdfDocument = PDFDocument(url: url) else {
                throw PDFExtractorError.unreadableDocument
            }
            
            let totalPages = pdfDocument.pageCount
            guard totalPages > 0 else {
                throw PDFExtractorError.unreadableDocument
            }
            
            var extractedPages: [PDFPageContent] = []
            var totalExtractedCharacterCount = 0
            
            for index in 0..<totalPages {
                guard let page = pdfDocument.page(at: index) else { continue }
                let pageNumber = index + 1
                
                // PDFKit extracts the string representation of text glyphs on the page
                let pageText = page.string?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
                
                totalExtractedCharacterCount += pageText.count
                
                extractedPages.append(PDFPageContent(
                    pageNumber: pageNumber,
                    text: pageText
                ))
            }
            
            // Check if document was scanned/raster image only (zero readable text glyphs)
            guard totalExtractedCharacterCount > 0 else {
                throw PDFExtractorError.noReadableTextFound
            }
            
            return extractedPages
        }.value
    }
}
`
  },
  {
    path: 'MediGuide/Services/SymptomMatcher.swift',
    name: 'SymptomMatcher.swift',
    category: 'Services',
    description: 'Beginner-friendly local keyword search engine. Case-insensitive, supports multiple keywords, avoids duplicate results.',
    content: `//
//  SymptomMatcher.swift
//  MediGuide
//
//  Local, beginner-friendly matching engine.
//  Operates completely offline without cloud APIs or AI models.
//

import Foundation

public final class SymptomMatcher {
    
    public static let shared = SymptomMatcher()
    
    private init() {}
    
    /// Splits user input into distinct, normalized keywords.
    /// Handles commas, slashes, spaces, and punctuation.
    public func parseKeywords(from query: String) -> [String] {
        let cleaned = query.lowercased()
        let separators = CharacterSet(charactersIn: ",;+/|\\n\\t ")
        
        return cleaned
            .components(separatedBy: separators)
            .map { $0.trimmingCharacters(in: .punctuationCharacters.union(.whitespaces)) }
            .filter { $0.count >= 2 }
    }
    
    /// Searches extracted PDF pages for occurrences of the symptom keywords.
    /// Returns sorted, deduplicated search results.
    public func search(query: String, in pages: [PDFPageContent]) -> [SearchResult] {
        let keywords = parseKeywords(from: query)
        guard !keywords.isEmpty, !pages.isEmpty else { return [] }
        
        var results: [SearchResult] = []
        var seenSignatures = Set<String>()
        
        for page in pages {
            guard !page.text.isEmpty else { continue }
            
            // Divide page text into paragraphs or logical sections
            let paragraphs = page.text
                .components(separatedBy: "\\n\\n")
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                .filter { $0.count > 15 }
            
            // Fallback to single newlines if no double-newlines exist
            let sections = paragraphs.isEmpty ? page.text.components(separatedBy: "\\n") : paragraphs
            
            for section in sections {
                let lowerSection = section.lowercased()
                
                // Check which keywords match in this section
                let matched = keywords.filter { lowerSection.contains($0) }
                
                if !matched.isEmpty {
                    // Extract potential medicine name from beginning of line/paragraph
                    let candidateName = extractMedicineName(from: section)
                    
                    // Build a snippet around the matched keyword
                    let snippet = buildSnippet(from: section, keywords: matched)
                    
                    // Create deduplication key (page + first 60 chars)
                    let signature = "\\(page.pageNumber):\\(section.prefix(60).lowercased())"
                    
                    if !seenSignatures.contains(signature) {
                        seenSignatures.insert(signature)
                        
                        let score = (matched.count * 10) + (candidateName != nil ? 8 : 0)
                        
                        let result = SearchResult(
                            pageNumber: page.pageNumber,
                            medicineName: candidateName,
                            matchedKeywords: matched,
                            snippet: snippet,
                            fullSectionText: section,
                            relevanceScore: score
                        )
                        results.append(result)
                    }
                }
            }
        }
        
        // Sort primarily by relevance score descending, then by page number ascending
        return results.sorted {
            if $0.relevanceScore != $1.relevanceScore {
                return $0.relevanceScore > $1.relevanceScore
            }
            return $0.pageNumber < $1.pageNumber
        }
    }
    
    /// Helper to find medicine name from lines like "1. PARACETAMOL (ACETAMINOPHEN)"
    private func extractMedicineName(from section: String) -> String? {
        let lines = section.components(separatedBy: .newlines)
        guard let firstLine = lines.first?.trimmingCharacters(in: .whitespaces) else { return nil }
        
        // If line is short and uppercase or bold format, treat as candidate medicine title
        let cleanLine = firstLine.replacingOccurrences(of: "^\\\\d+\\\\.\\\\s*", with: "", options: .regularExpression)
        if cleanLine.count >= 3 && cleanLine.count <= 40 && !cleanLine.lowercased().contains("section") {
            return cleanLine
        }
        return nil
    }
    
    /// Builds a concise excerpt highlighting the surrounding context of the keyword
    private func buildSnippet(from text: String, keywords: [String]) -> String {
        let singleLine = text.replacingOccurrences(of: "\\\\s+", with: " ", options: .regularExpression)
        if singleLine.count <= 220 {
            return singleLine
        }
        
        let lower = singleLine.lowercased()
        var earliestIndex: String.Index? = nil
        var earliestKw = ""
        
        for kw in keywords {
            if let range = lower.range(of: kw) {
                if earliestIndex == nil || range.lowerBound < earliestIndex! {
                    earliestIndex = range.lowerBound
                    earliestKw = kw
                }
            }
        }
        
        guard let matchIndex = earliestIndex else {
            return String(singleLine.prefix(220)) + "..."
        }
        
        let startOffset = lower.distance(from: lower.startIndex, to: matchIndex)
        let leadChars = max(0, startOffset - 60)
        let trailChars = min(singleLine.count, startOffset + earliestKw.count + 130)
        
        let startIdx = singleLine.index(singleLine.startIndex, offsetBy: leadChars)
        let endIdx = singleLine.index(singleLine.startIndex, offsetBy: trailChars)
        
        var snippet = String(singleLine[startIdx..<endIdx])
        if leadChars > 0 { snippet = "..." + snippet }
        if trailChars < singleLine.count { snippet = snippet + "..." }
        
        return snippet
    }
}
`
  },
  {
    path: 'MediGuide/Services/PDFDocumentPicker.swift',
    name: 'PDFDocumentPicker.swift',
    category: 'Services',
    description: 'SwiftUI UIViewControllerRepresentable bridging iOS UIDocumentPickerViewController for selecting PDF files from the Files app.',
    content: `//
//  PDFDocumentPicker.swift
//  MediGuide
//
//  Bridges UIKit's UIDocumentPickerViewController to SwiftUI.
//  Restricts file selection strictly to PDF documents.
//

import SwiftUI
import UniformTypeIdentifiers

public struct PDFDocumentPicker: UIViewControllerRepresentable {
    
    public var onSelect: (URL) -> Void
    public var onCancel: (() -> Void)?
    
    public func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    public func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        // Open document picker restricted to PDF types
        let picker = UIDocumentPickerViewController(
            forOpeningContentTypes: [UTType.pdf],
            asCopy: true
        )
        picker.delegate = context.coordinator
        picker.allowsMultipleSelection = false
        return picker
    }
    
    public func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}
    
    public class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: PDFDocumentPicker
        
        init(_ parent: PDFDocumentPicker) {
            self.parent = parent
        }
        
        public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            guard let selectedURL = urls.first else { return }
            parent.onSelect(selectedURL)
        }
        
        public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
            parent.onCancel?()
        }
    }
}
`
  },
  {
    path: 'MediGuide/ViewModels/MediGuideViewModel.swift',
    name: 'MediGuideViewModel.swift',
    category: 'ViewModels',
    description: 'ObservableObject coordinating PDF loading, extraction state, symptom search query, and results.',
    content: `//
//  MediGuideViewModel.swift
//  MediGuide
//
//  Observable ViewModel managing PDF extraction state, search queries,
//  and local matching results across screens.
//

import Foundation
import SwiftUI

@MainActor
public class MediGuideViewModel: ObservableObject {
    
    // MARK: - Published State
    
    @Published public var selectedPDFName: String? = nil
    @Published public var selectedPDFURL: URL? = nil
    @Published public var extractedPages: [PDFPageContent] = []
    @Published public var totalPagesCount: Int = 0
    
    @Published public var searchQuery: String = ""
    @Published public var searchResults: [SearchResult] = []
    @Published public var searchedKeywordsList: [String] = []
    
    @Published public var isExtracting: Bool = false
    @Published public var isSearching: Bool = false
    @Published public var errorMessage: String? = nil
    @Published public var showErrorAlert: Bool = false
    @Published public var extractionSuccessMessage: String? = nil
    
    // Quick symptom chips for easy testing
    public let quickSymptomSuggestions = [
        "Headache", "Fever", "Cough", "Cold", "Stomach Pain", "Sore Throat", "Allergy"
    ]
    
    // MARK: - Initializer
    public init() {}
    
    // MARK: - PDF Selection & Extraction
    
    /// Handles user-selected PDF URL from Files picker
    public func processSelectedPDF(url: URL) {
        self.selectedPDFURL = url
        self.selectedPDFName = url.lastPathComponent
        self.errorMessage = nil
        self.extractionSuccessMessage = nil
        self.isExtracting = true
        self.searchResults = []
        
        Task {
            do {
                let pages = try await PDFTextExtractor.shared.extractText(from: url)
                self.extractedPages = pages
                self.totalPagesCount = pages.count
                self.isExtracting = false
                self.extractionSuccessMessage = "Successfully extracted \\(pages.count) page(s) from \\(url.lastPathComponent)."
            } catch {
                self.isExtracting = false
                self.extractedPages = []
                self.totalPagesCount = 0
                self.errorMessage = error.localizedDescription
                self.showErrorAlert = true
            }
        }
    }
    
    // MARK: - Search Execution
    
    /// Executes local keyword search on extracted PDF content
    public func performSearch() {
        let trimmed = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            searchResults = []
            searchedKeywordsList = []
            return
        }
        
        isSearching = true
        let keywords = SymptomMatcher.shared.parseKeywords(from: trimmed)
        self.searchedKeywordsList = keywords
        
        let results = SymptomMatcher.shared.search(query: trimmed, in: extractedPages)
        self.searchResults = results
        self.isSearching = false
    }
    
    public func selectSuggestionChip(_ symptom: String) {
        if searchQuery.isEmpty {
            searchQuery = symptom
        } else if !searchQuery.lowercased().contains(symptom.lowercased()) {
            searchQuery += ", \\(symptom)"
        }
    }
    
    public func resetDocument() {
        selectedPDFName = nil
        selectedPDFURL = nil
        extractedPages = []
        totalPagesCount = 0
        searchResults = []
        searchQuery = ""
        errorMessage = nil
        extractionSuccessMessage = nil
    }
}
`
  },
  {
    path: 'MediGuide/Views/HomeView.swift',
    name: 'HomeView.swift',
    category: 'Views',
    description: 'Home Screen featuring Upload PDF card, file status, symptom input TextField, quick suggestions, Search button, and safety disclaimer.',
    content: `//
//  HomeView.swift
//  MediGuide
//
//  Clean and modern SwiftUI Home Screen.
//  Includes PDF file status, symptom input, Search button, and safety disclaimer.
//

import SwiftUI

public struct HomeView: View {
    @EnvironmentObject private var viewModel: MediGuideViewModel
    @State private var showDocumentPicker = false
    @State private var navigateToResults = false
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    
                    // Header Branding
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 8) {
                            Image(systemName: "cross.case.fill")
                                .font(.title2)
                                .foregroundColor(.teal)
                            
                            Text("MediGuide")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.primary)
                        }
                        
                        Text("PDF-Based Medicine Information & Local Symptom Guide")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 8)
                    
                    // Safety Disclaimer Banner (Mandatory Medical Notice)
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.shield.fill")
                                .foregroundColor(.orange)
                            Text("Medical Safety Disclaimer")
                                .font(.footnote.weight(.semibold))
                                .foregroundColor(.primary)
                        }
                        
                        Text("This app does NOT diagnose diseases, prescribe medicines, or recommend dosage. It only retrieves and matches text from your uploaded PDF guide. Always consult a qualified medical professional for health decisions.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(14)
                    .background(Color.orange.opacity(0.08))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.orange.opacity(0.2), lineWidth: 1)
                    )
                    
                    // Section 1: Upload / Selected PDF Card
                    VStack(alignment: .leading, spacing: 12) {
                        Text("1. Medicine Reference PDF")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        if let pdfName = viewModel.selectedPDFName {
                            // Active PDF Card
                            HStack(spacing: 12) {
                                Image(systemName: "doc.text.fill")
                                    .font(.title2)
                                    .foregroundColor(.teal)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(pdfName)
                                        .font(.subheadline.weight(.semibold))
                                        .lineLimit(1)
                                    
                                    if viewModel.isExtracting {
                                        HStack(spacing: 6) {
                                            ProgressView()
                                                .scaleEffect(0.7)
                                            Text("Extracting PDF text...")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                    } else {
                                        Text("\\(viewModel.totalPagesCount) page(s) indexed for offline search")
                                            .font(.caption)
                                            .foregroundColor(.teal)
                                    }
                                }
                                
                                Spacer()
                                
                                Button("Change") {
                                    showDocumentPicker = true
                                }
                                .font(.caption.weight(.medium))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            }
                            .padding(14)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                            .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
                            
                        } else {
                            // Upload Button Placeholder
                            Button(action: { showDocumentPicker = true }) {
                                HStack(spacing: 12) {
                                    ZStack {
                                        Circle()
                                            .fill(Color.teal.opacity(0.12))
                                            .frame(width: 44, height: 44)
                                        Image(systemName: "arrow.up.doc.fill")
                                            .font(.system(size: 20))
                                            .foregroundColor(.teal)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Select Medicine PDF")
                                            .font(.headline)
                                            .foregroundColor(.primary)
                                        Text("Tap to choose document from iOS Files")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: "chevron.right")
                                        .foregroundColor(.secondary)
                                }
                                .padding(14)
                                .background(Color(.secondarySystemBackground))
                                .cornerRadius(12)
                            }
                        }
                    }
                    
                    // Section 2: Symptom Search Box
                    VStack(alignment: .leading, spacing: 12) {
                        Text("2. Search Symptoms or Keywords")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        HStack(spacing: 10) {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.secondary)
                            
                            TextField("e.g. headache, fever, cough, cold, stomach pain", text: $viewModel.searchQuery)
                                .font(.body)
                                .submitLabel(.search)
                                .onSubmit {
                                    triggerSearch()
                                }
                            
                            if !viewModel.searchQuery.isEmpty {
                                Button(action: { viewModel.searchQuery = "" }) {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(14)
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color(.systemGray4), lineWidth: 1)
                        )
                        
                        // Quick Symptom Suggestions
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Common symptoms to test:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(viewModel.quickSymptomSuggestions, id: \\.self) { symptom in
                                        Button(action: {
                                            viewModel.selectSuggestionChip(symptom)
                                        }) {
                                            Text(symptom)
                                                .font(.caption.weight(.medium))
                                                .foregroundColor(.primary)
                                                .padding(.horizontal, 10)
                                                .padding(.vertical, 6)
                                                .background(Color(.secondarySystemBackground))
                                                .cornerRadius(8)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Search Action Button
                    Button(action: triggerSearch) {
                        HStack {
                            Spacer()
                            if viewModel.isSearching {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Image(systemName: "magnifyingglass")
                                Text("Search Extracted PDF")
                                    .fontWeight(.semibold)
                            }
                            Spacer()
                        }
                        .padding(.vertical, 14)
                        .background(viewModel.extractedPages.isEmpty || viewModel.searchQuery.trimmingCharacters(in: .whitespaces).isEmpty ? Color.gray.opacity(0.4) : Color.teal)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .disabled(viewModel.extractedPages.isEmpty || viewModel.searchQuery.trimmingCharacters(in: .whitespaces).isEmpty)
                    
                    if viewModel.selectedPDFName == nil {
                        Text("Please upload a medicine PDF above to enable local search.")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(18)
            }
            .navigationTitle("MediGuide")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showDocumentPicker) {
                PDFDocumentPicker { pickedURL in
                    viewModel.processSelectedPDF(url: pickedURL)
                }
            }
            .navigationDestination(isPresented: $navigateToResults) {
                ResultsView()
            }
            .alert("Error Processing PDF", isPresented: $viewModel.showErrorAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage ?? "An unexpected error occurred.")
            }
        }
    }
    
    private func triggerSearch() {
        guard !viewModel.searchQuery.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        viewModel.performSearch()
        navigateToResults = true
    }
}
`
  },
  {
    path: 'MediGuide/Views/ResultsView.swift',
    name: 'ResultsView.swift',
    category: 'Views',
    description: 'Results Screen displaying entered keywords, matched medicine sections, page numbers, formatted snippets, and the mandatory PDF attribution message.',
    content: `//
//  ResultsView.swift
//  MediGuide
//
//  Displays matching medicine information extracted from the user's PDF.
//  Includes exact page numbers, highlighted search terms, and safety disclaimers.
//

import SwiftUI

public struct ResultsView: View {
    @EnvironmentObject private var viewModel: MediGuideViewModel
    @Environment(\\.dismiss) private var dismiss
    
    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                
                // Top Attribution Notice (Mandatory Requirement)
                HStack(spacing: 8) {
                    Image(systemName: "info.circle.fill")
                        .foregroundColor(.teal)
                    Text("Information shown here is retrieved from the PDF provided by the user.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.teal.opacity(0.08))
                .cornerRadius(10)
                
                // Searched Query Summary
                VStack(alignment: .leading, spacing: 8) {
                    Text("Searched Keywords")
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 6) {
                        ForEach(viewModel.searchedKeywordsList, id: \\.self) { kw in
                            Text(kw)
                                .font(.caption.weight(.medium))
                                .foregroundColor(.teal)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.teal.opacity(0.12))
                                .cornerRadius(6)
                        }
                    }
                }
                
                Divider()
                
                // Results List or Empty State
                if viewModel.searchResults.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass.circle")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        
                        Text("No matching information found")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text("No occurrences of \\"\\(viewModel.searchQuery)\\" were detected in \\(viewModel.selectedPDFName ?? "the uploaded PDF"). Try searching for alternate symptoms such as 'headache', 'fever', or 'pain'.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
                    
                } else {
                    Text("Found \\(viewModel.searchResults.count) relevant match(es) in document:")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.secondary)
                    
                    ForEach(viewModel.searchResults) { match in
                        VStack(alignment: .leading, spacing: 10) {
                            
                            // Header: Medicine Name & Page Badge
                            HStack {
                                if let medicineName = match.medicineName {
                                    Text(medicineName)
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                } else {
                                    Text("Relevant Document Section")
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                }
                                
                                Spacer()
                                
                                Text("Page \\(match.pageNumber)")
                                    .font(.caption.weight(.semibold))
                                    .foregroundColor(.teal)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.teal.opacity(0.12))
                                    .cornerRadius(6)
                            }
                            
                            // Matched snippet with clear formatting
                            Text(match.snippet)
                                .font(.body)
                                .foregroundColor(.primary)
                                .lineSpacing(3)
                            
                            // Matched keyword tags
                            HStack(spacing: 6) {
                                Text("Matched:")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                
                                ForEach(match.matchedKeywords, id: \\.self) { kw in
                                    Text(kw)
                                        .font(.caption2.weight(.semibold))
                                        .foregroundColor(.orange)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.orange.opacity(0.12))
                                        .cornerRadius(4)
                                }
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(12)
                    }
                }
                
                // Bottom Medical Safety Footnote
                VStack(alignment: .leading, spacing: 4) {
                    Text("Important Safety Notice:")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.secondary)
                    Text("This application does not prescribe medicines or determine dosage. Always read the original packaging and consult a registered doctor or pharmacist.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 10)
            }
            .padding(18)
        }
        .navigationTitle("Search Results")
        .navigationBarTitleDisplayMode(.inline)
    }
}
`
  },
  {
    path: 'MediGuide/Views/AboutView.swift',
    name: 'AboutView.swift',
    category: 'Views',
    description: 'About & Safety Screen explaining educational purpose, medical disclaimers, no prescription/dosage policy, and offline architecture.',
    content: `//
//  AboutView.swift
//  MediGuide
//
//  Comprehensive medical safety disclaimer and educational overview screen.
//

import SwiftUI

public struct AboutView: View {
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    
                    // App Brand Header
                    HStack(spacing: 12) {
                        Image(systemName: "shield.lefthalf.filled")
                            .font(.system(size: 36))
                            .foregroundColor(.teal)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("About MediGuide")
                                .font(.title2.weight(.bold))
                            Text("Version 1.0 · Offline Medicine Guide")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.top, 6)
                    
                    // Purpose of the Application
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Application Purpose")
                            .font(.headline)
                        
                        Text("MediGuide is an educational reference utility designed for offline reading and local text retrieval from user-supplied medicine leaflets, formulary guidelines, and pharmaceutical documentation. It is created for students and healthcare information searchers to quickly locate terms in large documents.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineSpacing(2)
                    }
                    
                    // Five Non-Negotiable Medical Rules
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Medical Safety Standards")
                            .font(.headline)
                        
                        SafetyPointRow(
                            icon: "xmark.octagon.fill",
                            color: .red,
                            title: "No Medical Diagnosis",
                            description: "The application does not diagnose diseases or evaluate health conditions."
                        )
                        
                        SafetyPointRow(
                            icon: "pills.fill",
                            color: .orange,
                            title: "No Prescriptions",
                            description: "The application does not prescribe medicines or endorse treatments."
                        )
                        
                        SafetyPointRow(
                            icon: "scalemass.fill",
                            color: .purple,
                            title: "No Dosage Determination",
                            description: "Dosage depends on age, weight, and renal condition. Never rely on search excerpts for dosage."
                        )
                        
                        SafetyPointRow(
                            icon: "person.crop.circle.badge.checkmark",
                            color: .blue,
                            title: "Consult Qualified Professionals",
                            description: "Always seek direct advice from a licensed physician, general practitioner, or pharmacist."
                        )
                        
                        SafetyPointRow(
                            icon: "wifi.slash",
                            color: .green,
                            title: "100% Offline & Private",
                            description: "No text or document leaves your iPhone. All PDF text extraction is processed locally via Apple PDFKit."
                        )
                    }
                    
                    // Technical Specifications for Evaluators
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Technical Architecture")
                            .font(.headline)
                        
                        VStack(alignment: .leading, spacing: 6) {
                            TechSpecRow(label: "UI Framework", value: "SwiftUI (iOS 16+)")
                            TechSpecRow(label: "PDF Engine", value: "Apple PDFKit (PDFDocument)")
                            TechSpecRow(label: "Matching Algorithm", value: "Tokenized Case-Insensitive String Search")
                            TechSpecRow(label: "Cloud / Server", value: "None (Zero network requirements)")
                            TechSpecRow(label: "Privacy", value: "Local sandboxed device storage")
                        }
                        .padding(14)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(10)
                    }
                }
                .padding(18)
            }
            .navigationTitle("About & Safety")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct SafetyPointRow: View {
    let icon: String
    let color: Color
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(color)
                .frame(width: 28)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.primary)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(.vertical, 4)
    }
}

private struct TechSpecRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.caption.weight(.medium))
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.caption.weight(.semibold))
                .foregroundColor(.primary)
        }
    }
}
`
  },
  {
    path: 'MediGuide/Views/ContentView.swift',
    name: 'ContentView.swift',
    category: 'Views',
    description: 'Main SwiftUI tab container combining HomeView and AboutView with native iOS navigation and styling.',
    content: `//
//  ContentView.swift
//  MediGuide
//
//  Root view hosting the primary TabView (Home and About & Safety).
//

import SwiftUI

public struct ContentView: View {
    @EnvironmentObject private var viewModel: MediGuideViewModel
    @State private var selectedTab: Int = 0
    
    public var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Guide", systemImage: "cross.case.fill")
                }
                .tag(0)
            
            AboutView()
                .tabItem {
                    Label("Safety & About", systemImage: "shield.fill")
                }
                .tag(1)
        }
        .tint(.teal)
    }
}
`
  },
  {
    path: 'MediGuide/Resources/Info.plist',
    name: 'Info.plist',
    category: 'Resources',
    description: 'iOS application configuration including file access permissions and document support.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>$(DEVELOPMENT_LANGUAGE)</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>com.example.mediguide.MediGuide</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>MediGuide</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSRequiresIPhoneOS</key>
    <true/>
    <key>UISupportsDocumentBrowser</key>
    <true/>
    <key>LSSupportsOpeningDocumentsInPlace</key>
    <true/>
    <key>UIFileSharingEnabled</key>
    <true/>
    <key>UILaunchScreen</key>
    <dict/>
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>armv7</string>
    </array>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
</dict>
</plist>
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'Resources',
    description: 'Step-by-step guide to run MediGuide in Xcode, build explanation, and student presentation viva defense notes.',
    content: `# MediGuide – PDF-Based Medicine Information & Symptom Guide

An offline-first iOS application built in **Swift 5** and **SwiftUI** using **Apple PDFKit**.

---

## 🎯 Project Overview
MediGuide enables users to:
1. Select/upload a local medicine reference PDF (e.g., drug formulary, OTC catalog).
2. Extract text page-by-page using Apple's native **PDFKit** framework.
3. Search for symptoms and keywords (e.g. \`headache\`, \`fever\`, \`cough\`, \`stomach pain\`).
4. Perform **100% local, offline matching** without any cloud backend or AI API.
5. Review matched medicine sections with page numbers and snippet context.
6. Clearly enforce a prominent **Medical Safety Disclaimer** (No diagnosis, no prescription, no dosage advice).

---

## 🛠 Project Architecture
\`\`\`
MediGuide/
├── App/
│   └── MediGuideApp.swift       # Application entry point with @StateObject
├── Models/
│   ├── MedicineEntry.swift      # Model for detected medicine sections
│   └── SearchResult.swift       # Result model with page numbers & snippets
├── Views/
│   ├── ContentView.swift        # Root TabView container
│   ├── HomeView.swift           # Upload PDF & symptom search screen
│   ├── ResultsView.swift        # Formatted matching results screen
│   └── AboutView.swift          # Medical disclaimers & safety compliance
├── ViewModels/
│   └── MediGuideViewModel.swift # ObservableObject coordinating state
├── Services/
│   ├── PDFDocumentPicker.swift  # UIViewControllerRepresentable for Files
│   ├── PDFTextExtractor.swift   # PDFKit text extraction engine
│   └── SymptomMatcher.swift     # Offline keyword search algorithm
└── Resources/
    ├── Info.plist               # iOS document and permission keys
    └── SampleMedicinesGuide.pdf # Sample reference PDF
\`\`\`

---

## 🚀 How to Run in Xcode

1. Open **Xcode** on your Mac.
2. Select **File > New > Project...**
3. Choose **iOS > App** and click **Next**.
4. Configure:
   - **Product Name**: \`MediGuide\`
   - **Interface**: \`SwiftUI\`
   - **Language**: \`Swift\`
5. Drag and drop the downloaded source files into your Xcode Project Navigator.
6. In **Signing & Capabilities**, select your free Apple ID Personal Team.
7. Choose an iOS Simulator (e.g., **iPhone 16 Pro**) or connect your physical iPhone.
8. Press **Cmd + R** to Build & Run!

---

## 🎓 Viva / Project Defense Answers

- **Q1: Why PDFKit instead of third-party libraries?**
  *Answer:* PDFKit is Apple's first-party, hardware-accelerated framework available since iOS 11. It requires zero CocoaPods/SPM dependencies, runs 100% offline, and securely accesses local documents.

- **Q2: How does text extraction work?**
  *Answer:* \`PDFDocument(url:)\` instantiates the document. We iterate from \`0..<pageCount\` and query \`page.string\`. If total character count is zero, we recognize it as a scanned/raster document and display: *"This PDF does not contain readable text. OCR support can be added in a future version."*

- **Q3: How does the matching engine avoid false positives?**
  *Answer:* \`SymptomMatcher\` cleans punctuation, lowercases strings, tokenizes terms, and searches localized paragraphs. Results are scored by matched keyword frequency and deduplicated by signature.

- **Q4: How is medical safety guaranteed?**
  *Answer:* The app strictly acts as a text retrieval tool for user-provided documents. It features clear disclaimers, never synthesizes diagnoses, and directs users to licensed medical practitioners.
`
  }
];
