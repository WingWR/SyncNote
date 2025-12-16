<template>
  <div :class="['p-4 rounded-lg', bg]">
    <h3 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
      <component :is="iconComponent" :size="20" :class="iconColor" />
      {{ title }}
    </h3>
    <p class="text-gray-600 text-sm">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { FileText, Users, Bot, Shield } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  bg: string
  icon: 'FileText' | 'Users' | 'Bot' | 'Shield'
  iconColor: string
  title: string
  description: string
}>()

const iconMap = { FileText, Users, Bot, Shield }
const iconComponent = computed(() => iconMap[props.icon])
</script>
