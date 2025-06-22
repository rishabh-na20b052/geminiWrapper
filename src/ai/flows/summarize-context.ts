'use server';

/**
 * @fileOverview Summarizes the context provided by the user, whether it's text or images.
 *
 * - summarizeContext - A function that summarizes the context.
 * - SummarizeContextInput - The input type for the summarizeContext function.
 * - SummarizeContextOutput - The return type for the summarizeContext function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {genkit} from 'genkit';
import {z} from 'genkit';

const SummarizeContextInputSchema = z.object({
  apiKey: z.string().optional(),
  context: z.string().describe('The context to summarize, can be text or image data URI.'),
});
export type SummarizeContextInput = z.infer<typeof SummarizeContextInputSchema>;

const SummarizeContextOutputSchema = z.object({
  summary: z.string().describe('The summarized context.'),
});
export type SummarizeContextOutput = z.infer<typeof SummarizeContextOutputSchema>;

export async function summarizeContext(input: SummarizeContextInput): Promise<SummarizeContextOutput> {
  const { apiKey, ...promptInput } = input;
  if (apiKey) {
    const customAi = genkit({
      plugins: [googleAI({ apiKey })],
      model: 'googleai/gemini-1.5-flash-latest',
    });
    const customPrompt = customAi.definePrompt({
      name: 'summarizeContextPrompt_custom',
      input: { schema: z.object({ context: z.string() }) },
      output: { schema: SummarizeContextOutputSchema },
      prompt: `Summarize the following context in a concise and informative way:\n\n{{#if (startsWith context "data:")}}\n  Context (Image):\n  {{media url=context}}\n{{else}}\n  Context (Text):\n{{{context}}}\n{{/if}}\n`,
    });
    const { output } = await customPrompt({ ...promptInput, startsWith });
    return output!;
  }
  return summarizeContextFlow(promptInput);
}

const prompt = ai.definePrompt({
  name: 'summarizeContextPrompt',
  input: {schema: SummarizeContextInputSchema.omit({apiKey: true})},
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
    inputSchema: SummarizeContextInputSchema.omit({apiKey: true}),
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
