'use server';
/**
 * @fileOverview A text summarization AI agent that allows users to choose a style for the summary.
 *
 * - summarizeText - A function that handles the text summarization process with style selection.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to be summarized.'),
  style: z
    .enum(['Formal', 'Casual', 'Bullet Points', 'Funny', 'Poetic', 'Gen-Z'])
    .describe('The desired style of the summary.'),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The summarized text in the selected style.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to be summarized.'),
      style: z
        .enum(['Formal', 'Casual', 'Bullet Points', 'Funny', 'Poetic', 'Gen-Z'])
        .describe('The desired style of the summary.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The summarized text in the selected style.'),
    }),
  },
  prompt: `You are an expert text summarizer. Summarize the following text in the style of {{{style}}}.\n\nText: {{{text}}}`,
});

const summarizeTextFlow = ai.defineFlow<
  typeof SummarizeTextInputSchema,
  typeof SummarizeTextOutputSchema
>({
  name: 'summarizeTextFlow',
  inputSchema: SummarizeTextInputSchema,
  outputSchema: SummarizeTextOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
