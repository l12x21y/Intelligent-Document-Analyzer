# Intelligent Document Analyzer

一个用于分析和摘要文档的前端应用，支持上传 PDF/文本并通过模型服务生成摘要、分类和结构化信息。

**主要功能**
- 文档上传与预处理
- 自动摘要与要点提取
- 自定义分类与标签
- 导出结果为 CSV/JSON

## 快速开始（本地）

**前提条件**
- Node.js（建议 v16+）
- npm 或 yarn

1. 安装依赖：
   `npm install`
2. 创建环境变量文件 `.env.local`，并设置模型/API key，例如：
   `GEMINI_API_KEY=your_api_key_here`
3. 本地运行：
   `npm run dev`

## 构建与发布

构建生产包：
`npm run build`

构建后产物位于 `dist/`，可将其部署到任意静态主机（Netlify、Vercel、GitHub Pages 等）。

## 配置与扩展

- 若使用其他模型服务，请在 `services/` 中调整 `geminiService.ts` 或添加新的服务适配层。
- 自定义类别可编辑 `components/CustomCategories.tsx`。

## 许可证
根据仓库设定的许可证使用和分发本项目。

如需帮助或报告问题，请在仓库中打开 Issue。
