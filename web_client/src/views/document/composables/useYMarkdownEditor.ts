import type { ShallowRef } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { shallowRef, nextTick } from 'vue'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useUserStore } from '../../../stores/user'

export function useMarkdownEditor(
  container: HTMLElement | null,
  docId: string
) {
  const userStore = useUserStore()

  const ydoc = new Y.Doc()
  const ytext = ydoc.getText('content')

  const wsUrl =
    import.meta.env.VITE_WS_URL ||
    `ws://localhost:8080/ws/document/${docId}`

  const provider = new WebsocketProvider(
    wsUrl,
    `document-${docId}`,
    ydoc
  )

  // TipTap 的标准类型（与你现在的一致）
  const editor: ShallowRef<Editor | undefined> = shallowRef()

  async function init() {
    await nextTick()
    if (!container) return

    editor.value = useEditor({
      element: container,
      extensions: [
        StarterKit,
        Collaboration.configure({
          document: ydoc
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: userStore.currentUser?.username || 'Anonymous',
            color: '#3b82f6'
          }
        })
      ],
      content: ytext.toString()
    }).value
  }

  function destroy() {
    editor.value?.destroy()
    provider.destroy()
    ydoc.destroy()
  }

  return {
    editor,
    ydoc,
    ytext,
    init,
    destroy
  }
}