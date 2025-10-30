# Data Model: Login Module (Client-side Interim)

## Entity: Credential
- **Fields**: `email (string, unique)`, `passwordHash (string)`, `salt (string)`, `failedAttempts (number)`, `lockedUntil (timestamp | null)`
- **Storage**: Serialized JSON in localStorage key `auth.credentials`
- **Notes**: Only demo/testing accounts stored；未来将迁移至服务器数据库

## Entity: SessionToken
- **Fields**: `token (string)`, `userId (string)`, `issuedAt (timestamp)`, `expiresAt (timestamp)`, `remember (boolean)`
- **Storage**: localStorage key `auth.session` + in-memory cache for fast reads
- **Notes**: Token 采用随机 UUID；记住我时延长 `expiresAt`

## Entity: AuditLog (client placeholder)
- **Fields**: `timestamp`, `event` (success|failure|lockout), `email`, `meta` (IP placeholder, user agent)
- **Storage**: `auth.audit` (localStorage) + console export for telemetry stub

## Derived State
- **RouteGuardState**: 当前会话 + 原始访问路径，用于重定向
- **CaptchaState**: 连续失败时提示内容，暂存于 Zustand store

## Migration Notes
- 为未来的远程 API 预留 `AuthAdapter` 接口，方法包含 `verifyCredentials`, `issueSession`, `refreshSession`, `logout`, `recordAudit`
- 实现时确保所有调用经过接口，便于后续注入远程实现
