# Research: Login Module

## Decision: Client-side credential store (temporary)
- **Rationale**: Backend auth API尚未准备，使用 localStorage + in-memory 缓存可快速交付 UI/UX，并通过 Web Crypto 进行哈希避免明文。
- **Migration Strategy**: 抽象 `AuthStore` 接口，未来替换为远程 API 时只需替换实现并保留同样的 hook/provider。
- **Risks**: 本地存储不适合生产；在上线服务器版本前必须关掉临时实现或受 feature flag 控制。

## Decision: Password hashing via SubtleCrypto
- **Rationale**: 浏览器内置 SubtleCrypto PBKDF2/SHA-256 可在无后端情况下提供哈希；避免直接存储明文。
- **Alternatives**: 引入 bcrypt.js，但体积较大并影响 FCP；待服务器上线后将在后端处理哈希。

## Decision: Session management with Zustand + localStorage
- **Rationale**: Zustand 轻量且已在项目中使用，结合 localStorage 可在刷新后恢复会话；与 future server token 逻辑兼容。
- **Plan**: `session-provider` 初始化 store，`middleware` 检查自定义 cookie/LocalStorage token 并执行重定向。

## Decision: Brute-force mitigation via exponential backoff
- **Rationale**: 虽然本地方案限制较弱，但加入失败计数 + 渐进延迟可模拟后端防护并保留 UX 提示。
- **Implementation**: `client-store` 增加失败计数，记录时间戳，超过阈值触发 CAPTCHA 入口（占位）。

## Decision: Recovery & SSO entry placeholders
- **Rationale**: Spec 要求提供入口，当前阶段仅需导航到既有/待建页面；后续接入服务器 SSO 时复用 UI。
- **Plan**: Link 至 `/auth/forgot-password` 和 `/auth/sso/[provider]`，并加入 feature flag 控制。
