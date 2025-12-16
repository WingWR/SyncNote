import { ref, reactive, watch } from 'vue'
import { useUserStore } from '../../stores/user'
import { userApi } from '../../api/user'
import { useRouter } from 'vue-router'

export function useSystemSettings() {
  const userStore = useUserStore()
  const router = useRouter()

  const showSettings = ref(false)
  const showEditDialog = ref(false)
  const editForm = reactive({
    username: '',
    email: '',
    avatar: ''
  })

  // 自动同步当前用户信息到编辑表单
  watch(showEditDialog, (show) => {
    if (show && userStore.currentUser) {
      editForm.username = userStore.currentUser.username
      editForm.email = userStore.currentUser.email
      editForm.avatar = userStore.currentUser.avatar
    }
  })

  async function handleUpdateUser() {
    try {
      if (!userStore.currentUser) return
      const updatedUser = await userApi.updateUser(editForm)
      userStore.setUser(updatedUser)
      showEditDialog.value = false
    } catch (error) {
      console.error('更新用户信息失败:', error)
      alert('更新用户信息失败')
    }
  }

  async function handleLogout() {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('退出登录 API 失败', error)
    } finally {
      userStore.logout()
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  return {
    showSettings,
    showEditDialog,
    editForm,
    userStore,
    handleUpdateUser,
    handleLogout
  }
}
