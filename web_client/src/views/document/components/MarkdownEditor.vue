<template>
  <!-- TipTap 编辑器容器 -->
  <div
    ref="editorContainer"
    class="prose max-w-none h-full focus:outline-none"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useYMarkdownEditor } from '../composables/useYMarkdownEditor'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

/**
 * TipTap 挂载容器
 */
const editorContainer = ref<HTMLElement | null>(null)

const route = useRoute()

let ydoc: Y.Doc | null = null
let provider: WebsocketProvider | null = null

let editorInstance:
  | ReturnType<typeof useYMarkdownEditor>
  | null = null

/**
 * 初始化编辑器
 */
async function initEditor() {
  const docId = route.params.id as string
  if (!docId || !editorContainer.value) return
  ydoc = new Y.Doc()
  provider = new WebsocketProvider(
      import.meta.env.VITE_WS_URL || 'http://139.196.151.22:8080',
      docId,
      ydoc
  )
  editorInstance = useYMarkdownEditor(
      editorContainer.value, // 第1个参数：DOM 容器
      docId,                 // 第2个参数：文档 ID
      ydoc,                  // 第3个参数：Yjs Doc
      provider               // 第4个参数：WS Provider
  )

  await editorInstance.init()
}

/**
 * 销毁编辑器
 */
function destroyEditor() {
  editorInstance?.destroy()
  editorInstance = null
}

/**
 * 生命周期
 */
onMounted(initEditor)
onUnmounted(destroyEditor)

/**
 * 路由切换（同组件不同文档）
 */
watch(
  () => route.params.id,
  async () => {
    destroyEditor()
    await initEditor()
  }
)
</script>

<style scoped>
.ProseMirror p {
  margin: 0.75em 0;
}

.ProseMirror h1 {
  font-size: 2em;
  font-weight: 600;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: 600;
}

.ProseMirror h3 {
  font-size: 1.25em;
  font-weight: 600;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 1.5em;
}

.ProseMirror pre {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
}
</style>
