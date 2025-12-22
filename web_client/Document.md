# 注意事项
## 时间
1. 时间：统一表示时间，格式为："2024-01-01T00:00:00Z"
2. 前端处理：new Date("2024-01-01T00:00:00Z") 自动转换为当前时区时间
3. 后端存储：Instant createAt = Instant.parse("2024-01-01T00:00:00Z");
4. JDBC处理：spring.datasource.url=jdbc:mysql://139.196.151.22:3306/sync_note?serverTimezone=UTC&useSSL=false，生产环境必须启用 SSL（例如：useSSL=true&requireSSL=true）

## 更新接口

- 基础路径：`/api/document`

3.1 获取文档列表
- URL: `GET /api/document`
- 请求头: 需要 `Authorization: Bearer <token>`
- 响应 (200):
```json
{
  "code": 200,
  "message": "获取文档列表成功",
  "data": [
    {
      "id": 1,
      "ownerId": 1,
      "fileName": "string",
      "fileType": "txt" | "md" | "docx" | "pptx",
      "fileSize": 1024,
      "isDeleted": false,
      "parentId": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "permission": "WRITE" | "READ"
    }
  ]
}
```
说明：
- 返回包装为通用 `ApiResponse`（包含 `code/message/data`）。
- 字段名以 `fileName`/`fileType`/`fileSize` 等为准，`permission` 值为大写 `"WRITE"` 或 `"READ"`（见 `DocumentResponseDTO` 注释）。

3.2 获取单个文档
- URL: `GET /api/document/{id}`
- 请求头: 需要 `Authorization: Bearer <token>`
- 响应 (200):
```json
{
  "code": 200,
  "message": "获取文档成功",
  "data": {
    "id": 1,
    "ownerId": 1,
    "fileName": "string",
    "fileType": "md",
    "fileSize": 1024,
    "parentId": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "permission": "WRITE" | "READ",
    "contentUrl": "https://...（临时签名 URL）"
  }
}
```
说明：`DocumentDetailDTO` 在列表项基础上增加 `contentUrl`（临时访问 URL）。

3.3 创建文档（空白文档）
- URL: `POST /api/document`
- 请求头: 需要 `Authorization: Bearer <token>`，`Content-Type: application/json`
- 请求体示例:
```json
{
  "fileName": "新文档.md",
  "fileType": "md",
  "parentId": 0,       // 可选
  "templateId": 123    // 可选，从模板创建
}
```
- 响应 (201/200):
```json
{
  "code": 200,
  "message": "创建文档成功",
  "data": { /* DocumentResponseDTO 格式，见上 */ }
}
```
校验：
- `fileName` 与 `fileType` 为必填；`fileType` 受 `DocumentFileType.REGEX_PATTERN` 校验。

3.4 更新文档
- 注：`DocumentController` 中 `update` 接口暂未实现（TODO）。现有 DTO:`UpdateDocumentRequestDTO` 定义可接受 `fileName`、`fileType`、`parentId` 用于后续实现。

3.5 删除文档（软删除）
- URL: `DELETE /api/document/{id}`
- 请求头: 需要 `Authorization: Bearer <token>`
- 响应:
```json
{
  "code": 200,
  "message": "删除文档成功",
  "data": null
}
```
说明：执行软删除（仅所有者可删除，状态变为 Deleted）。

