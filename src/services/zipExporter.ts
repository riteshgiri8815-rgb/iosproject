import JSZip from 'jszip';
import { SWIFT_SOURCE_FILES } from '../swiftCode/swiftFilesData';

export async function exportXcodeProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder
  const root = zip.folder('MediGuide');
  if (!root) return;

  // Add all Swift and project files
  for (const file of SWIFT_SOURCE_FILES) {
    if (file.path === 'README.md') {
      zip.file('README.md', file.content);
    } else {
      root.file(file.path.replace(/^MediGuide\//, ''), file.content);
    }
  }

  // Add dummy placeholder sample PDF text so Xcode project builds smoothly
  const samplePdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 12 Tf
72 712 Td
(MediGuide Sample Medicine Leaflet: Paracetamol for headache and fever relief. Ibuprofen for inflammation.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000215 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
386
%%EOF`;

  root.file('Resources/SampleMedicinesGuide.pdf', samplePdfContent);

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MediGuide-Xcode-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
