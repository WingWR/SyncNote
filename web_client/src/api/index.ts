import axios, { type AxiosResponse } from "axios";

const getBaseURL = () => {
  // 开发环境使用代理
  if (import.meta.env.DEV) {
    return '/api';
  }
  // 生产环境或通过IP访问时使用实际后端地址
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // 关键配置：强制响应类型为 text，防止浏览器自动解析 JSON 导致精度丢失
  responseType: "text",
  transformResponse: [
    (data) => {
      // 如果已经是对象（极端情况），直接返回
      if (typeof data !== "string") return data;
      
      try {
        // 如果是空字符串，返回 null
        if (!data) return null;

        // 使用正则将长整数（15位以上）转换为字符串
        // 匹配模式：
        // 1. "key": 123... (对象属性值)
        // 2. : 123... (可能是紧凑格式)
        // 注意：这只是一个简单的正则，可能无法处理所有情况（如数组中的纯数字），但在本项目 DTO 结构下通常有效。
        // 为了安全起见，我们只替换冒号后面的数字。
        const newData = data.replace(/:\s*(\d{15,})/g, ':"$1"');
        return JSON.parse(newData);
      } catch (e) {
        console.warn("JSON parse failed in transformResponse", e);
        // 解析失败尝试返回原始数据或空对象，避免 crash
        return data;
      }
    },
  ],
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 保持完整的API响应格式
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端返回统一包装：{ code, message, data }
    // 保持完整格式，让调用方处理code和message
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 不再在此处自动跳转到 /login，避免请求失败时导致页面刷新/重定向。
      // 只清理本地 token，让调用方决定如何处理认证失败（例如显示登录弹窗或导航）。
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// 类型声明：覆盖 axios 的返回类型，使其直接返回 T 而不是 AxiosResponse<T>
declare module "axios" {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
  }
}

export default api;
