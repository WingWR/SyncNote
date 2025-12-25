# Docker & Deployment for SyncNote

## 🌐 概述
本指南说明如何使用仓库中提供的 Dockerfile 和 Docker Compose 启动 SyncNote。当前推荐的生产方案：**后端与前端容器化部署，数据库/Redis/MinIO 等生产依赖应由外部托管或独立的基础设施提供（不要在生产环境中同时运行一个新的空数据库来替换已有数据库）**。

---

## ⚠️ 重要原则（请先阅读）
- 如果你已有一台生产 MySQL 并且里边已有数据：**不要**在 `docker-compose.prod.yml` 中启用或运行 `db` 服务来替代它。应将后端连接直接指向已有数据库（通过 `.env.prod` 中设置 `SPRING_DATASOURCE_URL` 等）。
- 生产环境不要将敏感凭据提交到 git；使用 Docker secrets 或云端 secret 管理器注入密钥。
- 已在 `server/syncnote-boot/src/main/resources/application-prod.yml` 中设置：
  ```yaml
  spring:
    sql:
      init:
        mode: never
  ```
  用于防止在生产环境自动初始化或覆盖数据库 schema。

---

## ✅ 目录结构（相关文件）
- `server/Dockerfile` - 后端多阶段构建（Maven -> 运行）
- `web_client/Dockerfile` - 前端多阶段构建（Node -> build -> nginx）
- `deploy/nginx/syncnote.conf` - nginx 配置（静态 + /api + /ws 代理）
- `docker-compose.yml` - 含本地开发或测试所需的服务（可包含 db）
- `docker-compose.prod.yml` - 生产示例（默认不启动 db/redis/minio，假定外部依赖）
- `.env.prod.example` - 生产环境示例（复制为 `.env.prod` 并编辑）
- `server/syncnote-boot/src/main/resources/application-prod.yml` - 生产 profile 覆盖配置（通过 env 注入敏感值）

---

## 快速启动（生产，使用已有数据库）
1. 复制并编辑生产环境变量：
   ```bash
   cp .env.prod.example .env.prod
   # 编辑 .env.prod：将 SPRING_DATASOURCE_URL 等指向你真实的生产 DB
   ```
2. （可选）在 CI 中构建镜像并推送到镜像仓库，或本地构建：
   ```bash
   # 本地构建并启动（示例）
   docker compose -f docker-compose.prod.yml up --build -d
   ```
3. 验证：
   - 后端健康检查: `http://<your-host>:8080/actuator/health`
   - 前端: `http://<your-host>`
4. 日志与排障：
   ```bash
   docker compose -f docker-compose.prod.yml logs -f backend
   docker compose -f docker-compose.prod.yml ps
   ```

> 如果你的生产 DB 在外部（推荐），确保 `.env.prod` 中 `SPRING_DATASOURCE_URL` 使用正确的 host/IP/端口，并且数据库用户有正确权限，且网络规则允许容器访问该 DB。

---

## 开发 / 本地测试（可运行完整堆栈）
- 如果你希望在本机上启动一个包含 MySQL 的完整环境（仅用于测试或演示）：
  ```bash
  docker compose up --build -d
  # 或使用覆盖文件：
  docker compose -f docker-compose.yml -f docker-compose.override.dev.yml up --build
  ```
- `docker-compose.yml` 包含一个 `db` 服务（mysql），仅在测试/本地使用；生产**不要**启动该服务以免误用空数据库。
- 开发模式下前端热重载运行在 5173，vite 已在 `web_client/vite.config.ts` 中配置 `/api` 与 `/ws` 的代理（dev 环境）。

---

## Nginx / WebSocket 要点 🔧
- `deploy/nginx/syncnote.conf` 在容器中用于 nginx（生产 nginx/edge 上请确认配置）：
  - WebSocket 路径 `/ws/` 必须转发 `Upgrade` 与 `Connection` 头来支持 websocket 升级；
  - `/api/` 应转发 `Authorization` 头：`proxy_set_header Authorization $http_authorization;` 
  - 允许较大的 body（`client_max_body_size 50M`）以处理大的 Base64 数据。

---

## 安全与运维建议 🔐
- 使用 secrets 或云 Secret Manager 存储 DB 密码、JWT secret、MinIO 凭证与 AI provider keys。
- 对生产 DB 做定期备份并验证恢复（`mysqldump` / 云 provider 备份）。
- 不要在生产环境开 3306 到公网；仅在受控网络或 VPC 内部访问。
- 若需 TLS：在 edge nginx 或 LB 上实现 TLS 终止，内部用私有网络访问后端服务。

---

## 故障排查常用命令
```bash
# 查看服务状态
docker compose -f docker-compose.prod.yml ps
# 查看日志
docker compose -f docker-compose.prod.yml logs -f backend
# 进入容器
docker compose -f docker-compose.prod.yml exec backend /bin/sh
# 检查后端健康接口
curl -f http://localhost:8080/actuator/health
```

---

## 可选：使用 Docker secrets（示例说明）
1. 创建 secret 文件：
   ```bash
   echo "verysecretpassword" | docker secret create db_pass -
   ```
2. 在 Compose 中引用（或使用 Swarm / Kubernetes 的 Secret 管理）：
   - 生产推荐以此方式注入机密，而不是明文环境变量。

---

如果你希望，我可以继续：
- 把这些文档改动提交到一个新分支并创建 PR；
- 再提供一个基于 Docker secrets 的 `docker-compose.prod.yml` 示例并演练一次部署（需要访问或在 CI 中运行）。

---

快速摘要：**当前方案默认使用外部数据库（不会创建/覆盖生产数据）**，按上面的步骤复制 `.env.prod.example` 到 `.env.prod` 并把 `SPRING_DATASOURCE_URL` 指向你已有的 DB，即可直接运行。
