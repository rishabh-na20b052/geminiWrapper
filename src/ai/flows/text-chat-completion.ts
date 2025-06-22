'use server';

/**
 * @fileOverview An AI agent for text-based conversation with context.
 *
 * - textChatCompletion - A function that handles the text chat completion process.
 * - TextChatCompletionInput - The input type for the textChatCompletion function.
 * - TextChatCompletionOutput - The return type for the textChatCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TextChatCompletionInputSchema = z.object({
  context: z.string().describe('The context for the conversation.'),
  message: z.string().describe('The user message.'),
});
export type TextChatCompletionInput = z.infer<typeof TextChatCompletionInputSchema>;

const TextChatCompletionOutputSchema = z.object({
  response: z.string().describe('The AI agent response.'),
});
export type TextChatCompletionOutput = z.infer<typeof TextChatCompletionOutputSchema>;

export async function textChatCompletion(input: TextChatCompletionInput): Promise<TextChatCompletionOutput> {
  return textChatCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textChatCompletionPrompt',
  input: {schema: TextChatCompletionInputSchema},
  output: {schema: TextChatCompletionOutputSchema},
  prompt: `You are a helpful AI assistant. Use the context provided to respond to the user's message.\n\nContext: {{{context}}}\n\nUser Message: {{{message}}}\n\nResponse: `,
});

const textChatCompletionFlow = ai.defineFlow(
  {
    name: 'textChatCompletionFlow',
    inputSchema: TextChatCompletionInputSchema,
    outputSchema: TextChatCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
