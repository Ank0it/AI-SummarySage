'use client';

import type {
  PDFDocumentProxy,
  TextContent,
} from 'pdfjs-dist/types/src/display/api';

export interface DocumentContent {
  text: string;
}

export async function getDocumentContent(
  file: File
): Promise<DocumentContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        let text = '';

        if (file.type === 'application/pdf') {
          const pdfjsLib = await import('pdfjs-dist/build/pdf');

          const pdfData = new Uint8Array(reader.result as ArrayBuffer);

          const pdf: PDFDocumentProxy = await pdfjsLib
            .getDocument({
              data: pdfData,
              disableWorker: true, // safe for text extraction
            })
            .promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = (await page.getTextContent()) as TextContent;

            text += content.items
              .map((item: any) => item.str)
              .join(' ') + '\n';
          }
        } else {
          text = reader.result as string;
        }

        resolve({ text });
      } catch (err) {
        console.error('PDF processing error:', err);
        reject(new Error('Failed to process document'));
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));

    file.type === 'application/pdf'
      ? reader.readAsArrayBuffer(file)
      : reader.readAsText(file);
  });
}
