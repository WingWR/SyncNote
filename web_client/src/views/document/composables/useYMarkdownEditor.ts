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
import { Plugin } from '@tiptap/pm/state'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useUserStore } from '../../../stores/user'
import { useDocumentStore } from '../../../stores/document'
import { useYjsAutoSave } from './useYjsAutoSave'
import { marked } from 'marked'
import { Extension, Mark } from '@tiptap/core'

// Markdown粘贴扩展
const MarkdownPaste = Extension.create({
  name: 'markdownPaste',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const pastedText = event.clipboardData?.getData('text/plain')
            if (!pastedText) return false

            // 检查是否包含Markdown语法
            const hasMarkdown = /#{1,6}\s+|^\s*[-*+]\s+|^\s*\d+\.\s+|^\s*>\s+|\*\*.*?\*\*|\*.*?\*|`.+?`|^\s*```/.test(pastedText)

            if (hasMarkdown) {
              console.log('[MarkdownPaste] 检测到Markdown语法，使用marked转换')

              event.preventDefault()

              try {
                // 使用marked将Markdown转换为HTML
                const html = marked.parse(pastedText, {
                  breaks: true,
                  gfm: true
                })

                // 获取当前编辑器实例并插入HTML内容
                const editor = (view as any).editor
                if (editor) {
                  editor.commands.insertContent(html)
                  return true
                }
              } catch (error) {
                console.warn('[MarkdownPaste] 转换失败:', error)
              }

              // 如果转换失败或无法获取editor，回退到插入原文
              const { state, dispatch } = view
              const { tr } = state
              tr.insertText(pastedText)
              dispatch(tr)
              return true
            }

            return false // 让其他处理器处理普通粘贴
          }
        }
      })
    ]
  }
})

// AI临时文本标记
const AITemporaryText = Mark.create({
  name: 'aiTemporaryText',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'ai-temporary-text',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span.ai-temporary-text',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0]
  },
})

// 移除复杂的粘贴处理，使用更简单的方法
// 依赖TipTap的原生功能和键盘快捷键

export function useYMarkdownEditor(
  docId: string,
  ydoc: Y.Doc,
  provider: WebsocketProvider
) {
  const userStore = useUserStore()
  const documentStore = useDocumentStore()
  // TipTap 的标准类型
  const editor: ShallowRef<Editor | undefined> = shallowRef()

  // 使用统一保存逻辑
  const { destroy: destroyAutoSave, manualSave } = useYjsAutoSave(ydoc, docId)

  async function init() {
    const username = userStore.currentUser?.username || 'Anonymous'

    // 销毁旧的编辑器实例
    if (editor.value) {
      editor.value.destroy()
    }

    // 初始化 TipTap 编辑器
    editor.value = new Editor({
      extensions: [
        StarterKit.configure({ history: false }), // 历史记录由 Yjs 接管
        MarkdownPaste,
        AITemporaryText,
        Collaboration.configure({
          document: ydoc,
          field: 'content-xml' // 修改字段名，避免与 txt 模式的 Text 类型冲突
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

    // 初始内容加载逻辑
    const yXmlFragment = ydoc.getXmlFragment('content-xml')
    if (yXmlFragment.toJSON() === '' && documentStore.currentDocument?.contentUrl) {
      try {
        const res = await fetch(documentStore.currentDocument.contentUrl)
        if (res.ok) {
          const text = await res.text()
          // 使用 marked 解析 Markdown 为 HTML
          const html = await marked(text)
          // 注入内容，Collaboration 扩展会自动同步到 Yjs
          editor.value.commands.setContent(html)
        }
      } catch (e) {
        console.error('加载初始内容失败:', e)
      }
    }

    // 确保编辑器有一个有效的初始状态
    setTimeout(() => {
      if (editor.value) {
        try {
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
    if (editor.value) {
      editor.value.destroy()
      editor.value = undefined
    }
  }

  // 根据用户名随机分配颜色，减少相同
  function stringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    // 将 Hash 转换为 6 位十六进制
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  }

  /**
   * 获取当前光标位置
   */
  function getCursorPosition() {
    if (!editor.value) return null
    const { from, to } = editor.value.state.selection
    return { from, to }
  }

  /**
   * 聚焦编辑器
   */
  function focus() {
    if (editor.value) {
      editor.value.commands.focus()
    }
  }

  return {
    editor,
    init,
    destroy,
    manualSave,
    getCursorPosition,
    focus
  }
}