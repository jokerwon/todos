# Quickstart: Login Module (Client-side Interim Auth)

## Prerequisites
- Node.js 20.x + npm/pnpm 8+
- 浏览器支持 SubtleCrypto（Chrome/Edge/Firefox/Safari 最新版）
- Playwright 浏览器已安装：`npx playwright install`

## Environment Setup
1. 复制 `.env.example` 为 `.env.local`，确保设置 `FEATURE_LOCAL_AUTH=1`（启用临时方案）。
2. 安装依赖：`pnpm install`
3. 运行开发服务器：`pnpm dev`
4. 首次运行执行 `pnpm tsx scripts/seed-local-auth.ts` 预置示例账号（demo/product/admin）。

## Development Workflow
- 单元测试：`pnpm test -- run auth`
- 集成测试：`pnpm vitest run tests/integration/auth`
- 端到端：`pnpm e2e --grep @auth`
- Lint：`pnpm lint`

## Manual Testing Checklist
1. 打开 `/auth/login`，输入测试账号登录，确认重定向至 `/`。
2. 输入错误密码，观察错误提示与失败计数。
3. 勾选“记住我”，刷新浏览器后仍保持登录。
4. 清理 localStorage 后访问受限页面，验证重定向回登录。
5. 点击“忘记密码”链接，检查跳转到 `/auth/forgot-password`。

## Migration Reminder
- 上线生产前必须替换临时 localStorage 实现并关闭 `FEATURE_LOCAL_AUTH`。在计划阶段记录所需后端接口：`POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`。
