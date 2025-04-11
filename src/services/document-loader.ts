/**
 * Represents the content of a document.
 */
export interface DocumentContent {
  /**
   * The text content of the document.
   */
  text: string;
}

import {getDocument} from 'pdfjs-dist/lib/web/pdf_find_controller';
import {PDFDocumentProxy, renderTextLayer, TextContent} from 'pdfjs-dist';

/**
 * Asynchronously loads the content of a document from a file.
 *
 * @param file The document file.
 * @returns A promise that resolves to a DocumentContent object containing the text content.
 */
export async function getDocumentContent(file: File): Promise<DocumentContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target && event.target.result) {
        try {
          let text = '';
          if (file.type === 'application/pdf') {
            // Load and parse PDF content
            const pdfData = new Uint8Array(event.target.result as ArrayBuffer);
            const pdf: PDFDocumentProxy = await getDocument(pdfData).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              text += textContent.items.map(item => (item as any).str).join(' ') + '\n';
            }
          } else {
            // For other file types, read as plain text
            text = event.target.result.toString();
          }
          resolve({text});
        } catch (error: any) {
          console.error('Error processing document:', error);
          reject(new Error(`Failed to process document: ${error.message}`));
        }
      } else {
        reject(new Error('Failed to read file content.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
