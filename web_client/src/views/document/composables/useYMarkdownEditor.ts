import type { ShallowRef } from 'vue'
import { Editor } from '@tiptap/vue-3'
import { shallowRef } from 'vue'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
// import Table from '@tiptap/extension-table'
// import TableRow from '@tiptap/extension-table-row'
// import TableHeader from '@tiptap/extension-table-header'
// import TableCell from '@tiptap/extension-table-cell'
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
        StarterKit.configure({
          history: false,
        }),
        Collaboration.configure({
          document: ydoc,
          fragment: ydoc.get('prosemirror', Y.XmlFragment) // 使用 XmlFragment
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: username,
            color: stringToColor(username)
          },
          render: (user) => {
            // 光标本身 - 只显示颜色，不占据整行
            const cursor = document.createElement('span')
            cursor.classList.add('collaboration-cursor__caret')
            cursor.setAttribute('style', `border-color: ${user.color}; border-left-width: 2px; border-left-style: solid; margin-left: -1px; display: inline-block; height: 1em;`)

            // 用户名标签 - 显示在光标左上角作为上标
            const label = document.createElement('span')
            label.classList.add('collaboration-cursor__label')
            label.setAttribute('style', `position: absolute; top: -1.2em; left: -1px; font-size: 10px; font-weight: 600; color: ${user.color}; background-color: rgba(255, 255, 255, 0.9); padding: 2px 4px; border-radius: 3px; border: 1px solid ${user.color}; white-space: nowrap; pointer-events: none; user-select: none; z-index: 10; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.1);`)
            label.textContent = user.name

            // 容器 - 使用相对定位，使标签能够相对于光标定位
            const container = document.createElement('span')
            container.classList.add('collaboration-cursor')
            container.setAttribute('style', 'position: relative; display: inline-block; margin-left: -1px; margin-right: -1px;')
            container.appendChild(cursor)
            container.appendChild(label)

            return container
          }
        })
      ]
    })

    // 确保编辑器有一个有效的初始状态
    setTimeout(() => {
      if (editor.value) {
        try {
          // 确保光标位置有效
          const { state } = editor.value
          const { tr } = state
          // 如果文档为空，确保有一个段落
          if (state.doc.content.size === 0) {
            const paragraph = state.schema.nodes.paragraph
            if (paragraph) {
              tr.insert(0, paragraph.create())
              editor.value.view.dispatch(tr)
            }
          }
        } catch (error) {
          console.warn('[Editor] 初始化状态设置失败:', error)
        }
      }
    }, 100)
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