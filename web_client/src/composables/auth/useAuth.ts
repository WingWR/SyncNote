import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { login, register } from "../../api/user/service";

export function useAuth() {
  const router = useRouter();
  const userStore = useUserStore();
  const isLogin = ref(true);
  const isLoading = ref(false);

  const loginForm = reactive({ email: "", password: "" });
  const registerForm = reactive({ username: "", email: "", password: "" });

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) return;
    isLoading.value = true;
    try {
      const response = await login(loginForm);
      if (response.code === 200 && response.data) {
        localStorage.setItem("token", response.data.token);
        userStore.setUser(response.data.userResponseOfLoginInfo);
        router.push("/home");
      } else {
        alert(response.message || "登录失败");
      }
    } catch (error) {
      console.error(error);
      alert("登录失败，请检查邮箱和密码");
    } finally {
      isLoading.value = false;
    }
  }

  async function handleRegister() {
    if (!registerForm.username || !registerForm.email || !registerForm.password)
      return;
    isLoading.value = true;
    try {
      const response = await register(registerForm);
      if (response.code === 200) {
        alert("注册成功，请登录");
        isLogin.value = true;
      } else {
        alert(response.message || "注册失败");
      }
    } catch (error) {
      console.error(error);
      alert("注册失败，请检查输入信息");
    } finally {
      isLoading.value = false;
    }
  }

  function toggleMode() {
    isLogin.value = !isLogin.value;
  }

  return {
    isLogin,
    isLoading,
    loginForm,
    registerForm,
    handleLogin,
    handleRegister,
    toggleMode,
  };
}
