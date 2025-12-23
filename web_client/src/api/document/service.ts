import api from "../index";
import * as Y from 'yjs';
import type {
  Document,
  DocumentCollaborator,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  AddCollaboratorRequest,
  UpdateCollaboratorPermissionRequest,
  ApiResponse,
  DocumentDetailResponse,
  GetDocumentDetailBase64State,
  CollaboratorSimpleInfo
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
  return api.get<ApiResponse<string>>(`/documents/${id}/state`);
}

// 更新 Yjs 二进制状态
export function updateDocumentState(
  id: string,
  data: GetDocumentDetailBase64State
): Promise<ApiResponse<String>>{
  return api.post<ApiResponse<String>>(`/documents/${id}/state`, data);
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

export async function uploadDocument(
  file: File,
  parentId?: string
): Promise<ApiResponse<Document>> {
  const text = await file.text();

  const ydoc = new Y.Doc();
  // 简化处理：统一使用Text类型，编辑器会处理转换
  const ytext = ydoc.getText('content');
  ytext.insert(0, text);
  const stateUpdate = Y.encodeStateAsUpdate(ydoc);
  
  // 3. 转 Base64 (安全处理大文件)
  const base64State = btoa(
    new Uint8Array(stateUpdate).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );

  const formData = new FormData();
  formData.append("file", file);
  if (parentId !== undefined) {
    formData.append("parentId", parentId.toString());
  }

  formData.append("base64State", base64State);

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

// 恢复文档（从回收站恢复）
export function restoreDocument(id: string): Promise<ApiResponse<null>> {
  return api.post<ApiResponse<null>>(`/documents/trash/${id}/restore`);
}

// 协作者相关API - 匹配后端路径 /api/documents (复数)
export function getCollaborators(
  documentId: string
): Promise<ApiResponse<CollaboratorSimpleInfo[]>> {
  return api.get<ApiResponse<CollaboratorSimpleInfo[]>>(
    `/documents/${documentId}/collaborators`
  );
}

export function addCollaborator(
  documentId: string,
  data: AddCollaboratorRequest
): Promise<ApiResponse<CollaboratorSimpleInfo>> {
  return api.post<ApiResponse<CollaboratorSimpleInfo>>(
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
