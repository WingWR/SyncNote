import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

interface MenuState {
  visible: boolean
  documentId: string | null
  showTrash: boolean
  position: { left: number; top: number }
}

export const useGlobalDocumentMenuStore = defineStore('globalDocumentMenu', () => {
  const menuState = ref<MenuState>({
    visible: false,
    documentId: null,
    showTrash: false,
    position: { left: 0, top: 0 }
  })

  const showMenu = (documentId: string, showTrash: boolean, position: { left: number; top: number }) => {
    menuState.value.visible = true
    menuState.value.documentId = documentId
    menuState.value.showTrash = showTrash
    menuState.value.position = position
  }

  const hideMenu = () => {
    menuState.value.visible = false
    menuState.value.documentId = null
  }

  const updatePosition = (position: { left: number; top: number }) => {
    menuState.value.position = position
  }

  // 全局点击事件处理
  const handleGlobalClick = (event: Event) => {
    // 如果点击的不是菜单内部，则隐藏菜单
    const target = event.target as HTMLElement
    if (!target.closest('.document-action-menu')) {
      hideMenu()
    }
  }

  // 初始化全局事件监听
  const init = () => {
    document.addEventListener('click', handleGlobalClick)
  }

  // 清理事件监听
  const destroy = () => {
    document.removeEventListener('click', handleGlobalClick)
  }

  return {
    menuState: readonly(menuState),
    showMenu,
    hideMenu,
    updatePosition,
    init,
    destroy
  }
})
