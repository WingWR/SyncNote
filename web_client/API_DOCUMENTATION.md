# 前端 API 接口文档

本文档列出了前端代码中所有需要后端实现的 REST API 和 WebSocket 接口。

**基础配置：**
- 基础URL: `http://localhost:8080/api` (可通过环境变量 `VITE_API_BASE_URL` 配置)
- WebSocket URL: `ws://localhost:8080/ws/document/{documentId}` (可通过环境变量 `VITE_WS_URL` 配置完整路径，或配置基础路径 `ws://localhost:8080/ws` 后拼接文档ID)
- 认证方式: Bearer Token (在请求头中: `Authorization: Bearer <token>`)

---

## 1. 认证相关接口 (Auth)

### 1.1 用户登录
- **URL**: `POST /api/auth/login`
- **请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "string"
}
```

### 1.2 用户注册
- **URL**: `POST /api/auth/register`
- **请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **响应**: 同登录接口

### 1.3 用户登出
- **URL**: `POST /api/auth/logout`
- **请求头**: 需要 Bearer Token
- **响应**: 无特定格式要求

---

## 2. 用户相关接口 (User)

### 2.1 获取当前用户信息
- **URL**: `GET /api/user/me`
- **请求头**: 需要 Bearer Token
- **响应**:
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "avatar": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2.2 更新用户信息
- **URL**: `PUT /api/user/me`
- **请求头**: 需要 Bearer Token
- **请求体**:
```json
{
  "username": "string",  // 可选
  "password": "string"   // 可选，新密码（留空则不修改）
}
```
- **响应**: 同获取用户信息接口

**注意**: 用户头像通过专门的文件上传接口处理，邮箱地址不可修改（与账号绑定）

---

## 3. 文档相关接口 (Document)

### 3.1 获取文档列表
- **URL**: `GET /api/documents`
- **请求头**: 需要 Bearer Token
- **响应**:
```json
[
  {
    "id": 1,
    "ownerId": 1,
    "name": "string",
    "type": "txt" | "md" | "docx" | "pptx",
    "sizeBytes": 1024,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "permission": "read" | "write"  // 可选，当前用户对该文档的权限
  }
]
```

### 3.2 获取单个文档
- **URL**: `GET /api/documents/{id}`
- **请求头**: 需要 Bearer Token
- **响应**: 同文档列表中的单个文档对象

### 3.3 创建文档
- **URL**: `POST /api/documents`
- **请求头**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "string",
  "type": "txt" | "md" | "docx" | "pptx"
}
```
- **响应**: 同文档列表中的单个文档对象

