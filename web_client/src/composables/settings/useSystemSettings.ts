import { ref } from 'vue'
import { useUserStore } from '../../stores/user'
import { logout } from '../../api/user'
import { useRouter } from 'vue-router'

export function useSystemSettings() {
  const userStore = useUserStore()
  const router = useRouter()

  const showSettings = ref(false)

  async function handleLogout() {
    try {
      await logout()
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
    userStore,
    handleLogout
  }
}
