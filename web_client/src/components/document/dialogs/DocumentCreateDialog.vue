<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">新建文件</h3>
      <input
        :v-model="name"
        type="text"
        placeholder="请输入文档名称"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
      />
      <select :v-model="type" class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
        <option value="txt">文本文件 (.txt)</option>
        <option value="md">Markdown (.md)</option>
        <option value="docx">Word文档 (.docx)</option>
        <option value="pptx">PowerPoint (.pptx)</option>
      </select>
      <div class="flex gap-2 justify-end">
        <button @click="close" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
        <button @click="$emit('create')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">创建</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: Boolean,
  name: String,
  type: String
})

const emit = defineEmits(['update:visible', 'update:name', 'update:type', 'create'])

function close() {
  emit('update:visible', false)
}
</script>