### 3.4 更新文档
- **URL**: `PUT /api/documents/{id}`
- **请求头**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "string"  // 可选
}
```
- **响应**: 同文档列表中的单个文档对象

### 3.5 删除文档
- **URL**: `DELETE /api/documents/{id}`
- **请求头**: 需要 Bearer Token
- **响应**: 无特定格式要求

### 3.6 上传文档
- **URL**: `POST /api/documents/upload`
- **请求头**: 需要 Bearer Token, `Content-Type: multipart/form-data`
- **请求体**: FormData
  - `file`: File (支持 .txt, .md, .docx, .pptx)
- **响应**: 同文档列表中的单个文档对象

### 3.7 获取回收站文档列表
- **URL**: `GET /api/documents/trash`
- **请求头**: 需要 Bearer Token
- **响应**: 同文档列表格式

### 3.8 永久删除文档
- **URL**: `DELETE /api/documents/trash/{id}`
- **请求头**: 需要 Bearer Token
- **响应**: 无特定格式要求

### 3.9 恢复文档
- **URL**: `POST /api/documents/trash/{id}/restore`
- **请求头**: 需要 Bearer Token
- **响应**: 无特定格式要求

### 3.10 加入共享文档
- **URL**: `POST /api/documents/{id}/join`
- **请求头**: 需要 Bearer Token
- **响应**: 同文档列表中的单个文档对象

---

## 4. 协作者相关接口 (Collaborator)

### 4.1 获取文档协作者列表
- **URL**: `GET /api/documents/{documentId}/collaborators`
- **请求头**: 需要 Bearer Token
- **响应**:
```json
[
  {
    "id": 1,
    "documentId": 1,
    "userId": 2,
    "permission": "read" | "write",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 4.2 添加协作者
- **URL**: `POST /api/documents/{documentId}/collaborators`
- **请求头**: 需要 Bearer Token
- **请求体**:
```json
{
  "userId": 2,
  "permission": "read" | "write"
}
```
- **响应**: 同协作者列表中的单个协作者对象

### 4.3 移除协作者
- **URL**: `DELETE /api/documents/{documentId}/collaborators/{userId}`
- **请求头**: 需要 Bearer Token
- **响应**: 无特定格式要求

---

## 5. AI 相关接口

### 5.1 AI 聊天（流式输出）
- **URL**: `POST /api/ai/chat/stream`
- **请求头**: 需要 Bearer Token, `Accept: text/event-stream`
- **请求体**:
```json
{
  "message": "string",
  "documentId": 1,        // 可选，当前文档ID
  "modelId": "string",   // 如: "gpt-4", "gpt-3.5", "claude-3"
  "mode": "chat" | "polish" | "continue",
  "context": "string"    // 可选，上下文信息
}
```
- **响应**: Server-Sent Events (SSE) 流式响应
  - 每个事件格式: `data: {"type": "chunk|done|error", "content": "string", "done": boolean}\n\n`
  - `chunk`: 内容块，包含部分响应文本
  - `done`: 流式输出完成
  - `error`: 发生错误

**示例响应**:
```
data: {"type": "chunk", "content": "你好", "done": false}

data: {"type": "chunk", "content": "，我可以帮您", "done": false}

data: {"type": "chunk", "content": "解答问题。", "done": false}

data: {"type": "done", "content": "", "done": true}
```

**模式说明**:
- `chat`: 普通聊天问答
- `polish`: 文本润色优化
- `continue`: 续写文本内容

### 5.2 AI 聊天（普通请求）
- **URL**: `POST /api/ai/chat`
- **请求头**: 需要 Bearer Token
- **请求体**: 同流式接口
- **响应**:
```json
{
  "message": "string",
  "context": "string"    // 可选
}
```

### 5.2 获取可用模型列表
- **URL**: `GET /api/ai/models`
- **请求头**: 需要 Bearer Token
- **响应**:
```json
[
  {
    "id": "gpt-4",
    "name": "GPT-4",
    "provider": "OpenAI"
  }
]
```

---

## 6. WebSocket 接口 (实时协同)

### 6.1 文档协同编辑 WebSocket
- **URL**: `ws://localhost:8080/ws/document/{documentId}`
- **协议**: Y.js WebSocket 协议
- **用途**: 实时同步文档内容，支持多人协同编辑
- **连接参数**:
  - `documentId`: 文档ID（路径参数）
  - 连接时需要携带认证信息（建议通过查询参数传递 token，如：`ws://localhost:8080/ws/document/{documentId}?token=<token>`）

**Y.js 协议说明：**
- 使用 `y-websocket` 客户端库的 `WebsocketProvider` 连接
- 支持 Y.js 的 CRDT 同步机制
- 需要支持 Y.js 的二进制协议
- 连接格式：`new WebsocketProvider(wsUrl, roomName, ydoc)`，其中 `roomName` 通常为 `document-{documentId}`

---

## 7. 错误处理

### 7.1 HTTP 状态码
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权（Token 无效或过期）
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

### 7.2 401 处理
当前端收到 401 响应时，会自动：
1. 清除 localStorage 中的 token
2. 重定向到 `/login` 页面

---

## 8. 请求/响应拦截器

### 8.1 请求拦截器
- 自动从 `localStorage` 读取 `token`
- 如果存在 token，自动添加到请求头: `Authorization: Bearer <token>`

### 8.2 响应拦截器
- 自动提取 `response.data` 作为响应数据
- 处理 401 错误并自动跳转登录

---

## 9. 数据类型定义

### User (用户)
```typescript
{
  id: number
  username: string
  email: string
  avatar: string
  createdAt: string  // ISO 8601 格式
}
```

### Document (文档)
```typescript
{
  id: number
  ownerId: number
  name: string
  type: 'txt' | 'md' | 'docx' | 'pptx'
  sizeBytes: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  permission?: 'read' | 'write'  // 当前用户权限
}
```

### DocumentCollaborator (协作者)
```typescript
{
  id: number
  documentId: number
  userId: number
  permission: 'read' | 'write'
  joinedAt: string
}
```

---

## 10. 注意事项

1. **CORS 配置**: 后端需要配置允许前端域名的跨域请求
2. **Token 存储**: Token 存储在 `localStorage` 中，键名为 `token`
3. **文件上传**: 文档上传使用 `multipart/form-data` 格式
4. **WebSocket 认证**: WebSocket 连接需要支持认证机制
5. **文档大小限制**: 建议对上传的文档大小进行限制
6. **实时同步**: WebSocket 需要支持 Y.js 协议以实现实时协同编辑

---

## 11. 环境变量配置

前端通过以下环境变量配置 API 地址：

```env
# API 基础URL
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket URL（可以是完整路径或基础路径）
# 完整路径示例：VITE_WS_URL=ws://localhost:8080/ws/document/{documentId}
# 基础路径示例：VITE_WS_URL=ws://localhost:8080/ws（代码中会自动拼接 /document/{documentId}）
VITE_WS_URL=ws://localhost:8080/ws
```

**注意：** 如果 `VITE_WS_URL` 配置为基础路径（如 `ws://localhost:8080/ws`），前端代码会在使用时自动拼接 `/document/{documentId}`。如果配置为完整路径模板，需要确保包含 `{documentId}` 占位符。


