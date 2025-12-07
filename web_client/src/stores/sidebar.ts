import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SidebarPanel = 'document' | 'workspace' | 'ai' | null

export const useSidebarStore = defineStore('sidebar', () => {
  const activePanel = ref<SidebarPanel>(null)

  function openPanel(panel: SidebarPanel) {
    activePanel.value = panel
  }

  function closePanel() {
    activePanel.value = null
  }

  return {
    activePanel,
    openPanel,
    closePanel
  }
})

