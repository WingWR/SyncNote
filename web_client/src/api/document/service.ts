import api from "../index";
import type {
  Document,
  DocumentCollaborator,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  AddCollaboratorRequest,
  UpdateCollaboratorPermissionRequest,
  ApiResponse,
  DocumentDetailResponse,
} from "./types";

// 文档相关API - 统一使用 /api/documents 路径
export function getDocuments(): Promise<ApiResponse<Document[]>> {
  return api.get<ApiResponse<Document[]>>("/documents");
}

export function getDocument(
  id: string
): Promise<ApiResponse<DocumentDetailResponse>> {
  return api.get<ApiResponse<DocumentDetailResponse>>(`/documents/${id}`);
}

// 获取 Yjs 二进制状态
export function getDocumentState(
  id: string
): Promise<ApiResponse<String>> {
  return api.get<ApiResponse<string>>(`/api/document/${id}/state`);
}

// 更新 Yjs 二进制状态
export function updateDocumentState(
  id: string,
  base64State: string
): Promise<ApiResponse<String>>{
  return api.post<ApiResponse<String>>(`/api/document/${id}/state`, base64State);
}

export function createDocument(
  data: CreateDocumentRequest
): Promise<ApiResponse<Document>> {
  return api.post<ApiResponse<Document>>("/documents", data);
}

export function updateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<ApiResponse<Document>> {
  return api.put<ApiResponse<Document>>(`/documents/${id}`, data);
}

export function deleteDocument(id: string): Promise<ApiResponse<null>> {
  return api.delete<ApiResponse<null>>(`/documents/${id}`);
}

export function uploadDocument(
  file: File,
  parentId?: string
): Promise<ApiResponse<Document>> {
  const formData = new FormData();
  formData.append("file", file);
  if (parentId !== undefined) {
    formData.append("parentId", parentId.toString());
  }
  return api.post<ApiResponse<Document>>("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 回收站相关API
export function getTrashDocuments(): Promise<ApiResponse<Document[]>> {
  return api.get<ApiResponse<Document[]>>("/documents/trash");
}

export function permanentDeleteDocument(
  id: string
): Promise<ApiResponse<null>> {
  return api.delete<ApiResponse<null>>(`/documents/trash/${id}`);
}

// 协作者相关API - 匹配后端路径 /api/documents (复数)
export function getCollaborators(
  documentId: string
): Promise<ApiResponse<DocumentCollaborator[]>> {
  return api.get<ApiResponse<DocumentCollaborator[]>>(
    `/documents/${documentId}/collaborators`
  );
}

export function addCollaborator(
  documentId: string,
  data: AddCollaboratorRequest
): Promise<ApiResponse<DocumentCollaborator>> {
  return api.post<ApiResponse<DocumentCollaborator>>(
    `/documents/${documentId}/collaborators`,
    data
  );
}

export function removeCollaborator(
  documentId: string,
  userId: string
): Promise<ApiResponse<null>> {
  return api.delete<ApiResponse<null>>(
    `/documents/${documentId}/collaborators/${userId}`
  );
}

// 加入共享文档 - 用户通过文档ID直接加入协作者列表（默认READ权限）
export function joinSharedDocument(
  documentId: string
): Promise<ApiResponse<DocumentCollaborator>> {
  return api.post<ApiResponse<DocumentCollaborator>>(
    `/documents/${documentId}/join`
  );
}

// 更新协作者权限 - 拥有写权限的人可以更新协作者权限
export function updateCollaboratorPermission(
  documentId: string,
  userId: string,
  data: UpdateCollaboratorPermissionRequest
): Promise<ApiResponse<DocumentCollaborator>> {
  return api.put<ApiResponse<DocumentCollaborator>>(
    `/documents/${documentId}/collaborators/${userId}/permission`,
    data
  );
}
