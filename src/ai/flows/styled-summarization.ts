'use server';
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to be summarized.'),
  style: z.enum(['Formal', 'Casual', 'Bullet Points', 'Funny', 'Poetic', 'Gen-Z']),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The summarized text in the selected style.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  model: 'googleai/gemini-flash-latest',
  input: { schema: SummarizeTextInputSchema },
  output: { schema: SummarizeTextOutputSchema },
  prompt: `You are an expert text summarizer. Summarize the following text in the style of {{{style}}}.\n\nText: {{{text}}}`,
});

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
function localSummarize(text: string, style: SummarizeTextInput['style']): string {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 6);
  if (style === 'Bullet Points') return sentences.map(s => `• ${s.trim()}`).join('\n');
  if (style === 'Funny') return sentences.join(' ') + ' 😄';
  if (style === 'Poetic') return sentences.map(s => s.trim()).join('\n');
  return sentences.join(' ');
}

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  const txt = input.text?.trim();
  if (!txt) return { summary: 'Please provide text to summarize.' };

  try {
    const { output } = await prompt(input);
    return output!;
  } catch (error: any) {
    const status = error?.status || error?.code;
    const msg = error?.originalMessage || error?.message || '';

    // Respect rate-limit hints, then single retry
    if (String(status) === '429' || /Too Many Requests/i.test(msg)) {
      const retryFromText = msg.match(/retry in ([0-9.]+)s/i);
      const retryFromJson = msg.match(/"retryDelay":"(\d+)s"/i);
      const waitMs =
        retryFromText ? Math.ceil(parseFloat(retryFromText[1]) * 1000) :
        retryFromJson ? Math.ceil(parseFloat(retryFromJson[1]) * 1000) :
        60000;
      await sleep(waitMs);
      try {
        const { output } = await prompt(input);
        return output!;
      } catch {
        const fallback = localSummarize(txt, input.style);
        return { summary: `Rate limit hit. Try again later.\n\nLocal summary:\n\n${fallback}` };
      }
    }

    // Model/key issues: return local summary instead of throwing 500
    const fallback = localSummarize(txt, input.style);
    const label = /API key not valid|Model .* not found/i.test(msg)
      ? 'Model/API key issue'
      : 'Unexpected error';
    return { summary: `${label}. Showing local summary:\n\n${fallback}` };
  }
}
