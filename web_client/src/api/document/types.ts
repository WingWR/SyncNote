import type {
  Document,
  DocumentCollaborator,
} from "../../stores/document/types";

// 后端API响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 创建文档请求 - 匹配后端API
export interface CreateDocumentRequest {
  fileName: string;
  fileType: "txt" | "md" | "docx" | "pptx";
  parentId?: string;
  templateId?: string;
}

// 更新文档请求 - 匹配后端API
export interface UpdateDocumentRequest {
  fileName?: string;
  fileType?: "txt" | "md" | "docx" | "pptx";
  parentId?: string;
}

// 添加协作者请求 - 匹配后端API
export interface AddCollaboratorRequest {
  userId: string;
  permission: "READ" | "WRITE"| "OWNER"; // 后端使用大写
}

// 更新协作者权限请求 - 匹配后端API
export interface UpdateCollaboratorPermissionRequest {
  permission: "READ" | "WRITE" | "OWNER"; // 后端使用大写
}

// 文档详情响应 - 包含contentUrl
export interface DocumentDetailResponse extends Document {
  contentUrl: string;
}

export interface GetDocumentDetailBase64State{
  base64State: string;
}

// 如果需要，可以导出 Document、DocumentCollaborator
export type { Document, DocumentCollaborator };