3.6 上传文档
- URL: `POST /api/document/upload`
- 请求头: 需要 `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- 表单字段:
  - `file`: 文件（required，支持 .txt/.md/.docx/.pptx）
  - `parentId`: Long（可选）
- 响应:
```json
{
  "code": 200,
  "message": "上传文档成功",
  "data": { /* DocumentResponseDTO 格式 */ }
}
```

3.7 回收站列表
- URL: `GET /api/document/trash`
- 请求头: `Authorization: Bearer <token>`
- 响应: 同获取文档列表，但 `isDeleted` 为 `true` 的项

3.8 从回收站永久删除（硬删除）
- URL: `DELETE /api/document/trash/{id}`
- 请求头: `Authorization: Bearer <token>`
- 响应:
```json
{
  "code": 200,
  "message": "永久删除文档成功",
  "data": null
}
```

---

**4. 协作者相关接口**

### 4.1 获取文档协作者列表
- **URL**: `/api/documents/{documentId}/collaborators`
- **Method**: `GET`
- **Parameters**:
  - `documentId` (path, 必选): 文档ID
  - `page` (query, 可选): 当前页码
  - `size` (query, 可选): 每页数量
- **Response**:
```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": "协作者ID",
      "documentId": "文档ID",
      "userId": "用户ID",
      "permission": "权限类型 (READ/WRITE)",
      "joinedAt": "加入时间"
    }
  ]
}
```

### 4.2 添加协作者
- **URL**: `/api/documents/{documentId}/collaborators`
- **Method**: `POST`
- **Request Body**:
```json
{
  "userId": "用户ID (必选)",
  "permission": "权限类型 (READ/WRITE) (必选)"
}
```
- **Response**:
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": "协作者ID",
    "documentId": "文档ID",
    "userId": "用户ID",
    "permission": "权限类型 (READ/WRITE)",
    "joinedAt": "加入时间"
  }
}
```

### 4.3 移除协作者
- **URL**: `/api/documents/{documentId}/collaborators/{userId}`
- **Method**: `DELETE`
- **Parameters**:
  - `documentId` (path, 必选): 文档ID
  - `userId` (path, 必选): 用户ID
- **Response**: 无

### 4.4 加入共享文档
- **URL**: `/api/documents/{documentId}/join`
- **Method**: `POST`
- **Request Body**: 无
- **Response**:
``json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": "协作者ID",
    "documentId": "文档ID",
    "userId": "用户ID",
    "permission": "权限类型 (READ/WRITE)",
    "joinedAt": "加入时间"
  }
}
```

### 4.5 更新协作者权限
- **URL**: `/api/documents/{documentId}/collaborators/{userId}/permission`
- **Method**: `PUT`
- **Request Body**:
```json
{
  "permission": "权限类型 (READ/WRITE) (必选)"
}
```
- **Response**:
``json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": "协作者ID",
    "documentId": "文档ID",
    "userId": "用户ID",
    "permission": "权限类型 (READ/WRITE)",
    "joinedAt": "加入时间"
  }
}
```

---

## 典型使用场景

### 场景1：用户通过分享链接加入文档
1. 文档拥有者分享文档链接（包含文档ID）
   - 前端组件：`ShareLink.vue`
   - 链接格式：`/home/document/join/{documentId}`
2. 其他用户点击链接后，前端调用 `POST /api/documents/{documentId}/join`
3. 用户自动成为文档的协作者，获得READ权限
4. 用户可以查看文档内容

### 场景2：管理员给协作者赋予写权限
1. 文档拥有者或具有写权限的协作者查看协作者列表
2. 选择某个具有READ权限的协作者
3. 调用 `PUT /api/documents/{documentId}/collaborators/{userId}/permission` 更新权限为WRITE
4. 该协作者现在可以编辑文档内容

---

## 错误处理

所有接口都遵循统一的错误响应格式：

```json
{
  "code": 400,
  "message": "错误信息描述",
  "data": null
}
```

**常见错误：**
- `用户未登录或 token 无效` - token无效或已过期
- `文档不存在` - 文档ID无效或文档已被删除
- `文档拥有者无需加入协作者列表` - 拥有者尝试加入自己的文档
- `您已经是该文档的协作者` - 重复加入
- `该用户不是协作者` - 尝试更新不存在的协作者权限
- `无权更新协作者权限` - 当前用户没有足够的权限
- `权限值无效，只能是 'read' 或 'write'` - permission参数值不正确



