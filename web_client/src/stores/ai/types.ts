export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean

  // 业务模式与文档关联（用于续写 / 润色等）
  mode?: 'chat' | 'polish' | 'continue'
  documentId?: string
  // 是否作为文档编辑建议，以及用户是否接受/拒绝
  isSuggestion?: boolean
  accepted?: boolean
  rejected?: boolean
}

export interface AIChat {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface AIModel {
  id: string
  name: string
  provider: string
}

export type AIEditOperationType = 'append' | 'replace'

/**
 * AI 产生的对文档的编辑操作（命令对象），由桥接层执行到具体编辑器
 */
export interface AIEditOperation {
  type: AIEditOperationType
  documentId: string
  targetText?: string
  replacementText: string
}

/**
 * AI 流式输出到编辑器的临时文本状态（用于 continue/polish 模式）
 * 文本会以特殊样式显示在编辑器中，等待用户接受/拒绝
 */
export interface AITemporaryEdit {
  documentId: string
  messageId: string              // 对应的 AI 消息 ID
  mode: 'continue' | 'polish'
  content: string                 // 当前累积的文本内容
  isStreaming: boolean           // 是否还在流式输出中
  insertionPoint?: {             // 插入位置（TipTap 用 from/to，textarea 用 index）
    from?: number
    to?: number
    index?: number
  }
  // 对于润色模式，存储原始选中范围，用于替换操作
  originalSelection?: {
    from?: number
    to?: number
    index?: number
    endIndex?: number
  }
}

export interface AIState {
  chats: AIChat[]
  currentChatId: string | null
  currentModel: AIModel
  availableModels: AIModel[]
  isLoading: boolean
  isStreaming: boolean
  mode: 'chat' | 'polish' | 'continue'

  /**
   * 当前 AI 面板关联的文档，用于续写/润色上下文
   */
  currentDocumentId: string | null

  /**
   * 待执行到编辑器的 AI 编辑操作，由桥接层消费
   */
  pendingEdit: AIEditOperation | null

  /**
   * 正在流式写入编辑器的临时文本（continue/polish 模式）
   * 文本以特殊样式显示，等待用户接受/拒绝
   */
  temporaryEdit: AITemporaryEdit | null

  /**
   * 当前文档的编辑器回调（由 DocumentEditor 注册）
   * 用于 continue/polish 模式时获取光标位置和聚焦编辑器
   */
  editorCallbacks?: {
    getInsertionPoint: () => { from: number; to: number } | { index: number } | null
    focusEditor: () => void
  } | null

  /**
   * 错误状态管理 - 解耦错误处理逻辑
   */
  errors: AIError[]
}

export interface AIError {
  type: 'network' | 'model' | 'chat' | 'stream'
  message: string
  timestamp: Date
}