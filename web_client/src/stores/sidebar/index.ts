import { defineStore } from "pinia";
import { useSidebarActions } from "./useSidebarActions";
import { useSidebarState } from "./useSidebarState";

export const useSidebarStore = defineStore('sidebar', () => {
    const state = useSidebarState()
    const actions = useSidebarActions(state)

    return {
        ...state,
        ...actions
    }
})