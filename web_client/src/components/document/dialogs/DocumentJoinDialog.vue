<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">加入共享文件</h3>
      <input
        :v-model="documentId"
        type="text"
        placeholder="请输入文档ID"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
      />
      <div class="flex gap-2 justify-end">
        <button @click="close" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">取消</button>
        <button @click="$emit('join')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">加入</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  visible: Boolean,
  documentId: String
})

const emit = defineEmits(['update:visible', 'update:documentId', 'join'])

function close() {
  emit('update:visible', false)
}
</script>
