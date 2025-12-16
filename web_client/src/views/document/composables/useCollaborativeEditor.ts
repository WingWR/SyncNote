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

export function useCollaborativeEditor(container: HTMLElement | null, docId: number) {
  const userStore = useUserStore()
  const ydoc = new Y.Doc()
  const ytext = ydoc.getText('content')
  const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:8080/ws/document/${docId}`
  const provider = new WebsocketProvider(wsUrl, `document-${docId}`, ydoc)

  // 正确类型
  const editor: ShallowRef<Editor | undefined> = shallowRef()

  async function init() {
    await nextTick()
    if (!container) return

    // useEditor 返回 ShallowRef<Editor | undefined>
    editor.value = useEditor({
      element: container,
      extensions: [
        StarterKit,
        Collaboration.configure({ document: ydoc }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: userStore.currentUser?.username || 'Anonymous',
            color: '#3b82f6'
          }
        })
      ],
      content: ytext.toString()
    }) as unknown as Editor
  }

  function destroy() {
    editor.value?.destroy()
    provider.destroy()
    ydoc.destroy()
  }

  return { editor, ydoc, ytext, init, destroy }
}
