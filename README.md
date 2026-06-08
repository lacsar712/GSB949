# 智慧中医平台

基于 PHP + React + WindiCSS 构建的现代化智慧中医科普与管理平台。本项目完全遵循 Docker 容器化规范，支持一键启动。

## 🛠 技术栈

- **Frontend**: React 18, WindiCSS, Vite, Axios, Lucide React
- **Backend**: PHP 8.2 (Native), PDO, Apache
- **Database**: MySQL 8.0
- **Infrastructure**: Docker, Docker Compose, Nginx

## 🚀 启动指南 (How to Run)

1. 确保已安装 Docker 和 Docker Compose。
2. 在项目根目录执行：
   ```bash
   docker compose up --build
   ```
3. 等待容器启动完成（首次启动需要初始化数据库，约需 10-30 秒）。

## 🔗 服务地址 (Services)

- **前端访问 (Frontend)**: http://localhost:3000
- **后端 API (Backend)**: http://localhost:8080/api/categories
- **数据库 (Database)**: localhost:3388 (user: root / pass: root)

## 🧪 测试账号

系统预置了以下测试账号：

- **管理员**: `admin` / `123456`
- **普通用户**: `user01` / `123456`

## ✨ 功能特性

### 1. 用户系统
- 用户注册（实时校验用户名/邮箱/密码）
- 用户登录（Session 管理）
- 权限控制（普通用户/管理员）

### 2. 中医科普
- 首页科普文章浏览（分类/分页）
- 文章详情查看（需登录）
- 丰富的文章展示（图文混排）

### 3. 中药宝库
- 中药材列表展示（卡片式布局）
- 实时搜索（支持名称/别名/功效）
- 中药详情（功效/药理/图片）

### 4. 内容管理（后台）
- 科普文章发布与编辑（集成富文本编辑器）
- 中药信息录入与修改
- 删除确认机制（防止误操作）

## 📁 目录结构

```
.
├── backend/            # PHP 后端源码
│   ├── api/            # API 接口文件
│   ├── config/         # 配置文件
│   ├── utils/          # 工具类
│   ├── Dockerfile      # 后端镜像构建
│   └── .htaccess       # 路由规则
├── frontend/           # React 前端源码
│   ├── src/            # 源代码
│   ├── Dockerfile      # 前端镜像构建
│   ├── nginx.conf      # Nginx 配置
│   └── windi.config.js # WindiCSS 配置
├── database/           # 数据库文件
│   └── init.sql        # 初始化脚本
├── docker-compose.yml  # 容器编排配置
└── user_rule.md        # 开发规范
```