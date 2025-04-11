/**
 * Represents the captions of a YouTube video.
 */
export interface Captions {
  /**
   * The text of the captions.
   */
  text: string;
}

/**
 * Asynchronously retrieves the captions of a YouTube video.
 *
 * @param videoUrl The URL of the YouTube video.
 * @returns A promise that resolves to a Captions object containing the captions.
 */
export async function getYoutubeCaptions(videoUrl: string): Promise<Captions> {
  return new Promise((resolve) => {
    // Simulate API call with a 1-second delay
    setTimeout(() => {
      const sampleCaptions = `These are the captions from the YouTube video: ${videoUrl}.`;
      resolve({ text: sampleCaptions });
    }, 1000);
  });
}
