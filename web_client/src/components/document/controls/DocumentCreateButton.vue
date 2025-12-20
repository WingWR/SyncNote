<template>
  <button class="w-full flex flex-col items-center gap-1 px-3 py-4 text-[11px] text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
    <FilePlus :size="24" />
    <span>新建文件</span>
  </button>
</template>

<script setup lang="ts">
import { FilePlus } from 'lucide-vue-next'
</script>
