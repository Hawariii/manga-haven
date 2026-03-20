# Manga Haven

Manga Haven is a mobile-first full-stack manga web app built with Next.js and Laravel.

It includes:
- public manga browsing for guests
- user authentication with Laravel Sanctum
- favorites and reading history for logged-in users
- admin-only manga and chapter management
- modern dark UI optimized for mobile screens

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios
- Backend: Laravel 13, Sanctum
- Database: MySQL / MariaDB

## Features

### Guest
- browse manga list
- search manga
- view manga detail by slug
- view top manga

### User
- register
- login
- logout
- save favorites
- save reading history

### Admin
- admin-only login
- upload/create manga
- upload/create chapter to a selected manga
- protected admin panel

## Project Structure

```text
manga-haven/
  frontend/   # Next.js app
  backend/    # Laravel API
```

## Environment Variables

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend

Create `backend/.env`:

```env
APP_NAME="Manga Haven"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=manga_havendb
DB_USERNAME=root
DB_PASSWORD=your_password

SESSION_DRIVER=database
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:8000,127.0.0.1:8000
```

## Installation

### 1. Clone

```bash
git clone <your-repo-url>
cd manga-haven
```

### 2. Install Frontend

```bash
cd frontend
npm install
```

### 3. Install Backend

```bash
cd ../backend
composer install
npm install
cp .env.example .env
php artisan key:generate
```

### 4. Prepare Database

Create the database:

```sql
CREATE DATABASE manga_havendb;
```

Then run:

```bash
cd backend
php artisan migrate
php artisan db:seed
```

## Run the Project

### Backend

```bash
cd backend
php artisan serve
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Demo Accounts

### User

- email: `test@example.com`
- password: `password123`

### Admin

- email: `admin@mangahaven.test`
- password: `admin12345`

Admin login is not exposed in the public UI, but the route still exists for authorized use.

## Important Routes

### Frontend

- `/`
- `/manga/[slug]`
- `/top-manga`
- `/login`
- `/register`
- `/profile`
- `/history`
- `/favorite`
- `/admin/login`
- `/admin/manga`

### API

- `POST /api/register`
- `POST /api/login`
- `POST /api/admin/login`
- `POST /api/logout`
- `GET /api/user`
- `GET /api/manga`
- `GET /api/manga/{slug}`
- `GET /api/top-manga`
- `GET /api/history`
- `POST /api/history`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/{id}`

## Development Notes

- guests can only read public manga content
- favorites and history require login
- admin endpoints are protected by backend role checks
- search uses debounced input
- recent search is stored in localStorage
- route protection on the frontend uses Next.js `proxy.ts`

## Verification

Commands that passed during setup:

```bash
cd frontend && npm run lint
cd frontend && npm run build
cd backend && php artisan migrate
cd backend && php artisan db:seed
```

## Next Improvements

- real file upload for manga covers via Laravel storage
- edit/delete manga and chapters from admin panel
- comments system
- rate limiting for auth endpoints
- genre/category system in database
