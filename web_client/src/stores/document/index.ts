// 前端文件编辑部分组装入口
import { defineStore } from 'pinia'
import { useDocumentState } from './useDocumentState'
import { useDocumentGetters } from './useDocumentGetters'
import { useDocumentActions } from './useDocumentActions'

export const useDocumentStore = defineStore('document', () => {
  const state = useDocumentState()
  const getters = useDocumentGetters(state)
  const actions = useDocumentActions(state)

  return {
    ...state,
    ...getters,
    ...actions
  }
})
