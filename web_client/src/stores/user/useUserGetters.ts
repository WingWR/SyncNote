import type { User } from "./types"
import { computed } from 'vue'

export function useUserGetters(state:{
    currentUser:{ value: User | null}
})
{
    const isAuthenticated = computed(() => state.currentUser.value !== null)

    return {
        isAuthenticated
    }
}