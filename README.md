# Foodie Share - Food Sharing Community

## Project Overview

Foodie Share is a sharing community platform built for food lovers. Users can publish food posts with images and geolocation, browse recommendations from others, save favorite restaurants, and leave comments on posts. The core objective of the project is to demonstrate solid database design capabilities, including normalized table structures, stored procedures, triggers, geospatial queries, and a highly encapsulated SQL query architecture.

## Target Features (12 Core Requirements)

1. **User Account System**: Unique username registration and login, JWT + HttpOnly Cookie stateless authentication
2. **Image Posting**: Support publishing food posts via image URL
3. **Home Feed**: Waterfall/list display of food posts from others with direct image viewing
4. **Post Information**: Each post displays username, avatar, image, description, restaurant name, timestamp, and like count
5. **Interactions**: Like, save (Mark), and comment on posts
6. **Multi-user Concurrency**: Support simultaneous multi-device multi-user usage with database triggers ensuring concurrency safety
7. **Posting**: Support pure text posts and sending current geolocation
8. **Real-time Likes**: Like count automatically maintained by triggers with instant frontend reflection
9. **Comment System**: Comment on posts with like support and "Tasted" badge
10. **Sorting**: Posts sorted by likes or time
11. **User Profile**: View others' profiles and their published posts
12. **Nearby Food**: Display saved food within 3 km on the Nearby page (PostGIS geospatial calculation)

## Bonus Features

- **Multi-device multi-user concurrent access**: Stateless JWT authentication, valid independently on any device
- **Auto-maintained like count**: Trigger atomic updates with no race conditions under concurrency
- **Sort by time/popularity**: Flexible dual-dimension sorting
- **User post history**: Aggregated display on personal profile
- **Like/unlike**: One-click toggle with instant feedback
- **Basic analytics**: Hottest post leaderboard, most active user ranking
- **Creative SQL Extensions**:
  - Geospatial clustering analysis (PostGIS ST_ClusterDBSCAN) to identify popular food areas
  - **Highly encapsulated SQL query gateway**: All backend database access does not directly concatenate SQL, but instead goes through a unified stored procedure call layer. The frontend passes action names and parameters via `/api/query`, and the backend gateway maps them to corresponding stored procedures. Zero raw SQL in the business layer; all complex query logic is encapsulated inside the database.

## Tech Stack

| Layer | Technology | Description |
|------|------|------|
| Frontend | React 19 + Vite | Lightweight, fast development, modern frontend framework |
| Backend | Node.js + Express | RESTful API, native JWT Cookie support |
| Database | PostgreSQL 16 + PostGIS | Relational database + geospatial extension |
| Deployment | Docker Compose + Nginx | Single-machine all-in-one, one-click startup |
| Authentication | JWT (HttpOnly Cookie) | Stateless, XSS-resistant |

## Database Architecture

### Core Tables

- **`users`**: User information (id, username, email, password_hash, avatar_url)
- **`posts`**: Posts (id, user_id, image_url, description, restaurant_name, location, like_count, mark_count)
- **`likes`**: User-post like relationships (user_id, post_id)
- **`marks`**: User-post save relationships (user_id, post_id) — **explicit many-to-many relationship table**
- **`comments`**: Comments (id, post_id, user_id, content, is_tasted, like_count)
- **`comment_likes`**: Comment like relationships
- **`user_stats`**: User statistics (post_count, total_likes_received, comment_count) — **automatically maintained by triggers**

### Stored Procedures

- `like_post(user_id, post_id)` / `unlike_post(user_id, post_id)`
- `mark_post(user_id, post_id)` / `unmark_post(user_id, post_id)`
- `add_comment(user_id, post_id, content, is_tasted)`
- `like_comment(user_id, comment_id)` / `unlike_comment(user_id, comment_id)`
- `get_user_feed(user_id, sort_by, limit, offset)` — retrieve home feed
- `get_nearby_marks(user_id, lat, lng, radius)` — nearby saved posts
- `get_post_comments(post_id)` — post comment tree
- `get_user_profile_stats(user_id)` — aggregated user profile data
- `get_top_posts(limit)` — hottest post leaderboard
- `get_top_users(limit)` — most active user leaderboard
- `get_geo_clusters(min_points, eps)` — PostGIS DBSCAN geospatial clustering

### Triggers

- `trg_post_like_count`: Automatically update posts.like_count when likes changes
- `trg_post_mark_count`: Automatically update posts.mark_count when marks changes
- `trg_comment_like_count`: Automatically update comments.like_count when comment_likes changes
- `trg_user_stats`: Automatically update user_stats table when posts changes

### Materialized Views

- `mv_top_posts`: Hottest post leaderboard

### Creative Queries

- **Geospatial clustering**: `ST_ClusterDBSCAN` analyzes the geographic distribution of saved posts to identify popular food areas
- **Query gateway**: All read operations go through a unified action-to-stored-procedure mapping, with zero raw SQL in backend route handlers

## Page Structure

- **Login / Register**: JWT Cookie authentication
- **Home**: Post feed, supports sorting by likes/time
- **Post Detail**: Full post + comment section (supports "Tasted" badge, comment likes)
- **Other User Profile**: Username, avatar, historical posts
- **My Profile**: Own info, posts, total likes received
- **Marked Page**: Saved restaurant list, sortable by recommendation/time
- **Nearby Food Page**: Saved restaurants within 3 km (PostGIS geospatial query)
- **Create Post Page**: Image URL, text description, restaurant name, optional geolocation
- **Analytics Page**: Hottest posts, most active users, geospatial clustering visualization

## Deployment Architecture

```
┌─────────────┐
│   Nginx     │  ← Port 80/443, reverse proxy, HTTPS
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼───┐ ┌─▼──────┐
│React │ │Express │  ← RESTful API, Stateless
│Static│ │Backend │  ← JWT verification, calls stored procedures
└──────┘ └───┬────┘
             │
        ┌────▼────┐
        │PostgreSQL│  ← PostGIS extension, triggers, stored procedures
        │+ PostGIS │  ← Data consistency guaranteed by database
        └─────────┘
```

Single-machine all-in-one architecture, all services run on the same Linux VPS, started with one command via Docker Compose.

## Design System

- **Colors**: Surface `#000000`, Primary `#C0E1D2`, Secondary `#E5EEE4`, Tertiary `#F6F4E8`, Highlight `#DC9B9B`, Error `red`
- **Fonts**: Body Inter, Headings Helvetica
- **Spacing**: 8dp baseline (4dp, 8dp, 16dp, 24dp, 32dp, 48dp)
- **Design System**: Impeccable (https://impeccable.style)

## Deliverables

| Deliverable | Description |
|--------|------|
| PowerPoint (<=10 pages) | Requirements, ER model, SQL queries, UI design, collaboration/workload, demo video |
| Source Code (zip) | Relational database design, Text-to-SQL query system, data visualization UI, deployable website |
| Database Scripts | Schema, stored procedures, triggers, materialized views, seed data |
| Docker Compose | One-click startup for the complete application stack |
