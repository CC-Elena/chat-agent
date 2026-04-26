import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

const dashscope = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'mock',
  baseURL: process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

async function main() {
  try {
    const result = streamText({
      model: dashscope('qwen-max'),
      messages: [{ role: 'user', content: 'hello' }],
      tools: {
        weather: {
          description: 'Get weather',
          parameters: z.object({ location: z.string() }),
          execute: async ({ location }) => ({ temperature: 24, location }),
        }
      }
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\nDone.');
  } catch (err) {
    console.error('ERROR:', err);
  }
}
main();
