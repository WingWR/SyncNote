<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ currentDocName }}
        </h2>
        <span class="text-sm text-gray-500">
          {{ currentDocType.toUpperCase() }}
        </span>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- 切换编辑器类型 -->
        <select
          v-model="currentDocType"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg"
          @change="switchEditorType"
        >
          <option value="txt">文本编辑器 (.txt)</option>
          <option value="md">Markdown 编辑器 (.md)</option>
        </select>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="flex-1 overflow-auto p-6">
      <!-- TipTap编辑器（用于.md格式） -->
      <div
        v-if="currentDocType === 'md'"
        ref="editorContainer"
        class="prose max-w-none focus:outline-none"
      ></div>
      
      <!-- 文本编辑器（用于.txt格式） -->
      <textarea
        v-else-if="currentDocType === 'txt'"
        v-model="textContent"
        class="w-full h-full border-none outline-none resize-none font-mono text-sm"
        placeholder="开始输入..."
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const currentDocType = ref<'txt' | 'md'>('txt')
const currentDocName = ref('测试文档')
const editorContainer = ref<HTMLElement | null>(null)
const textContent = ref('这是一个文本编辑器的测试内容。\n\n你可以在这里输入多行文本。\n\n支持基本的文本编辑功能。')
let editor: ReturnType<typeof useEditor> | null = null

// 初始化 Markdown 编辑器
async function initMarkdownEditor() {
  await nextTick()
  if (!editorContainer.value) return

  // 清理旧的编辑器
  if (editor?.value) {
    editor.value.destroy()
  }

  editor = useEditor({
    element: editorContainer.value,
    extensions: [StarterKit],
    content: `
# 欢迎使用 Markdown 编辑器

这是一个 **TipTap** 编辑器的测试页面。

## 功能特性

- 支持 Markdown 语法
- 实时预览
- 富文本编辑

### 示例内容

你可以在这里输入 Markdown 内容：

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

> 这是一个引用块

- 列表项 1
- 列表项 2
- 列表项 3
    `.trim()
  })
}

// 切换编辑器类型
async function switchEditorType() {
  if (currentDocType.value === 'md') {
    await initMarkdownEditor()
  }
}

watch(currentDocType, async (newType) => {
  if (newType === 'md') {
    await initMarkdownEditor()
  }
})

onMounted(async () => {
  // 默认显示文本编辑器，可以切换
  if (currentDocType.value === 'md') {
    await initMarkdownEditor()
  }
})

onUnmounted(() => {
  if (editor?.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
/* TipTap编辑器样式 */
:deep(.ProseMirror) {
  outline: none;
  min-height: 100%;
}

:deep(.ProseMirror p) {
  margin: 0.75em 0;
}

:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3) {
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.ProseMirror h1) {
  font-size: 2em;
}

:deep(.ProseMirror h2) {
  font-size: 1.5em;
}

:deep(.ProseMirror h3) {
  font-size: 1.25em;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.75em 0;
}

:deep(.ProseMirror code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-family: monospace;
}

:deep(.ProseMirror pre) {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 0.75em 0;
}

:deep(.ProseMirror pre code) {
  background-color: transparent;
  padding: 0;
}
</style>


