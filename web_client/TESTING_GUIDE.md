# 文档编辑页面测试指南

本文档提供了文档编辑页面的完整测试方法，包括手动测试和自动化测试。

## 目录

1. [手动测试步骤](#手动测试步骤)
2. [测试数据准备](#测试数据准备)
3. [自动化测试](#自动化测试)
4. [测试场景清单](#测试场景清单)

---

## 手动测试步骤

### 前置条件

1. **启动开发服务器**
   ```bash
   cd web_client
   npm run dev
   ```

2. **确保后端服务运行**（或使用 Mock 数据）

3. **准备测试数据**（见下方测试数据准备部分）

### 测试流程

#### 1. 访问文档编辑页面

**步骤：**
1. 打开浏览器访问 `http://localhost:5173`
2. 由于开发环境自动登录，会自动进入 `/home` 页面
3. 在左侧工作区点击文档，或直接访问 `/home/document/1`

**预期结果：**
- 页面正常加载
- 显示文档名称和类型
- 显示编辑器界面

#### 2. 测试文本编辑器（.txt 格式）

**步骤：**
1. 创建一个 `.txt` 格式的文档
2. 在编辑器中输入文本
3. 检查文本是否正常显示
4. 测试多行文本输入

**预期结果：**
- 文本编辑器正常显示
- 可以正常输入和编辑文本
- 文本格式正确（等宽字体）

#### 3. 测试 Markdown 编辑器（.md 格式）

**步骤：**
1. 创建一个 `.md` 格式的文档
2. 输入 Markdown 语法：
   ```markdown
   # 标题
   **粗体文本**
   - 列表项1
   - 列表项2
   ```
3. 检查渲染效果

**预期结果：**
- TipTap 编辑器正常显示
- Markdown 语法正确渲染
- 可以正常编辑

#### 4. 测试实时协同编辑

**步骤：**
1. 打开两个浏览器窗口（或使用无痕模式）
2. 两个窗口都访问同一个文档
3. 在一个窗口中输入文本
4. 观察另一个窗口是否实时同步

**预期结果：**
- 两个窗口的内容实时同步
- 显示其他用户的编辑光标（如果支持）
- 无冲突或数据丢失

#### 5. 测试协作者管理

**步骤：**
1. 点击"添加协作者"按钮
2. 输入用户ID和权限
3. 点击"添加"
4. 检查协作者列表是否更新

**预期结果：**
- 对话框正常显示
- 可以成功添加协作者
- 协作者列表正确更新
- 协作人数显示正确

#### 6. 测试错误处理

**步骤：**
1. 访问不存在的文档ID（如 `/home/document/99999`）
2. 测试网络错误情况
3. 测试权限不足的情况

**预期结果：**
- 显示适当的错误提示
- 不会导致页面崩溃
- 错误信息清晰易懂

---

## 测试数据准备

### 使用浏览器控制台创建测试数据

在浏览器控制台（F12）中执行以下代码：

```javascript
// 设置测试文档到 store
const { useDocumentStore } = await import('./src/stores/document.ts')
const documentStore = useDocumentStore()

// 创建测试文档
const testDocument = {
  id: 1,
  ownerId: 1,
  name: '测试文档.txt',
  type: 'txt',
  sizeBytes: 0,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  permission: 'write'
}

documentStore.setCurrentDocument(testDocument)

// 设置测试协作者
const testCollaborators = [
  {
    id: 1,
    documentId: 1,
    userId: 2,
    permission: 'write',
    joinedAt: new Date().toISOString()
  }
]

documentStore.setCollaborators(testCollaborators)

// 跳转到文档编辑页面
window.location.href = '/home/document/1'
```

### Mock API 响应

如果后端未就绪，可以在浏览器控制台 Mock API：

```javascript
// Mock documentApi
window.mockDocumentApi = {
  getDocument: async (id) => ({
    id: id,
    ownerId: 1,
    name: `测试文档-${id}.txt`,
    type: 'txt',
    sizeBytes: 100,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permission: 'write'
  }),
  
  getCollaborators: async (docId) => [
    {
      id: 1,
      documentId: docId,
      userId: 2,
      permission: 'write',
      joinedAt: new Date().toISOString()
    }
  ]
}
```

---

## 自动化测试

### 安装测试依赖

```bash
npm install -D vitest @vue/test-utils @vitest/ui jsdom
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并查看覆盖率
npm run test:coverage

# 以 watch 模式运行
npm run test:watch
```

### 测试文件结构

```
web_client/
├── src/
│   └── views/
│       ├── DocumentEditor.vue
│       └── __tests__/
│           └── DocumentEditor.test.ts
└── vitest.config.ts
```

### 添加测试脚本到 package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 测试场景清单

### 功能测试

- [ ] 页面正常加载
- [ ] 文档信息正确显示（名称、类型）
- [ ] 文本编辑器（.txt）正常工作
- [ ] Markdown 编辑器（.md）正常工作
- [ ] 其他格式显示提示信息
- [ ] 协作者列表正确显示
- [ ] 协作人数统计正确
- [ ] 添加协作者功能正常
- [ ] 实时协同编辑同步正常
- [ ] WebSocket 连接正常

### UI/UX 测试

- [ ] 页面布局正确
- [ ] 响应式设计正常
- [ ] 按钮点击反馈正常
- [ ] 对话框显示/隐藏正常
- [ ] 滚动条正常工作
- [ ] 加载状态显示（如果有）

### 错误处理测试

- [ ] 文档不存在时的处理
- [ ] 网络错误时的处理
- [ ] 权限不足时的处理
- [ ] WebSocket 连接失败时的处理
- [ ] 无效文档ID的处理

### 性能测试

- [ ] 大文档加载性能
- [ ] 实时同步延迟
- [ ] 内存使用情况
- [ ] 编辑器响应速度

### 浏览器兼容性测试

- [ ] Chrome/Edge（Chromium）
- [ ] Firefox
- [ ] Safari（如果可能）

---

## 快速测试脚本

创建一个测试辅助脚本 `test-helper.js`：

```javascript
// 在浏览器控制台运行
(async function() {
  // 1. 创建测试文档
  const testDoc = {
    id: 1,
    ownerId: 1,
    name: '测试文档.txt',
    type: 'txt',
    sizeBytes: 0,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permission: 'write'
  }
  
  // 2. 设置到 store
  const pinia = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0].config.globalProperties.$pinia
  const { useDocumentStore } = await import('/src/stores/document.ts')
  const docStore = useDocumentStore(pinia)
  docStore.setCurrentDocument(testDoc)
  
  // 3. 跳转
  window.location.href = '/home/document/1'
})()
```

---

## 调试技巧

### 1. 查看 Store 状态

```javascript
// 在浏览器控制台
const { useDocumentStore } = await import('./src/stores/document.ts')
const store = useDocumentStore()
console.log('当前文档:', store.currentDocument)
console.log('协作者:', store.collaborators)
```

### 2. 检查 WebSocket 连接

```javascript
// 查看 WebSocket 连接状态
console.log('WebSocket URL:', import.meta.env.VITE_WS_URL)
```

### 3. 模拟网络延迟

在浏览器 DevTools > Network > Throttling 中设置网络延迟

### 4. 查看编辑器实例

```javascript
// 在组件中
console.log('Editor:', editor?.value)
```

---

## 常见问题排查

### 问题1: 编辑器不显示

**检查：**
- 文档类型是否正确
- `editorContainer` ref 是否正确绑定
- TipTap 是否正确初始化

### 问题2: 实时同步不工作

**检查：**
- WebSocket URL 是否正确
- Y.js provider 是否正常连接
- 后端 WebSocket 服务是否运行

### 问题3: 协作者列表为空

**检查：**
- API 调用是否成功
- Store 是否正确更新
- 权限是否正确设置

---

## 测试报告模板

```
测试日期: YYYY-MM-DD
测试人员: [姓名]
测试环境: 
- 浏览器: Chrome XX
- 操作系统: Windows/Mac/Linux
- 后端版本: vX.X.X

测试结果:
✅ 通过
❌ 失败
⚠️  部分通过

详细结果:
[记录每个测试项的详细结果]
```

---

## 持续集成测试

如果使用 CI/CD，可以在 `.github/workflows` 中添加测试工作流：

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
```


