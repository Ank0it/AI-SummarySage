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
  // TODO: Implement this by calling an API.
  return {
    text: 'This is sample document content.'
  };
}
