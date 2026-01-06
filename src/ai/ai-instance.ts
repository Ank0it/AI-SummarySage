import "server-only";
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = (process.env.GOOGLE_GENAI_API_KEY ?? '').trim();
console.log('GOOGLE_GENAI_API_KEY starts with:', apiKey.slice(0, 6), '*****');

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey,
    }),
  ],
  model: 'googleai/gemini-flash-latest',
});

