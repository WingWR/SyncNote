import axios, { type AxiosResponse } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 提取 data，使返回类型直接是 T 而不是 AxiosResponse<T>
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端返回统一包装：{ code, message, data }
    // 这里解包返回其中的 data 字段，保证调用方直接获得业务数据
    return response.data?.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 类型声明：覆盖 axios 的返回类型，使其直接返回 T 而不是 AxiosResponse<T>
declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>
    post<T = any>(url: string, data?: any, config?: any): Promise<T>
    put<T = any>(url: string, data?: any, config?: any): Promise<T>
    delete<T = any>(url: string, config?: any): Promise<T>
  }
}

export default api

