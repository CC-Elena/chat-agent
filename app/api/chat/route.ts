/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Configure DeepSeek
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || 'mock',
});

// Configure DashScope (Aliyun) for fallback/selection
const dashscope = createOpenAI({
  apiKey: process.env.DASH_API_KEY || process.env.DEEPSEEK_API_KEY || 'mock', // Use DASH_API_KEY or fallback
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// Configure NVIDIA NIM
const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'mock',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  const modelId = data?.modelId || 'deepseek-chat';

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
  console.log(`Real Mode Enabled. Calling model: ${modelId}`);
  
  let selectedModel;
  if (modelId === 'deepseek-chat' || modelId === 'deepseek-reasoner') {
    selectedModel = deepseek(modelId);
  } else if (modelId.startsWith('qwen-')) {
    selectedModel = dashscope(modelId);
  } else if (modelId.startsWith('nvidia/') || modelId.startsWith('meta/') || modelId.startsWith('mistralai/')) {
    // NVIDIA NIM hosted models
    selectedModel = nvidia(modelId);
  } else {
    selectedModel = deepseek('deepseek-chat'); // fallback
  }

  const result = streamText({
    model: selectedModel,
    messages,
    tools: {
      weather: tool({
        description: '获取指定城市的天气信息 (Get weather for a location)',
        parameters: z.object({
          location: z.string().describe('城市名称，例如：北京，上海 (City name)'),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: async ({ location }: { location: string }) => {
          console.log(`Tool 'weather' called with location: ${location}`);
          // 模拟工具执行耗时
          await new Promise(r => setTimeout(r, 1000));
          return { temperature: 24, condition: 'Sunny', location };
        },
      } as any),
      search: tool({
        description: '在互联网上搜索最新信息 (Search the web for current info)',
        parameters: z.object({
          query: z.string().describe('搜索关键词 (Search query)'),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute: async ({ query }: { query: string }) => {
          console.log(`Tool 'search' called with query: ${query}`);
          await new Promise(r => setTimeout(r, 1000));
          return { results: `这是关于 "${query}" 的模拟搜索结果。` };
        },
      } as any),
      send_email: tool({
        description: '发送一封电子邮件给指定的收件人 (Send an email to a recipient)',
        parameters: z.object({
          to: z.string().describe('收件人邮箱地址 (Recipient email)'),
          subject: z.string().describe('邮件主题 (Email subject)'),
          body: z.string().describe('邮件正文内容 (Email body)'),
        }),
        // 在真实 HITL 场景中，这个 execute 可能为空或者只是记录意图
        execute: async ({ to, subject, body }: any) => {
          console.log(`[HITL] Tool 'send_email' executed after confirmation for: ${to}`);
          return { success: true, message: `邮件已发送给 ${to}`, subject, body };
        },
      } as any)
    },
  });

  return result.toTextStreamResponse();
}
