<template>
  <textarea
    v-model="textContent"
    @input="handleTextInput"
    class="w-full h-full border-none outline-none resize-none font-mono text-sm"
    placeholder="开始输入..."
  ></textarea>
</template>

<script setup lang="ts">
import type { Doc, Text } from 'yjs'
import { useYTextEditor } from '../composables/useYTextEditor'

interface Props {
  ydoc: Doc
  ytext: Text
}

const props = defineProps<Props>()

const { textContent, handleTextInput } = useYTextEditor(props.ydoc, props.ytext)
</script>
