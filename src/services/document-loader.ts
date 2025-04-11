/**
 * Represents the content of a document.
 */
export interface DocumentContent {
  /**
   * The text content of the document.
   */
  text: string;
}

/**
 * Asynchronously loads the content of a document from a file.
 *
 * @param file The document file.
 * @returns A promise that resolves to a DocumentContent object containing the text content.
 */
export async function getDocumentContent(file: File): Promise<DocumentContent> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const text = event.target.result.toString();
        resolve({ text });
      } else {
        reject(new Error('Failed to read file content.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    if (file.type === 'application/pdf') {
      // For PDF files, attempt to load using a library like pdfjs-dist if needed.
      // This is a placeholder; replace with actual PDF parsing logic.
      reader.readAsDataURL(file); // Or use a PDF parsing library.
      reject(new Error('PDF parsing not yet implemented.'));

    } else {
      reader.readAsText(file); // Try reading as plain text.
    }
  });
}
