// 前端文件编辑部分数据类型定义
export interface Document {
  id: number
  ownerId: number
  name: string
  type: 'txt' | 'md' | 'docx' | 'pptx'
  sizeBytes: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  permission?: 'read' | 'write'
}

export interface DocumentCollaborator {
  id: number
  documentId: number
  userId: number
  permission: 'read' | 'write'
  joinedAt: string
}