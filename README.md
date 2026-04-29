# Token Show

参考 OfferShow，统计各公司 AI 报销待遇，方便求职参考。

## 如何贡献

1. 点击页面右上角「+ 提交信息」按钮，或直接前往 [提交 Issue](https://github.com/PokIsemaine/token_show/issues/new?template=token-info.yml&labels=token-info)
2. 选择公司、供应商、填写额度和报销方式
3. 提交后数据自动同步到页面

> Issue 关闭后数据自动从页面移除

## 举报不实信息

通过 [举报 Issue](https://github.com/PokIsemaine/token_show/issues/new?template=report.yml&labels=report) 提交。

## 技术架构

| 组件 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + TailwindCSS |
| 数据提交 | GitHub Issues |
| 数据管线 | GitHub Actions |
| 部署 | GitHub Pages |

## 本地开发

```bash
npm install
npm run dev
```
