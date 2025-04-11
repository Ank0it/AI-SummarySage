/**
 * Represents the transcription of audio data.
 */
export interface Transcription {
  /**
   * The transcribed text.
   */
  text: string;
}

/**
 * Asynchronously transcribes audio data into text.
 *
 * @param audioData The audio data to transcribe.
 * @returns A promise that resolves to a Transcription object containing the transcribed text.
 */
export async function transcribeAudio(audioData: Blob): Promise<Transcription> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        // Simulate an API call with a 1-second delay
        setTimeout(() => {
          resolve({ text: 'This is a sample transcription from audio.' });
        }, 1000);
      } else {
        reject(new Error('Failed to read audio data.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read audio.'));
    };

    reader.readAsArrayBuffer(audioData);
  });
}
