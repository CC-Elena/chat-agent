# Agentic Chat 产品规划文档

## 1. 产品愿景
打造一个具备智能体（Agent）能力的对话产品，让大模型不仅能“说”，还能“做”。通过工具调用（Tool Calling）实现自动化任务处理.

## 2. 核心功能模块

### 2.1 对话与 UI 系统
- **基础对话**：支持流式输出、Markdown 渲染（代码块、表格、图片）。
- **执行过程可视化**：实时展示 Agent 的思考（Thought）、行动（Action）和观察（Observation）。
- **会话管理**：支持多会话创建、删除及历史记录持久化。

### 2.2 Agent 编排引擎
- **意图识别**：精准判断用户指令是否需要调用外部工具。
- **ReAct 循环**：实现典型的“思考-行动-观察”循环，支持多步推理。
- **工具调用规范**：兼容主流模型的 Function Calling 协议。

### 2.3 工具集 (Toolbox)
- **内置工具**：
  - 网页搜索 (Web Search)
  - 天气查询 (Weather API)
  - 图片生成 (Image Generation)
  - 代码运行沙箱 (Code Interpreter)
- **扩展性**：支持用户自定义注册 API 工具。

## 3. 技术栈选型
- **前端**：Next.js (App Router), Tailwind CSS, shadcn/ui
- **后端/BFF**：Next.js API Routes / Node.js
- **LLM 集成**：Vercel AI SDK (支持多模型切换：DeepSeek, OpenAI, MiniMax)
- **数据库**：PostgreSQL (Prisma ORM)
- **状态管理**：Zustand

## 4. 实施阶段计划

### 第一阶段：MVP 最小可行性产品 (Phase 1)
- 搭建基础对话框架。
- 接入 DeepSeek/OpenAI 模型，实现单步 Tool Calling。
- 集成搜索和天气两个基础工具。
- 实现初步的思考过程展示 UI。

### 第二阶段：功能增强与持久化 (Phase 2)
- 引入数据库，保存对话历史和工具调用日志。
- 实现多步 ReAct 编排，支持复杂指令拆解。
- 优化 UI/UX，增加代码高亮和响应式适配。

### 第三阶段：开放平台化 (Phase 3)
- 支持用户自定义工具注册（HTTP API）。
- 引入代码沙箱，支持 Agent 编写并运行代码。
- 性能优化与部署。

## 5. 学习目标记录
- 理解 Function Calling 的底层原理。
- 掌握流式数据处理与前端实时渲染。
- 学习大模型编排框架 (Vercel AI SDK / LangChain)。
- 提升全栈开发与系统架构设计能力。
