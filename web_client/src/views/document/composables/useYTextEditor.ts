import type { Doc, Text } from 'yjs'
import { ref, onBeforeUnmount } from 'vue'

export function useYTextEditor(_ydoc: Doc, ytext: Text) {
  const textContent = ref(ytext.toString())

  // Y.Text observer
  const observer = () => {
    textContent.value = ytext.toString()
  }

  ytext.observe(observer)

  // 组件卸载时取消监听
  onBeforeUnmount(() => {
    ytext.unobserve(observer)
  })

  // 输入时同步到 Y.Text
  function handleTextInput() {
    const current = ytext.toString()
    if (textContent.value !== current) {
      ytext.delete(0, current.length)
      ytext.insert(0, textContent.value)
    }
  }

  return { textContent, handleTextInput }
}
