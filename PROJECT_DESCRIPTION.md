# Foodie Share - 吃饭分享社群

## 项目概述

Foodie Share 是一个为美食爱好者打造的分享社群平台。用户可以发布带有图片和地理位置的美食帖子，浏览他人的推荐，收藏心仪的餐厅，并在帖子下留言互动。项目核心目标是展示扎实的数据库设计能力，包括规范化表结构、存储过程、触发器、地理空间查询以及高度封装的 SQL 查询架构。

## 目标功能 (12项核心需求)

1. **用户账号系统**：独特的用户名注册登录，JWT + HttpOnly Cookie 无状态认证
2. **图片发帖**：支持通过图片 URL 发布美食帖子
3. **主页浏览**：瀑布流/列表展示他人的美食帖子，可直接查看图片
4. **帖子信息**：每条帖子展示用户名、头像、图片、描述、店名、时间戳、点赞数量
5. **互动操作**：点赞、收藏（Marked）、点进去评论
6. **多用户并发**：支持多设备多用户同时在线使用，数据库触发器保证并发安全
7. **发帖功能**：支持纯文字发帖，支持发送当前地理位置
8. **实时点赞**：点赞数量通过触发器自动维护，前端即时反映
9. **评论系统**：对帖子发表评论，评论支持点赞和"已品尝"标签
10. **排序功能**：帖子按点赞量或时间排序
11. **用户主页**：查看他人主页及其发布的帖子
12. **附近美食**：在"附近美食页"显示3公里内用户收藏过的美食（PostGIS 地理计算）

## Bonus 加分项

- **多设备多用户并发访问**：Stateless JWT 认证，任意设备登录独立有效
- **自动维护点赞数**：触发器原子级更新，并发下无竞争条件
- **按时间/热度排序**：灵活的双维度排序
- **用户发帖历史**：个人主页聚合展示
- **点赞/取消点赞**：一键切换，即时反馈
- **基础数据分析**：最热帖子排行榜、最活跃用户排行
- **创意 SQL 扩展**：
  - 地理聚类分析（PostGIS ST_ClusterDBSCAN）找出热门美食区域
  - **高度封装的 SQL 查询网关**：后端所有数据库访问不直接拼接 SQL，而是通过统一的存储过程调用层。前端通过 `/api/query` 传递操作名和参数，后端网关映射到对应存储过程。业务层零裸 SQL，所有复杂查询逻辑封装在数据库内部。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 19 + Vite | 轻量级、快速开发、现代前端框架 |
| 后端 | Node.js + Express | RESTful API，天然支持 JWT Cookie |
| 数据库 | PostgreSQL 16 + PostGIS | 关系型数据库 + 地理空间扩展 |
| 部署 | Docker Compose + Nginx | 单机 All-in-One，一键启动 |
| 认证 | JWT (HttpOnly Cookie) | 无状态、防 XSS |

## 数据库架构

### 核心表

- **`users`**：用户信息（id, username, email, password_hash, avatar_url）
- **`posts`**：帖子（id, user_id, image_url, description, restaurant_name, location, like_count, mark_count）
- **`likes`**：用户点赞关系（user_id, post_id）
- **`marks`**：用户收藏关系（user_id, post_id）— **显式的多对多关系表**
- **`comments`**：评论（id, post_id, user_id, content, is_tasted, like_count）
- **`comment_likes`**：评论点赞关系
- **`user_stats`**：用户统计（post_count, total_likes_received, comment_count）— **触发器自动维护**

### 存储过程

- `like_post(user_id, post_id)` / `unlike_post(user_id, post_id)`
- `mark_post(user_id, post_id)` / `unmark_post(user_id, post_id)`
- `add_comment(user_id, post_id, content, is_tasted)`
- `like_comment(user_id, comment_id)` / `unlike_comment(user_id, comment_id)`
- `get_user_feed(user_id, sort_by, limit, offset)` — 获取主页feed
- `get_nearby_marks(user_id, lat, lng, radius)` — 附近收藏的帖子
- `get_post_comments(post_id)` — 帖子评论树
- `get_user_profile_stats(user_id)` — 用户主页聚合数据
- `get_top_posts(limit)` — 最热帖子排行榜
- `get_top_users(limit)` — 最活跃用户排行榜
- `get_geo_clusters(min_points, eps)` — PostGIS DBSCAN地理聚类

### 触发器

- `trg_post_like_count`：likes 表变更时自动更新 posts.like_count
- `trg_post_mark_count`：marks 表变更时自动更新 posts.mark_count
- `trg_comment_like_count`：comment_likes 变更时自动更新 comments.like_count
- `trg_user_stats`：posts 变更时自动更新 user_stats 统计表

### 物化视图

- `mv_top_posts`：最热帖子排行榜

### 创意查询

- **地理聚类**：`ST_ClusterDBSCAN` 分析收藏 posts 的地理分布，找出热门美食区域
- **查询网关**：所有读操作通过统一的 action→存储过程映射，后端 route handler 中零裸 SQL

## 页面结构

- **登录 / 注册**：JWT Cookie 认证
- **主页**：帖子流，支持按点赞量/时间排序
- **帖子详情**：完整帖子 + 评论区（支持"已品尝"标签、评论点赞）
- **他人主页**：用户名、头像、历史帖子
- **个人主页**：自己的信息、帖子、总点赞量
- **Marked 页面**：收藏的餐厅列表，可按推荐量/时间排序
- **附近美食页**：3公里内收藏的餐厅（PostGIS 地理查询）
- **发帖页面**：图片 URL、文字描述、店名、可选地理位置
- **数据分析页**：最热帖子、最活跃用户、地理聚类可视化

## 部署架构

```
┌─────────────┐
│   Nginx     │  ← 80/443端口，反向代理，HTTPS
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼───┐ ┌─▼──────┐
│React │ │Express │  ← RESTful API，Stateless
│Static│ │Backend │  ← JWT验证，调用存储过程
└──────┘ └───┬────┘
             │
        ┌────▼────┐
        │PostgreSQL│  ← PostGIS扩展，触发器，存储过程
        │+ PostGIS │  ← 数据一致性由数据库保证
        └─────────┘
```

单机 All-in-One 架构，所有服务运行在同一台 Linux VPS 上，通过 Docker Compose 一键启动。

## 设计规范

- **颜色**：Surface `#000000`, Primary `#C0E1D2`, Secondary `#E5EEE4`, Tertiary `#F6F4E8`, Highlight `#DC9B9B`, Error `red`
- **字体**：正文 Inter，标题 Helvetica
- **间距**：8dp 基准（4dp, 8dp, 16dp, 24dp, 32dp, 48dp）
- **设计系统**：Impeccable (https://impeccable.style)

## 项目提交物

| 提交物 | 说明 |
|--------|------|
| PowerPoint (<=10页) | 需求描述、ER模型、SQL查询、UI设计、协作分工、Demo视频 |
| 源代码 (zip) | 关系型数据库表设计、Text-to-SQL查询系统、数据可视化UI、可部署网站 |
| 数据库脚本 | Schema、存储过程、触发器、物化视图、种子数据 |
| Docker Compose | 一键启动完整应用栈 |
