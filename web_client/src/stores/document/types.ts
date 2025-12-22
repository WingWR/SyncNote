// 前端文件编辑部分数据类型定义 - 匹配后端API字段
export interface Document {
  id: string;
  ownerId: string;
  fileName: string; // 匹配后端字段名
  fileType: "txt" | "md" | "docx" | "pptx"; // 匹配后端字段名
  fileSize: number; // 匹配后端字段名
  parentId?: string; // 可选，因为根目录文档可能为null
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  permission: "READ" | "WRITE" | "OWNER"; // 匹配后端大写格式，必选
  contentUrl?: string; // 可选字段，部分API（如详情）返回
}

export interface DocumentCollaborator {
  id: string;
  documentId: string;
  userId: string;
  permission: "READ" | "WRITE" | "OWNER"; // 匹配后端大写格式
  joinedAt: string;
}
