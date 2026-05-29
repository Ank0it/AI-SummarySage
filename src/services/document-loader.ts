'use client';

import type {PDFDocumentProxy, TextContent, TextItem} from 'pdfjs-dist/types/src/display/api';

export interface DocumentContent {
  text: string;
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isSupportedTextFile(file: File): boolean {
  const fileName = file.name.toLowerCase();

  return (
    file.type.startsWith('text/') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  );
}

function formatTextContent(content: TextContent): string {
  const lines: string[] = [];
  let currentLine = '';

  for (const item of content.items) {
    if (!('str' in item)) {
      continue;
    }

    const textItem = item as TextItem;
    currentLine += textItem.str;

    if (textItem.hasEOL) {
      const trimmedLine = currentLine.trim();
      if (trimmedLine.length > 0) {
        lines.push(trimmedLine);
      }
      currentLine = '';
    } else {
      currentLine += ' ';
    }
  }

  const trailingLine = currentLine.trim();
  if (trailingLine.length > 0) {
    lines.push(trailingLine);
  }

  return lines.join('\n').trim();
}

export async function getDocumentContent(
  file: File
): Promise<DocumentContent> {
  if (isPdfFile(file)) {
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

    try {
      const pdfData = await file.arrayBuffer();
      const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({
        data: pdfData,
      }).promise;

      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = (await page.getTextContent()) as TextContent;
        const pageText = formatTextContent(content);

        if (pageText.length > 0) {
          pages.push(pageText);
        }
      }

      const text = pages.join('\n\n').trim();

      if (text.length === 0) {
        throw new Error('No extractable text was found in this PDF. If this is a scanned or image-only PDF, OCR is required.');
      }

      return {text};
    } catch (error: unknown) {
      const pdfError = error as { name?: string; message?: string };

      if (pdfError?.name === 'PasswordException' || /password|encrypted/i.test(pdfError?.message ?? '')) {
        throw new Error('This PDF is password-protected or encrypted and cannot be parsed without a password.');
      }

      if (pdfError?.name === 'InvalidPDFException') {
        throw new Error('This PDF appears to be invalid or corrupted.');
      }

      throw new Error(pdfError?.message || 'Failed to process PDF.');
    }
  }

  if (!isSupportedTextFile(file)) {
    throw new Error('Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.');
  }

  const text = await file.text();

  if (text.trim().length === 0) {
    throw new Error('The selected file does not contain readable text.');
  }

  return {text};
}
