# SyncNote Web Client

SyncNote 前端应用，基于 Vue 3 + TypeScript + Vite 构建。

## 技术栈

- **框架**: Vue 3 + Vite + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **网络通信**: Axios
- **实时协同**: 
  - TipTap - 富文本编辑器
  - Y.js - 协同功能核心
  - Y-websocket - WebSocket 连接器
- **图标**: Lucide Vue Next

## 项目结构

```
web_client/
├── src/
│   ├── api/              # API 服务层
│   │   ├── index.ts     # Axios 配置
│   │   ├── user.ts      # 用户 API
│   │   ├── document.ts  # 文档 API
│   │   └── ai.ts        # AI API
│   ├── components/      # 组件
│   │   ├── CoreSlideBar.vue      # 主侧边栏
│   │   ├── DocumentManager.vue   # 文档管理
│   │   ├── Workspace.vue         # 工作区
│   │   ├── AIChatWindow.vue      # AI 聊天窗口
│   │   └── SystemSettings.vue    # 系统设置
│   ├── stores/          # Pinia 状态管理
│   │   ├── user.ts      # 用户状态
│   │   ├── document.ts  # 文档状态
│   │   └── ai.ts        # AI 状态
│   ├── views/           # 页面视图
│   │   ├── Login.vue           # 登录页
│   │   ├── Homepage.vue         # 主页
│   │   └── DocumentEditor.vue   # 文档编辑器
│   ├── router/          # 路由配置
│   ├── types/           # TypeScript 类型定义
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── public/              # 静态资源
├── package.json         # 依赖配置
└── vite.config.ts       # Vite 配置
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 构建

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## 功能特性

### 1. 用户认证
- 用户登录/注册
- Token 管理
- 自动登录状态恢复

### 2. 文档管理
- 创建新文档（支持 .txt, .md, .docx, .pptx）
- 导入文件
- 加入共享文档
- 文档列表展示（按权限分类）

### 3. 实时协同编辑
- 基于 Y.js 的实时同步
- 支持 Markdown 格式（TipTap）
- 支持文本格式
- 显示协作人数和协作者信息
- 添加/移除协作者

### 4. AI 助手
- 多模型支持（GPT-4, GPT-3.5, Claude 3 等）
- Chat 模式和 Agent 模式切换
- 上下文感知（可读取当前文档）
- 聊天历史记录

### 5. 系统设置
- 用户信息展示
- 修改用户信息
- 退出登录

## 路由说明

- `/login` - 登录/注册页面
- `/home` - 主页（欢迎界面）
- `/home/document/:id` - 文档编辑页面

## API 接口

所有 API 请求通过 `src/api/` 目录下的服务层进行，支持：
- 自动 Token 注入
- 统一错误处理
- 401 自动跳转登录

## 注意事项

1. 确保后端服务已启动并配置正确的 CORS
2. WebSocket 服务需要支持 Y.js 协议
3. 文档大小限制需要在后端配置
4. 文件上传需要后端支持 multipart/form-data


