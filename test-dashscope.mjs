import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const dashscope = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'mock',
  baseURL: process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

async function main() {
  try {
    console.log("Calling DashScope with qwen-plus (No Tools)...");
    const result = await streamText({
      model: dashscope('qwen-plus'),
      messages: [{ role: 'user', content: 'hello' }],
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\nDone.");
  } catch (err) {
    console.error('ERROR:', err);
  }
}
main();
