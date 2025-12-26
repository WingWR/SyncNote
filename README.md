# SyncNote

> **AI 驱动的实时协作笔记平台**
> SyncNote 是一个集成了多人实时协同编辑与强大 AI 写作辅助功能的智能工作空间。

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Vue3](https://img.shields.io/badge/Vue-3.x-4fc08d?logo=vuedotjs)](https://vuejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-容器化-2496ED?logo=docker)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-流水线-2088FF?logo=githubactions)](https://github.com/features/actions)

---



## 快速访问

* **线上 Demo:** [http://139.196.151.22/](http://139.196.151.22/)
* **后端架构:** Spring Boot 3.x (多模块设计)
* **前端框架:** Vue 3 + Vite + Pinia

---



## 核心功能

### 实时协作

- **多人协同编辑:** 支持多个用户同时编辑 `.txt` 或 `.md` 文档。
- **WebSocket 同步:** 毫秒级内容分发与实时光标追踪。
- **成员状态:** 实时展示当前在线的协作者列表。

### AI 智能助手 (基于 LangChain4j)

- **多模型集成:** 统一接入 DeepSeek, OpenAI, Kimi 等主流大模型。
- **文本润色:** 智能优化表达、纠正语法，提升文稿质量。
- **逻辑续写:** 根据文档上下文自动生成后续内容，突破创作瓶颈。
- **直接对话:** 无需离开编辑器即可与 AI 进行头脑风暴。

### 文档与安全

- **Markdown 支持:** 高质量的渲染效果，实时预览技术笔记。
- **数据持久化:** 基于 MySQL 的稳定存储，支持集成 MinIO/OSS 对象存储。
- **安全保障:** 采用 JWT 无状态认证与细粒度的权限控制。

---



##  技术栈

* **前端:** Vue 3, Vite, Pinia, Axios.
* **后端:** Java 21, Spring Boot 3.4+, MyBatis-Plus, WebSocket.
* **AI 框架:** LangChain4j.
* **基础设施:** MySQL, Redis, Docker, GitHub Actions.

---



## 如何运行

您可以直接访问我们的线上版本，或参考以下步骤进行本地部署。

### 1. 快速访问 (线上生产环境)

体验 SyncNote 最简单的方式是通过我们已部署的服务器：

- **访问地址:** [http://139.196.151.22/](http://139.196.151.22/)
- **环境要求:** 建议使用任何现代浏览器（推荐使用 Chrome, Edge 或 Safari）。



### 2. 本地部署 (手动配置)

#### 2.1 环境要求

请确保您的机器上已安装以下环境：
- JDK 21（Spring Boot 3.x 必需）
- Node.js 20+ 及 npm
- MySQL 8.0
- Redis

#### 2.2 后端配置

- **数据库配置:**
  
  - 在 `MySQL` 中创建名为 `syncnote` 的数据库。
  - 打开 `syncnote-boot/src/main/resources/application.yml`。
  - 更新 `datasource` 相关的用户名和密码。
  - 确保您的 `Redis` 服务正在默认端口 (6379) 上运行。
  
- **AI 接口配置:**
  - 在 `syncnote-ai` 模块设置中，填入您有效的大模型提供商（如 DeepSeek, OpenAI）的 `API-KEY`。

- **编译与运行:**
  ```bash
  $ cd SyncNote/server
  $ mvn clean install
  $ cd syncnote-boot
  $ mvn spring-boot:run
