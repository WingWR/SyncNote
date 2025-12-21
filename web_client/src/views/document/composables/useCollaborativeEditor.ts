import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { getDocumentState } from '../../../api/document'

export function useCollaborativeEditor(docId: string) {
  const ydoc = new Y.Doc()
  const isLoaded = ref(false) // 标记历史数据是否加载完成

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws/document`;
  // 1. 初始化 Provider，但先不连接 (手动控制 connect)
  const provider = new WebsocketProvider(wsUrl, docId.toString(), ydoc, { connect: false })

  const loadHistoryAndConnect = async () => {
    try {
      // 确保 Yjs 文档有正确的初始结构
      // 对于 Markdown 编辑器，我们使用 XmlFragment
      // 对于其他编辑器类型，可以使用不同的字段名或逻辑

      const res = await getDocumentState(docId.toString())

      if (res.code !== 200) {
        console.warn('[Yjs] 获取文档状态失败:', res.message)
        // 即使获取失败，也要连接到协作服务器，从空状态开始
        provider.connect()
        isLoaded.value = true
        return
      }

      // 如果有数据，应用状态
      if (res.data) {
        try {
          const base64Data: string = String(res.data)

          // 首先尝试解码Base64数据
          let binary: Uint8Array
          try {
            binary = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
          } catch (decodeError) {
            throw new Error(`Base64解码失败: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`)
          }

          // 然后尝试应用到Yjs文档
          ydoc.transact(() => {
            Y.applyUpdate(ydoc, binary)
          }, 'local-initial-load')

          console.log('[Yjs] 历史数据注入成功')
        } catch (updateError) {
          const errorMessage = updateError instanceof Error ? updateError.message : String(updateError)
          console.warn('[Yjs] 历史数据加载失败，从空状态开始:', errorMessage)

          // 记录迁移信息到本地存储，用于后续分析和恢复
          try {
            const migrationRecord = {
              docId,
              error: errorMessage,
              timestamp: Date.now(),
              dataSize: res.data.length,
              dataPreview: res.data.substring(0, 50) + '...', // 只保存前50个字符用于分析
              userAgent: navigator.userAgent
            }
            localStorage.setItem(`doc_migration_${docId}`, JSON.stringify(migrationRecord))
            console.log('[Yjs] 迁移记录已保存，可用于后续数据恢复')
          } catch (storageError) {
            console.warn('[Yjs] 无法保存迁移记录:', storageError)
          }

          // 从空状态开始，编辑器会正常工作
          console.log('[Yjs] 文档将从空状态开始，用户可重新编辑内容')
        }
      }

      provider.connect()
      isLoaded.value = true

    } catch (e) {
      // 加载失败的处理逻辑
      console.error('[Yjs] 核心初始化失败:', e)

      // 即使初始化失败，也要尝试连接
      try {
        provider.connect()
        isLoaded.value = true
      } catch (connectError) {
        console.error('[Yjs] 连接失败:', connectError)
        provider.disconnect()
      }
    }
  }

  // 不自动执行初始化，由调用者控制

  onUnmounted(() => {
    provider.disconnect() // 先断开连接
    provider.destroy()    // 再销毁
    ydoc.destroy()
  })

  return { ydoc, provider, isLoaded, loadHistoryAndConnect }
}
