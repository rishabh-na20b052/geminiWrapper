'use server';

/**
 * @fileOverview Summarizes the context provided by the user, whether it's text or images.
 *
 * - summarizeContext - A function that summarizes the context.
 * - SummarizeContextInput - The input type for the summarizeContext function.
 * - SummarizeContextOutput - The return type for the summarizeContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContextInputSchema = z.object({
  context: z.string().describe('The context to summarize, can be text or image data URI.'),
});
export type SummarizeContextInput = z.infer<typeof SummarizeContextInputSchema>;

const SummarizeContextOutputSchema = z.object({
  summary: z.string().describe('The summarized context.'),
});
export type SummarizeContextOutput = z.infer<typeof SummarizeContextOutputSchema>;

export async function summarizeContext(input: SummarizeContextInput): Promise<SummarizeContextOutput> {
  return summarizeContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContextPrompt',
  input: {schema: SummarizeContextInputSchema},
  output: {schema: SummarizeContextOutputSchema},
  prompt: `Summarize the following context in a concise and informative way:\n\n{{#if (startsWith context "data:")}}
  Context (Image):
  {{media url=context}}
{{else}}
  Context (Text):\n{{{context}}}\n{{/if}}
`,
});

function startsWith(str: string, prefix: string): boolean {
  return str.startsWith(prefix);
}

const summarizeContextFlow = ai.defineFlow(
  {
    name: 'summarizeContextFlow',
    inputSchema: SummarizeContextInputSchema,
    outputSchema: SummarizeContextOutputSchema,
  },
  async input => {
    const {output} = await prompt( {
      ...input,
      startsWith
    });
    return output!;
  }
);
