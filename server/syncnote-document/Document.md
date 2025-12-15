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
  "code": 0,
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
  "code": 0,
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
  "code": 0,
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
  "code": 0,
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
  "code": 0,
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
  "code": 0,
  "message": "永久删除文档成功",
  "data": null
}
```

---

**4. 协作者相关接口 (Collaborator — 更新)**

- 基础路径：`/api/documents`（控制器使用复数 `documents`）

4.1 获取文档协作者列表
- URL: `GET /api/documents/{documentId}/collaborators`
- 请求头: `Authorization: Bearer <token>`
- 响应:
```json
{
  "code": 0,
  "message": "获取协作者列表成功",
  "data": [
    {
      "id": 1,
      "documentId": 1,
      "userId": 2,
      "permission": "READ" | "WRITE" ,
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```
说明：`CollaboratorResponseDTO.permission` 在当前实现中使用大写 `"READ" 或 "WRITE" (大写)`。

4.2 添加协作者
- URL: `POST /api/documents/{documentId}/collaborators`
- 请求头: `Authorization: Bearer <token>`, `Content-Type: application/json`
- 请求体示例:
```json
{
  "userId": 2,
  "permission": "READ"   // "READ" 或 "WRITE" (大写)
}
```
- 响应:
```json
{
  "code": 0,
  "message": "添加协作者成功",
  "data": { /* CollaboratorResponseDTO */ }
}
```

4.3 移除协作者
- URL: `DELETE /api/documents/{documentId}/collaborators/{userId}`
- 请求头: `Authorization: Bearer <token>`
- 响应:
```json
{
  "code": 0,
  "message": "移除协作者成功",
  "data": null
}
```

