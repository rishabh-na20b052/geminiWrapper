'use server';

/**
 * @fileOverview Implements a Genkit flow for voice chat completion, allowing users to speak to an AI agent
 * and receive spoken responses, using provided context to guide the conversation.
 *
 * - voiceChatCompletion - A function that handles the voice chat process.
 * - VoiceChatCompletionInput - The input type for the voiceChatCompletion function.
 * - VoiceChatCompletionOutput - The return type for the voiceChatCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceChatCompletionInputSchema = z.object({
  context: z.string().describe('Context to guide the conversation.'),
  query: z.string().describe('User query to the AI agent.'),
});
export type VoiceChatCompletionInput = z.infer<typeof VoiceChatCompletionInputSchema>;

const VoiceChatCompletionOutputSchema = z.object({
  media: z.string().describe('The audio response from the AI agent as a data URI.'),
});
export type VoiceChatCompletionOutput = z.infer<typeof VoiceChatCompletionOutputSchema>;

export async function voiceChatCompletion(input: VoiceChatCompletionInput): Promise<VoiceChatCompletionOutput> {
  return voiceChatCompletionFlow(input);
}

const voiceChatCompletionFlow = ai.defineFlow(
  {
    name: 'voiceChatCompletionFlow',
    inputSchema: VoiceChatCompletionInputSchema,
    outputSchema: VoiceChatCompletionOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: `${input.context}\nUser: ${input.query}`,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

