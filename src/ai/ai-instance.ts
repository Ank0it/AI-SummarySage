import "server-only";
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = (process.env.GOOGLE_GENAI_API_KEY ?? '').trim();

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey,
    }),
  ],
  model: 'googleai/gemini-flash-latest',
});

