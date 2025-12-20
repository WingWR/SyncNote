import { onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export function useCollaborativeEditor(docId: number) {
  const ydoc = new Y.Doc()
 
  const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8080/ws/document/${docId}`
  const provider = new WebsocketProvider(wsUrl, `document-${docId}`, ydoc)

  onUnmounted(() => {
    provider.destroy()
    ydoc.destroy()
  })

  return { ydoc, provider }
}
