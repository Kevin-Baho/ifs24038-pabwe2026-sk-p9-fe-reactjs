# Delcom Blog — Multi-Tier & AI Generator (Frontend ReactJS)

Single Page Application (SPA) frontend untuk studi kasus **Delcom Blog Multi-Tier & AI Generator dengan Integrasi Search Engine**.
Berdiri sendiri (decoupled deployment, build statis via Vite), mengikuti pola proyek referensi Latihan P9
(`helpers/`, `hooks/`, `components/`, `features/<feature>/{api,components,modals}`).

- Frontend: **http://localhost:5174**
- Reverse proxy `/api` → Backend **http://localhost:8081** (`vite dev` **dan** `vite preview`)

## Menjalankan

```bash
npm install
npm run dev        # dev server port 5174
npm test           # vitest run --coverage (threshold 100% statements/branches/functions/lines)
npm run build      # build statis -> dist/
npm run preview    # menyajikan dist/ pada port 5174 + proxy /api
```

Variabel opsional (`.env`, lihat `.env.example`):

| Variabel | Default | Fungsi |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL yang dipanggil browser |
| `VITE_API_PROXY_TARGET` | `http://localhost:8081` | Target reverse proxy Vite |

Untuk hosting statis di produksi (Nginx/Caddy dsb.), arahkan `/api` ke Backend dan jadikan `index.html`
sebagai fallback semua rute SPA (`/posts/:slug`, `/author`, `/admin` harus aman saat di-refresh).

## Rute SPA (sinkron dengan URL, aman saat refresh)

| Rute | Komponen | Akses |
|---|---|---|
| `/` atau `/public` | `PublicArticleList` | Guest/Publik |
| `/posts/:slug` | `PublicArticleDetail` | Guest/Publik |
| `/author` | `AuthorDashboard` | Login (tanpa login → modal `AuthModal`) |
| `/admin` | `AdminDashboard` | Role `admin` (selain admin → "Akses Ditolak") |
| `/login`, `/register` | `AuthPage` | Guest |

Navigasi memakai `window.history.pushState` + listener `popstate` di `App.jsx`.
Form login terstandarisasi: `#login-username`, `#login-password`, `#login-submit` (di `AuthPage` dan `AuthModal`).

## Kontrak API yang diasumsikan (Backend port 8081)

Semua respons berbentuk `{ "data": ... }`; error `{ "message": "..." }`. Token JWT disuntikkan otomatis
(`Authorization: Bearer ...`) oleh `helpers/apiHelper.js`. **Jika endpoint Backend berbeda, cukup ubah
tiga berkas `features/*/api/*.js`.**

| Method & Path | Keterangan |
|---|---|
| `POST /api/auth/login` `{username,password}` | → `{token, user:{id,username,role}}` |
| `POST /api/auth/register` `{username,email,password,role}` | role: `author` \| `admin` (setelah sukses FE otomatis login) |
| `POST /api/auth/logout` | opsional; kegagalan diabaikan |
| `GET /api/public/posts` | artikel terbit (publik) |
| `GET /api/public/posts/:slug` | detail artikel; Backend sebaiknya mengizinkan pemilik melihat draf miliknya (dipakai menu "Detail") |
| `GET /api/posts` | artikel milik penulis login |
| `POST /api/posts` / `PUT /api/posts/:id` / `DELETE /api/posts/:id` | CRUD `{title, category, status, content}` |
| `PATCH /api/posts/:id/status` `{status}` | `published` \| `draft` (switch toggle instan) |
| `POST /api/posts/ai-generate` `{prompt, category, include_web_search}` | → `{title, content, search_sources:[string]}` |
| `GET /api/admin/users` | `{id, username, email, role, total_posts}` |
| `GET /api/admin/posts` | seluruh artikel |

Bidang artikel: `id, title, slug, content, category, status ('published'|'draft')`, opsional
`excerpt`, `reading_time`, `author.username` atau `author_name`, `published_at`, `created_at`.
Jika `excerpt`/`reading_time` tidak dikirim, FE menghitungnya dari `content`.

## Pengujian

Unit test + integrasi (`@testing-library/react`, mock `fetch`) untuk setiap berkas di `src/`.
`setupTests.js` memuat polyfill JSDOM (Range rects, `execCommand`, `matchMedia`, `ResizeObserver`, dll.)
untuk `@toast-ui/editor`. `MarkdownComponents.test.jsx` memakai editor palsu agar seluruh cabang deterministik.
