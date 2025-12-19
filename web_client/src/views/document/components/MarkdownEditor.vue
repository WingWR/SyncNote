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
import { useMarkdownEditor } from '../composables/useYMarkdownEditor'

/**
 * TipTap 挂载容器
 */
const editorContainer = ref<HTMLElement | null>(null)

const route = useRoute()

let editorInstance:
  | ReturnType<typeof useMarkdownEditor>
  | null = null

/**
 * 初始化编辑器
 */
async function initEditor() {
  const docId = route.params.id as string
  if (!docId || !editorContainer.value) return

  editorInstance = useMarkdownEditor(
    editorContainer.value,
    docId
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
/* TipTap 基础样式补充（你也可以放到全局） */
.ProseMirror {
  outline: none;
  min-height: 100%;
}

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
