import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { getDocumentState } from '../../../api/document/service'

export function useCollaborativeEditor(docId: string) {
  const ydoc = new Y.Doc()
  const isLoaded = ref(false) // 标记历史数据是否加载完成

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/document'
  // 1. 初始化 Provider，但先不连接 (手动控制 connect)
  const provider = new WebsocketProvider(wsUrl, docId.toString(), ydoc, { connect: false })

  const loadHistoryAndConnect = async () => {
    try {
      const res = await getDocumentState(docId.toString())

      if (res.code !== 200) {
        throw new Error(res.message || '无法获取文档初始状态')
      }

      // 如果有数据，应用状态
      if (res.data) {
        const base64Data: string = String(res.data)
        const binary = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

        ydoc.transact(() => {
          Y.applyUpdate(ydoc, binary)
        }, 'local-initial-load')

        console.log('[Yjs] 历史数据注入成功')
      }

      provider.connect()
      isLoaded.value = true

    } catch (e) {
      // 加载失败的处理逻辑
      console.error('[Yjs] 核心初始化失败:', e)
      
      provider.disconnect()
    }
  }

  // 执行初始化
  loadHistoryAndConnect()

  onUnmounted(() => {
    provider.disconnect() // 先断开连接
    provider.destroy()    // 再销毁
    ydoc.destroy()
  })

  return { ydoc, provider, isLoaded }
}
