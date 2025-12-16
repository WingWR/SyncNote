import type { SidebarPanel } from "./types";
import { ref } from "vue";

export function useSidebarState(){
    const activePanel = ref<SidebarPanel>(null)

    return{
        activePanel
    }
}