import { useSidebarStore } from '../../stores/sidebar'
import { useRouter } from 'vue-router'

export function useSidebar() {
  const sidebarStore = useSidebarStore()
  const router = useRouter()

  function goHome() {
    router.push('/home')
  }

  function handlePanelClick(panel: 'document' | 'workspace' | 'ai' | 'settings') {
    if (sidebarStore.activePanel === panel) {
      sidebarStore.closePanel()
    } else {
      sidebarStore.openPanel(panel)
    }
  }

  function getPanelTitle(panel: string | null): string {
    const titles: Record<string, string> = {
      document: '文档管理',
      workspace: '工作区',
      ai: 'AI助手',
      settings: '系统设置'
    }
    return titles[panel || ''] || ''
  }

  return {
    sidebarStore,
    goHome,
    handlePanelClick,
    getPanelTitle
  }
}
