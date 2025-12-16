import type { SidebarPanel } from "./types"

export function useSidebarActions(state:{
    activePanel:{ value: SidebarPanel }
})
{
  function openPanel(panel: SidebarPanel) {
    state.activePanel.value = panel
  }

  function closePanel() {
    state.activePanel.value = null
  }

  return {
    openPanel,
    closePanel
  }
}