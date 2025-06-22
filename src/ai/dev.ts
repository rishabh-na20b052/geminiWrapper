import { config } from 'dotenv';
config();

import '@/ai/flows/text-chat-completion.ts';
import '@/ai/flows/summarize-context.ts';
import '@/ai/flows/voice-chat-completion.ts';