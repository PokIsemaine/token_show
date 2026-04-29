# Token Show

各公司 AI Token 报销/补贴待遇一览，社区驱动，零成本部署在 GitHub Pages 上。

## 是什么

Token Show 收录各公司的 AI Token（OpenAI GPT、Claude、通义千问、文心一言等）报销和补贴待遇信息。所有数据由社区通过 GitHub Issue 提交，无需服务器，完全免费运行。

## 如何贡献数据

1. 点击页面右上角「+ 提交信息」按钮，或直接前往 [提交 Issue](https://github.com/PokIsemaine/token_show/issues/new?template=token-info.yml&labels=token-info)
2. 选择你的公司（支持多选）和使用的 Token 类型（支持多选）
3. 填写额度、报销方式等信息
4. 提交后数据会自动同步到页面

> Issue 关闭后该条信息会自动从页面移除

## 支持的 Token 类型

**海外模型：** OpenAI GPT 系列、Anthropic Claude 系列、Google Gemini 系列、Azure OpenAI、AWS Bedrock、Cohere

**国内模型：** 通义千问 Qwen、文心一言 ERNIE、豆包 Doubao、混元 Hunyuan、智谱 GLM / ChatGLM、DeepSeek、Moonshot Kimi、MiniMax

**其他：** 内部自研模型

## 举报不实信息

如发现不实或过时的信息，请通过 [举报 Issue](https://github.com/PokIsemaine/token_show/issues/new?template=report.yml&labels=report) 提交。

## 技术架构

| 组件 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + TailwindCSS |
| 图表 | ECharts |
| 数据提交 | GitHub Issues（多选表单） |
| 数据管线 | GitHub Actions（Node.js） |
| 部署 | GitHub Pages |

## 本地开发

```bash
npm install
npm run dev
```

## 数据更新流程

```
用户提交/关闭 Issue → GitHub Actions 触发
→ 解析 Issue 内容 → 生成 data/entries.json + data/stats.json
→ 自动 commit → 触发 GitHub Pages 部署
```

## 隐私声明

请勿提交个人敏感信息（如姓名、工号等）。Issue 提交者 GitHub 用户名不会在页面公开显示。
