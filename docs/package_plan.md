### **一、 核心技术栈清单**

| **维度** | **选型** | **说明** |
| --- | --- | --- |
| **基础语言** | **TypeScript (TS)** | **必须**。用于精确定义 Tool Calling 的 Schema 和校验模型输出。 |
| **全栈框架** | **Next.js 14+ (App Router)** | 提供 SSR 和 API Routes (BFF)，实现前后端逻辑高度聚合。 |
| **Agent 框架** | **Vercel AI SDK** | 核心。原生支持流式传输、多模型统一调用及 Tool 自动调度。 |
| **LLM 服务** | **DeepSeek V3 / V4** | 主力模型。极高性价比，且完全兼容 OpenAI 协议。 |
| **UI 组件库** | **shadcn/ui** | 采用源码拷贝模式，方便 AI 针对业务进行深度定制。 |
| **样式方案** | **Tailwind CSS** | 原子化 CSS，方便 AI 生成响应式布局。 |
| **状态管理** | **Zustand** | 轻量级状态机，管理对话流和全局配置。 |
| **数据库/ORM** | **SQLite + Prisma** | 开发阶段零配置，生产环境无缝迁移至 PostgreSQL。 |
| **校验层** | **Zod** | 强校验工具。是 Agent 理解工具参数的核心。 |

---

### **二、 选型核心原因**

1. **TypeScript & Zod (Agent 的“眼睛”)**： Agent 的核心是让 LLM 理解并调用函数。TS + Zod 能够提供机器可读的严格约束，确保 LLM 生成的参数不会导致程序崩溃，这是 Agent 稳定性的基石。
2. **Next.js & Vercel AI SDK (生产力引擎)**： Next.js 将前端渲染和后端逻辑（Agent 编排）放在同一个仓库中。Vercel AI SDK 提供的 `useChat` hook 极大地简化了流式交互（Streaming）和工具状态（Loading/Result）的处理，开发效率提升 300%。
3. **DeepSeek (极高性价比)**： 作为学习项目，DeepSeek 提供了与 GPT-4 同级别的 Function Calling 能力，但成本仅为其 1/20，非常适合频繁调试。
4. **shadcn/ui (AI 友好型 UI)**： 与传统的 npm 包（如 AntD）不同，shadcn/ui 直接将源码放入项目。这意味着 AI 可以直接阅读并根据对话产品的特殊需求（如气泡、思考过程动画）实时修改组件源码。