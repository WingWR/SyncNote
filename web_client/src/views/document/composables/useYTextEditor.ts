import { ref, onBeforeUnmount } from 'vue'
import * as Y from 'yjs'
import { useYjsAutoSave } from './useYjsAutoSave'

export function useYTextEditor(_ydoc: Y.Doc, docId: string) {
  const ytext = _ydoc.getText('content')
  const textContent = ref(ytext.toString())

  // 使用统一保存逻辑
  const { destroy: destroyAutoSave } = useYjsAutoSave(_ydoc, docId)

  // Y.Text observer
  const observer = (event: Y.YTextEvent) => {
    // 只有非本地更新（即来自别人的更新）时，才同步到响应式 ref
    // 避免 handleTextInput 触发 ydoc 变更，ydoc 又触发 observer 的死循环
    if (event.transaction.local) return
    textContent.value = ytext.toString()
  }
  ytext.observe(observer)

  // 输入时同步到 Y.Text
  function handleTextInput() {
    const current = ytext.toString()
    if (textContent.value !== current) {
      _ydoc.transact(() => {
        ytext.delete(0, current.length)
        ytext.insert(0, textContent.value)
      })
    }
  }

  onBeforeUnmount(() => {
    destroyAutoSave()
    ytext.unobserve(observer)
  })

  return {
    textContent, handleTextInput, destroy: () => {
      destroyAutoSave()
      ytext.unobserve(observer)
    }
  }
}
