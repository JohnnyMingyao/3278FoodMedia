# Foodie Share - Developer Guide

## 1. 项目概述

Foodie Share 是一个美食分享社交社区应用，使用 React + Node.js + PostgreSQL + Docker 技术栈。

---

## 2. 环境准备

### 2.1 必备工具

- **Docker Desktop**（或 Docker Engine + Docker Compose）
- **Node.js 20+**
- **VS Code**（推荐）+ SQLTools 插件（PostgreSQL Driver）
- **Git**

### 2.2 项目结构

```
GP/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite
├── db/
│   └── init/         # 数据库初始化脚本（表、存储过程、触发器）
├── docker-compose.yml
├── nginx.conf
└── Developer_guide.md  # 本文档
```

---

## 3. Docker 运行（完整部署）

### 3.1 启动所有服务

在项目根目录（`GP/`）执行：

```bash
docker-compose up -d
```

这会启动三个容器：
- `foodie_postgres` — PostgreSQL 16 + PostGIS
- `foodie_backend` — Node.js API（端口 3001）
- `foodie_nginx` — Nginx 反向代理（端口 80）

### 3.2 查看容器状态

```bash
docker ps
```

### 3.3 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 只看某个服务
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 3.4 停止服务

```bash
docker-compose down
```

**注意：** `down` 保留数据库数据（Volume 不会被删除）。如需彻底重置数据库：

```bash
docker-compose down -v   # -v 会删除 postgres_data volume，所有数据丢失
docker-compose up -d     # 重新创建并执行 db/init/*.sql
```

### 3.5 后端代码修改后重新构建

`docker-compose.yml` 中后端服务没有挂载 Volume，修改代码后需要重新构建镜像：

```bash
docker-compose up -d --build backend
```

前端代码修改后**不需要**重新构建，Vite 开发服务器会自动热更新。

---

## 4. 前端开发（热更新模式）

前端使用 Vite 开发服务器，修改代码后页面自动刷新。

### 4.1 单独启动前端

```bash
cd frontend
npm install    # 首次运行
npm run dev
```

默认在 `http://localhost:5174`（已在 `vite.config.js` 中改为 5174）。

### 4.2 代理配置

`frontend/vite.config.js` 中已配置代理：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

这意味着前端请求 `/api/xxx` 会自动转发到后端的 `http://localhost:3001/api/xxx`。

### 4.3 开发时的工作流

推荐同时开两个终端：

**终端 1 — 运行 Docker（数据库 + 后端）：**
```bash
docker-compose up -d
```

**终端 2 — 运行前端开发服务器：**
```bash
cd frontend && npm run dev
```

然后访问 `http://localhost:5174` 进行开发。

---

## 5. 数据库访问（VS Code SQLTools）

### 5.1 安装插件

1. 打开 VS Code → Extensions（侧边栏四个方块图标）
2. 搜索并安装：
   - `SQLTools`（作者：Matheus Teixeira）
   - `SQLTools PostgreSQL Driver`

### 5.2 添加连接

1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）
2. 输入 `SQLTools: Add New Connection`
3. 选择 **PostgreSQL**
4. 填写配置：

| 字段 | 值 |
|-----|-----|
| Connection Name | Foodie Share |
| Server Address | localhost |
| Port | 5432 |
| Database | foodie_share |
| Username | foodie |
| Password | foodie_pass |
| SSL | Disabled |

5. 点击 **Test Connection** → 成功后点击 **Save Connection**

### 5.3 浏览数据

左侧 SQLTools 面板展开连接：
- `foodie_share` → `Tables` → 双击表名查看数据
- 点击表名右侧的 🔍 图标查看表记录
- 点击 📝 图标生成查询模板

### 5.4 执行 SQL 查询

在 SQLTools 查询编辑器中输入 SQL，选中后点击右上角的 ▶️ 执行：

```sql
-- 查看所有用户
SELECT * FROM users;

-- 查看帖子及作者
SELECT p.id, p.restaurant_name, u.username, p.like_count
FROM posts p JOIN users u ON p.user_id = u.id;

-- 查看某条帖子的评论
SELECT * FROM comments WHERE post_id = 1;

-- 查看存储过程列表
\df

-- 查看触发器
SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';
```

### 5.5 删除记录

**方式一：直接写 DELETE 语句（推荐）**

```sql
-- 删除指定评论
DELETE FROM comments WHERE id = 1;

-- 删除指定帖子（级联删除其评论、点赞、收藏记录）
DELETE FROM posts WHERE id = 1;

-- 删除指定用户（级联删除其所有帖子、评论、点赞、收藏）
DELETE FROM users WHERE id = 1;
```

**方式二：右键生成删除语句**

1. 左侧 SQLTools 面板找到目标表
2. 右键表名 → `Generate Insert/Update/Delete Query` → 选择 `Delete`
3. 在生成的模板中填写 WHERE 条件
4. 选中 SQL，点击 ▶️ 执行

**重要提示：**
- 所有外键都设置了 `ON DELETE CASCADE`，删除用户或帖子会自动清理关联数据
- `comments.like_count`、`posts.like_count`、`posts.mark_count` 等字段由触发器自动维护，不要手动修改

### 5.6 常见问题

| 问题 | 原因 | 解决 |
|-----|------|------|
| 连接被拒绝 | Docker 容器未运行 | `docker ps` 确认 `foodie_postgres` 状态为 Up |
| 认证失败 | 用户名/密码/数据库名错误 | 检查 `docker-compose.yml` 中的环境变量 |
| 端口被占用 | 本地有其他 PostgreSQL 实例 | `lsof -i :5432` 查看占用进程 |

---

## 6. 命令行方式访问数据库

如果不想用 GUI，可以直接通过 docker exec 进入 psql：

```bash
# 进入交互式 psql
docker exec -it foodie_postgres psql -U foodie -d foodie_share

# 在 psql 内部：
\dt              # 列出所有表
\df              # 列出所有函数/存储过程
\d users         # 查看 users 表结构
SELECT * FROM users;   # 查询数据
\q               # 退出 psql

# 执行单条 SQL（不进入交互模式）
docker exec -i foodie_postgres psql -U foodie -d foodie_share -c "SELECT COUNT(*) FROM posts;"
```

---

## 7. 数据库 Schema 更新

`db/init/*.sql` 文件只在容器**首次创建**时执行一次。后续修改 SQL 文件不会自动同步到运行中的数据库。

### 7.1 小规模修改（保留数据）

将修改写成 migration SQL 脚本，直接执行：

```bash
# 示例：执行迁移脚本
docker exec -i foodie_postgres psql -U foodie -d foodie_share < db/migration_fix_comment_likes.sql
```

### 7.2 大规模修改（重置数据）

如果数据库结构变化很大，或者测试数据不重要：

```bash
docker-compose down -v
docker-compose up -d
```

这会清空所有数据，重新执行 `db/init/` 目录下的所有 SQL 脚本。

---

## 8. 快速检查清单

| 操作 | 命令 |
|-----|------|
| 启动全部服务 | `docker-compose up -d` |
| 停止全部服务 | `docker-compose down` |
| 查看日志 | `docker-compose logs -f` |
| 重启后端（代码更新后） | `docker-compose up -d --build backend` |
| 启动前端开发服务器 | `cd frontend && npm run dev` |
| 进入数据库命令行 | `docker exec -it foodie_postgres psql -U foodie -d foodie_share` |
| 执行 SQL 文件 | `docker exec -i foodie_postgres psql -U foodie -d foodie_share < file.sql` |
| 查看所有存储过程 | `\df`（在 psql 中） |
| 查看所有触发器 | `SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';` |
