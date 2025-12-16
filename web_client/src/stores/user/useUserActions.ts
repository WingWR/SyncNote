import type { User } from "./types"

export function useUserActions(state:{
    currentUser:{ value: User | null}
})
{
  function setUser(user: User | null) {
    state.currentUser.value = user
  }

  function logout() {
    state.currentUser.value = null
  }

  return {
    setUser,
    logout
  }
}