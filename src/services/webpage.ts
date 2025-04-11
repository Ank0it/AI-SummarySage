/**
 * Represents the content of a web page.
 */
export interface WebPageContent {
  /**
   * The text content of the web page.
   */
  text: string;
}

/**
 * Asynchronously retrieves the content of a web page.
 *
 * @param url The URL of the web page.
 * @returns A promise that resolves to a WebPageContent object containing the text content.
 */
export async function getWebPageContent(url: string): Promise<WebPageContent> {
  return new Promise((resolve, reject) => {
    // Simulate an API call with a 1-second delay
    setTimeout(() => {
      const sampleWebPageContent = `This is the content from the web page: ${url}.`;
      resolve({ text: sampleWebPageContent });
    }, 1000);
  });
}
