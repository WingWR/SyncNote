# SyncNote — Docker 打包与部署指南 ✅

说明：本指南用于课堂/作业提交，详细说明如何使用 Docker 将本项目的前端（Vite + Vue）和后端（Spring Boot）打包成镜像并部署为容器，包含开发模式与生产模式的示例与注意事项。

---

## 1. 概览 ✨
- 后端：使用 `server/Dockerfile`（多阶段构建: Maven 构建 -> 运行镜像）
- 前端：使用 `web_client/Dockerfile`（Node 构建 -> 将 `dist` 交由 Nginx 托管）
- 反向代理：仓库里有 `deploy/nginx/syncnote.conf`（用于静态文件服务并代理 `/api` 和 `/ws`）
- Compose：
  - `docker-compose.yml`：本地/测试示例（包含 `db` 服务）
  - `docker-compose.override.dev.yml`：开发覆盖（热重载）
  - `docker-compose.prod.yml`：生产示例（默认不创建 DB，使用外部依赖）
- 环境：生产示例 env 模板在 `.env.prod.example`。

---

## 2. 前提条件 🔧
- 安装 Docker Engine 与 Docker Compose
- 若使用私有/远程数据库：确认数据库已备份并可从目标容器网络访问
- 推荐使用 secrets/secret manager 管理生产凭据

---

## 3. 本地快速运行（完整堆栈，开发/测试） 🧪
> 仅供本地测试或演示使用，不推荐用同样方式在生产环境替代真实数据库。

1. 在仓库根执行：
```bash
# 使用本地compose（包含 db）
docker compose up --build -d
```
2. 访问：
- 前端（Nginx）： http://localhost
- 后端： http://localhost:8080
3. 停止：
```bash
docker compose down
```

---

## 4. 开发（热重载） 🔁
```bash
docker compose -f docker-compose.yml -f docker-compose.override.dev.yml up --build
```
- 前端 dev server 默认在 5173（在 Windows 环境下前端通过 `host.docker.internal` 访问宿主机的后端）
- `web_client/vite.config.ts` 已为 `/api` 与 `/ws` 添加代理配置

---

## 5. 生产部署（使用已有数据库，不修改原数据） 🚀
**关键原则：** 如果服务器已有生产 MySQL 且包含数据，**不要**在 `docker-compose.prod.yml` 中启动新的 `db` 服务去替换；应直接把后端连接到该已有数据库。

步骤：
1. 复制生产 env 模板并修改：
```bash
cp .env.prod.example .env.prod
# 编辑 .env.prod，填写生产的 SPRING_DATASOURCE_URL、用户名、密码、JWT_SECRET_KEY 等
```
2. 确认 `server/syncnote-boot/src/main/resources/application-prod.yml` 中包含：
```yaml
spring:
  sql:
    init:
      mode: never
```
该配置确保应用不会执行 `schema.sql` 或 `data.sql` 来修改现有数据库。

3. 构建并运行：
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
4. 验证：
- 后端健康： `http://<your-host>:8080/actuator/health`
- 前端： `http://<your-host>`

---

## 6. 生产安全与运维注意事项 🔒
- 不要把敏感凭据提交到仓库，优先通过 Docker secrets / Vault / 云 Secret Manager 注入机密。
- 若使用容器化数据库，请保证持久卷、备份策略和访问控制到位；推荐使用托管 DB（RDS 等）。
- 不要对 MySQL 3306 等数据库端口在公网开放；使用内部网络或 VPC。
- 对前端采用 HTTPS（在 edge nginx 或 LB 上启用 TLS），并在 Nginx 中为 `/ws` 设置 `proxy_set_header Upgrade` 与 `Connection`，以支持 WebSocket。

---

## 7. Docker secrets 示例（简要）
```bash
# 创建 secret
echo "prod_db_password" | docker secret create prod_db_pass -
# 在 Compose (Swarm) 中引用 secret
# 注意：Docker Compose v2 与 Swarm 的 secret 用法不同，生产请参考 Swarm/Kubernetes secret 文档
```

---

## 8. 验证与故障排查 🐞
- 查看服务状态：
```bash
docker compose -f docker-compose.prod.yml ps
```
- 查看日志：
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```
- 常见问题：
  - 连接数据库失败：检查 `SPRING_DATASOURCE_URL`、用户名、密码及网络访问
  - WebSocket 连接失败：确认前端 `VITE_WS_URL` 指向 `/ws`，并检查 nginx 中 `Upgrade`/`Connection` 头是否正确转发

---

## 9. CI/CD 建议（简短）
- 在 CI 中执行：
  - 后端： `mvn -B -pl syncnote-boot -am -DskipTests package` 并构建 `syncnote-backend` 镜像
  - 前端： `npm ci && npm run build` 并构建 `syncnote-frontend` 镜像（基于 `nginx`）
- 把镜像 push 到私有 registry，然后在生产服务器上 `docker compose pull` 并 `docker compose up -d`

---

