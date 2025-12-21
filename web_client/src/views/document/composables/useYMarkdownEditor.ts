import type { ShallowRef } from 'vue'
import { Editor } from '@tiptap/vue-3'
import { shallowRef } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useUserStore } from '../../../stores/user'
import { useYjsAutoSave } from './useYjsAutoSave'

export function useYMarkdownEditor(
    element: HTMLElement,
    docId: string,
    ydoc: Y.Doc,
    provider: WebsocketProvider
) {
  const userStore = useUserStore()
  // TipTap 的标准类型（与现在的一致）
  const editor: ShallowRef<Editor | undefined> = shallowRef()

  // 使用统一保存逻辑
  const { destroy: destroyAutoSave } = useYjsAutoSave(ydoc, docId)

  async function init() {
    const username = userStore.currentUser?.username || 'Anonymous'

    editor.value = new Editor({
      element,
      extensions: [
        StarterKit.configure({ history: false }),
        Collaboration.configure({
          document: ydoc,
          field: 'content' // 此处必须和ydoc一致
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: username,
            color: stringToColor(username)
          }
        })
      ]
    })
  }

  function destroy() {
    destroyAutoSave()
    editor.value?.destroy()
  }

  // 根据用户名随机分配颜色，减少相同
  function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  return {
    editor,
    init,
    destroy
  }
}