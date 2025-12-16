import { defineStore } from 'pinia'
import { useUserActions } from './useUserActions'
import { useUserGetters } from './useUserGetters'
import { useUserState } from './useUserState'

export const useUserStore = defineStore('user', () => {
    const state = useUserState()
    const getters = useUserGetters(state)
    const actions = useUserActions(state)

    return {
        ...state,
        ...getters,
        ...actions
    }
})


