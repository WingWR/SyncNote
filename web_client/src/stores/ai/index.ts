import { defineStore } from 'pinia'
import { useAIState } from './useAIState'
import { useAIActions } from './useAIActions'

export const useAIStore = defineStore('ai', () => {
  const state = useAIState()
  const actions = useAIActions(state)

  return {
    ...state,
    ...actions
  }
})
