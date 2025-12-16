import type { User } from "./types";
import { ref } from "vue";

export function useUserState(){
    const currentUser = ref<User | null>(null)

    return {
        currentUser
    }
}