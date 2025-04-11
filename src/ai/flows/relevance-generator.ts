'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating the relevance or importance of a text.
 *
 * - generateRelevance - A function that generates the relevance of a text.
 * - RelevanceGeneratorInput - The input type for the generateRelevance function.
 * - RelevanceGeneratorOutput - The return type for the generateRelevance function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RelevanceGeneratorInputSchema = z.object({
  text: z.string().describe('The text to generate the relevance for.'),
});
export type RelevanceGeneratorInput = z.infer<typeof RelevanceGeneratorInputSchema>;

const RelevanceGeneratorOutputSchema = z.object({
  relevance: z.string().describe('The generated relevance of the text.'),
});
export type RelevanceGeneratorOutput = z.infer<typeof RelevanceGeneratorOutputSchema>;

export async function generateRelevance(input: RelevanceGeneratorInput): Promise<RelevanceGeneratorOutput> {
  return relevanceGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'relevanceGeneratorPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The text to generate the relevance for.'),
    }),
  },
  output: {
    schema: z.object({
      relevance: z.string().describe('The generated relevance of the text.'),
    }),
  },
  prompt: `You are an AI expert in determining the importance and relevance of a text.

  Generate a section explaining why the following text is important or relevant. Be concise.

  Text: {{{text}}}
  `,
});

const relevanceGeneratorFlow = ai.defineFlow<
  typeof RelevanceGeneratorInputSchema,
  typeof RelevanceGeneratorOutputSchema
>({
  name: 'relevanceGeneratorFlow',
  inputSchema: RelevanceGeneratorInputSchema,
  outputSchema: RelevanceGeneratorOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

