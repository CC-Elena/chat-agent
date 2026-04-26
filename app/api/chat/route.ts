import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Configure DashScope (Aliyun) API via OpenAI SDK compatibility
const dashscope = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'mock',
  baseURL: process.env.OPENAI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // ====== Mock Mode ======
  if (process.env.USE_MOCK === "true") {
    console.log("Mock Mode Enabled. Generating mock stream...");
    
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sendChunk = (chunk: string) => controller.enqueue(encoder.encode(chunk + '\n'));
        
        // 1. 发送开始的想法
        sendChunk('0:"好的，我来帮您查询一下天气。"');
        await new Promise(r => setTimeout(r, 1000));

        // 2. 模拟工具调用 (Tool Call)
        const toolCallId = 'call_' + Math.random().toString(36).substring(7);
        const toolCallMsg = {
          id: toolCallId,
          name: "weather",
          args: { location: "Beijing" }
        };
        sendChunk(`9:${JSON.stringify(toolCallMsg)}`);
        await new Promise(r => setTimeout(r, 2000));
        
        // 3. 模拟工具返回结果 (Tool Result)
        const toolResultMsg = {
          id: toolCallId,
          result: { temperature: 22, condition: "Sunny", city: "Beijing" }
        };
        sendChunk(`a:${JSON.stringify([toolResultMsg])}`);
        await new Promise(r => setTimeout(r, 1000));

        // 4. 发送最终的文字响应
        sendChunk('0:"根据最新数据，北京今天天气晴朗，气温 22 度，非常适合出行！"');
        
        // 结束流
        sendChunk('d:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":20}}');
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1'
      }
    });
  }

  // ====== Real API Mode ======
  console.log("Real Mode Enabled. Calling DashScope...");
  const result = streamText({
    model: dashscope('qwen-turbo'),
    messages,
    tools: {
      weather: tool({
        description: '获取指定城市的天气信息 (Get weather for a location)',
        parameters: z.object({
          location: z.string().describe('城市名称，例如：北京，上海 (City name)'),
        }),
        execute: async ({ location }) => {
          console.log(`Tool 'weather' called with location: ${location}`);
          // 模拟工具执行耗时
          await new Promise(r => setTimeout(r, 1000));
          return { temperature: 24, condition: 'Sunny', location };
        },
      }),
      search: tool({
        description: '在互联网上搜索最新信息 (Search the web for current info)',
        parameters: z.object({
          query: z.string().describe('搜索关键词 (Search query)'),
        }),
        execute: async ({ query }) => {
          console.log(`Tool 'search' called with query: ${query}`);
          await new Promise(r => setTimeout(r, 1000));
          return { results: `这是关于 "${query}" 的模拟搜索结果。` };
        },
      })
    },
    maxSteps: 5, // 允许大模型连续多次调用工具
  });

  return result.toDataStreamResponse();
}
