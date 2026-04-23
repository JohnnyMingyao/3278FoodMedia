# Foodie Share - Developer Guide

## 1. Project Overview

Foodie Share is a food-sharing social community application using the React + Node.js + PostgreSQL + Docker technology stack.

---

## 2. Environment Setup

### 2.1 Required Tools

- **Docker Desktop** (or Docker Engine + Docker Compose)
- **Node.js 20+**
- **VS Code** (recommended) + SQLTools extension (PostgreSQL Driver)
- **Git**

### 2.2 Project Structure

```
GP/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite
├── db/
│   └── init/         # Database initialization scripts (tables, stored procedures, triggers)
├── docker-compose.yml
├── nginx.conf
└── Developer_guide.md  # This document
```

---

## 3. Docker Deployment (Full Stack)

### 3.1 Start All Services

In the project root directory (`GP/`):

```bash
docker-compose up -d
```

This starts three containers:
- `foodie_postgres` — PostgreSQL 16 + PostGIS
- `foodie_backend` — Node.js API (port 3001)
- `foodie_nginx` — Nginx reverse proxy (port 80)

### 3.2 Check Container Status

```bash
docker ps
```

### 3.3 View Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service only
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 3.4 Stop Services

```bash
docker-compose down
```

**Note:** `down` preserves database data (Volume is not deleted). To completely reset the database:

```bash
docker-compose down -v   # -v deletes postgres_data volume, all data is lost
docker-compose up -d     # Recreate and execute db/init/*.sql
```

### 3.5 Rebuild Backend After Code Changes

The backend service in `docker-compose.yml` does not mount a Volume, so you need to rebuild the image after modifying code:

```bash
docker-compose up -d --build backend
```

Frontend code changes do **not** require rebuilding; the Vite dev server automatically hot-reloads.

---

## 4. Frontend Development (Hot Reload Mode)

The frontend uses the Vite dev server; the page automatically refreshes after code changes.

### 4.1 Start Frontend Alone

```bash
cd frontend
npm install    # First time only
npm run dev
```

Defaults to `http://localhost:5174` (already configured to 5174 in `vite.config.js`).

### 4.2 Proxy Configuration

Proxy is configured in `frontend/vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

This means frontend requests to `/api/xxx` are automatically forwarded to the backend at `http://localhost:3001/api/xxx`.

### 4.3 Development Workflow

It is recommended to open two terminals simultaneously:

**Terminal 1 — Run Docker (database + backend):**
```bash
docker-compose up -d
```

**Terminal 2 — Run frontend dev server:**
```bash
cd frontend && npm run dev
```

Then visit `http://localhost:5174` for development.

---

## 5. Database Access (VS Code SQLTools)

### 5.1 Install Extensions

1. Open VS Code → Extensions (sidebar four-square icon)
2. Search and install:
   - `SQLTools` (by Matheus Teixeira)
   - `SQLTools PostgreSQL Driver`

### 5.2 Add Connection

1. Press `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. Type `SQLTools: Add New Connection`
3. Select **PostgreSQL**
4. Fill in configuration:

| Field | Value |
|-----|-----|
| Connection Name | Foodie Share |
| Server Address | localhost |
| Port | 5432 |
| Database | foodie_share |
| Username | foodie |
| Password | foodie_pass |
| SSL | Disabled |

5. Click **Test Connection** → After success, click **Save Connection**

### 5.3 Browse Data

Expand the connection in the left SQLTools panel:
- `foodie_share` → `Tables` → Double-click table name to view data
- Click the 🔍 icon next to table name to view records
- Click the 📝 icon to generate query templates

### 5.4 Execute SQL Queries

Enter SQL in the SQLTools query editor, select it, and click the ▶️ icon in the top right to execute:

```sql
-- View all users
SELECT * FROM users;

-- View posts and authors
SELECT p.id, p.restaurant_name, u.username, p.like_count
FROM posts p JOIN users u ON p.user_id = u.id;

-- View comments on a specific post
SELECT * FROM comments WHERE post_id = 1;

-- List all stored procedures
\df

-- View triggers
SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';
```

### 5.5 Delete Records

**Method 1: Direct DELETE statement (recommended)**

```sql
-- Delete specific comment
DELETE FROM comments WHERE id = 1;

-- Delete specific post (cascades to comments, likes, marks)
DELETE FROM posts WHERE id = 1;

-- Delete specific user (cascades to all posts, comments, likes, marks)
DELETE FROM users WHERE id = 1;
```

**Method 2: Right-click to generate delete statement**

1. Find the target table in the left SQLTools panel
2. Right-click table name → `Generate Insert/Update/Delete Query` → Select `Delete`
3. Fill in the WHERE condition in the generated template
4. Select the SQL and click ▶️ to execute

**Important Notes:**
- All foreign keys are set with `ON DELETE CASCADE`; deleting a user or post automatically cleans up associated data
- `comments.like_count`, `posts.like_count`, `posts.mark_count` and other fields are automatically maintained by triggers; do not manually modify them

### 5.6 Common Issues

| Issue | Cause | Solution |
|-----|------|------|
| Connection refused | Docker container not running | `docker ps` to confirm `foodie_postgres` status is Up |
| Authentication failed | Wrong username/password/database name | Check environment variables in `docker-compose.yml` |
| Port in use | Local PostgreSQL instance already running | `lsof -i :5432` to check occupying process |

---

## 6. Command Line Database Access

If you prefer not to use a GUI, you can enter psql directly via docker exec:

```bash
# Enter interactive psql
docker exec -it foodie_postgres psql -U foodie -d foodie_share

# Inside psql:
\dt              # List all tables
\df              # List all functions/stored procedures
\d users         # View users table structure
SELECT * FROM users;   # Query data
\q               # Exit psql

# Execute single SQL (non-interactive)
docker exec -i foodie_postgres psql -U foodie -d foodie_share -c "SELECT COUNT(*) FROM posts;"
```

---

## 7. Database Schema Updates

`db/init/*.sql` files are executed only once when the container is **first created**. Subsequent modifications to SQL files will not automatically sync to the running database.

### 7.1 Small Changes (Preserve Data)

Write changes as migration SQL scripts and execute directly:

```bash
# Example: Execute migration script
docker exec -i foodie_postgres psql -U foodie -d foodie_share < db/migration_fix_comment_likes.sql
```

### 7.2 Large Changes (Reset Data)

If the database structure changes significantly, or test data is not important:

```bash
docker-compose down -v
docker-compose up -d
```

This clears all data and re-executes all SQL scripts in the `db/init/` directory.

---

## 8. Quick Checklist

| Operation | Command |
|-----|------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart backend (after code update) | `docker-compose up -d --build backend` |
| Start frontend dev server | `cd frontend && npm run dev` |
| Enter database CLI | `docker exec -it foodie_postgres psql -U foodie -d foodie_share` |
| Execute SQL file | `docker exec -i foodie_postgres psql -U foodie -d foodie_share < file.sql` |
| View all stored procedures | `\df` (in psql) |
| View all triggers | `SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';` |
