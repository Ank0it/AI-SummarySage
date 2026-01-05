declare module 'pdfjs-dist/build/pdf' {
  import type {
    PDFDocumentProxy,
  } from 'pdfjs-dist/types/src/display/api';

  export interface DocumentInitParameters {
    data?: Uint8Array | ArrayBuffer;
    url?: string;
    disableWorker?: boolean;
  }

  export function getDocument(
    src: DocumentInitParameters
  ): {
    promise: Promise<PDFDocumentProxy>;
  };
}
