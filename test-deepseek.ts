import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import 'dotenv/config';

async function main() {
  const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  console.log("Testing DeepSeek connection...");
  
  try {
    const { text } = await generateText({
      model: deepseek('deepseek-chat'),
      prompt: 'Hello, how are you today?',
    });

    console.log("DeepSeek Response:", text);
  } catch (error) {
    console.error("DeepSeek Test Failed:", error);
  }
}

main();
