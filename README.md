# jpdm.dev

JP's website - a full-stack community/CMS platform with an Express.js backend, React SPA frontend, and PostgreSQL database. Features AI-powered content moderation via self-hosted LiteLLM, social OAuth (Google/Facebook), JWT authentication, role-based admin dashboard, blog posts with image galleries, nested comments, likes, view tracking, and CAPTCHA bot protection.

[See full list of features](#features)

## Quickstart

```bash
git clone https://git.jpdm.dev/jp/jpdm.dev.git
cd jpdm.dev
cp .env.example .env          # review and customize secrets
docker compose up -d
```

Open **http://localhost:8080**. Seeded credentials : admin/admin (default in .env)

> **Note:** For AI moderation features, see LITELLM_* vars in `.env.example` and `litellm.example.yml` then use below to run the app:

```bash
docker compose -f docker-compose.yml -f docker-compose.ai.yml up -d
```


## Development

Install dependencies:

```bash
npm ci                    # install dependencies
cp .env.example .env      # create .env from template
```
> **Important:** Change `POSTGRES_HOST=db` to `POSTGRES_HOST=localhost` in `.env` when running `npm run dev` outside Docker.

Then:

```bash
npm run dockerdev:up   # starts db + pgAdmin in Docker
npm run dev            # starts backend + frontend with hot-reload
```

| URL (default config) | Service |
|-----|---------|
| https://localhost:8080 | Frontend (Vite dev server) |
| http://localhost:3000 | Backend API |
| http://localhost:5050 | pgAdmin |




### Useful Commands

```bash
npm run migrate           # run migrations manually
npx kanel                 # generate model types after database/schema migration
npm run dockerdev:down    # stop dev Docker services
npm run lint              # lint all workspaces
```
<br>

# Features

## Authentication & Authorization

| Feature | Description |
|---|---|
| **JWT Authentication** | Access tokens + refresh tokens via HTTP-only cookies |
| **Automatic Token Refresh** | Frontend API client transparently refreshes expired access tokens |
| **Sign Up / Sign In** | Email + password registration and login |
| **Forgot / Reset Password** | Email-based password reset flow (`PasswordReset` tokens) |
| **Change Password** | Authenticated password change |
| **Update Email** | Change account email address |
| **Google OAuth** | Social login via Google (Passport.js `passport-google-oauth20` strategy) |
| **Facebook OAuth** | Social login via Facebook (Passport.js `passport-facebook` strategy) |
| **Social Profile Sync** | Auto-creates user profiles from OAuth data (name, avatar download) |
| **Role-Based Access Control** | Roles with gated UI and API endpoints |
| **Anonymous Users** | Read-only access for unauthenticated visitors |

---

## AI Integration

| Feature | Description |
|---|---|
| **LiteLLM Proxy** | Self-hosted LiteLLM gateway providing an OpenAI-compatible API |
| **AI Name/Username Moderation** | `moderateName()` - LLM-based filtering of display names and usernames for insults, bad words, spam |
| **AI Comment Moderation** | `moderateComment()` - LLM-based content moderation for user comments |
| **AI Image Moderation** | `moderateImage()` - Vision-model moderation of uploaded avatars (nudity, violence, hate symbols, spam, QR codes, etc.) |
| **Image Pre-Processing** | Automatic WebP compression before sending images to the vision model |
| **OpenAI SDK Client** | Uses the `openai` npm package pointed at the LiteLLM proxy as a drop-in compatible base URL |

---

## Blog / Content

| Feature | Description |
|---|---|
| **Posts (Blog)** | Full CRUD for blog posts with cover images and visibility control |
| **Post Images** | Upload, manage, and display image galleries per post |
| **Image Collage** | Multi-image layout component for post galleries |
| **Post Comments** | Nested commenting system with AI moderation |
| **Post Likes** | Like/unlike toggle with count tracking |
| **Post Views** | View tracking with device fingerprinting (`PostView`) |
| **Post Visibility** | Configurable who can create posts (`POST_ALLOWED_USER`) |
| **Home Page Curation** | Configurable which user's posts appear on the home page (`HOME_PAGE_USER`) |

---

## Content Moderation

| Feature | Description |
|---|---|
| **AI Name Filtering** | LLM validates display names and usernames on creation/update |
| **AI Comment Filtering** | LLM validates comment content before storage |
| **AI Image Filtering** | Vision model validates uploaded avatars/images |
| **Graceful Degradation** | All moderation returns `{ is_allowed: true }` when AI is not configured - no feature breakage |
| **CAPTCHA** | reCAPTCHA v3 integration for bot protection |

---

## User Profiles

| Feature | Description |
|---|---|
| **Avatar Upload** | User avatar image upload with AI vision moderation |
| **Display Name** | Editable display name with AI moderation |
| **Profile Fields** | First name, last name, and avatar |
| **OAuth Avatar Sync** | Auto-downloads social provider avatars on first login |

---

## User Dashboard

| Feature | Description |
|---|---|
| **Personal Stats** | User activity statistics |
| **My Posts** | Manage own blog posts |
| **My Comments** | Manage own comments |

---

## Admin Dashboard

| Feature | Description |
|---|---|
| **User Management** | MUI DataGrid with search, pagination, sort, edit, soft-delete, and restore |
| **Role Assignment** | Add/remove `admin` and `moderator` roles per user |
| **Admin Content View** | Admin-scoped views of all posts and comments across users |
| **Admin Tokens/Logs** | Navigation slots for token management and log viewing |

---

## Email

| Feature | Description |
|---|---|
| **SMTP Integration** | Nodemailer-based email sending (password resets, notifications) |
| **Configurable** | Host, port, auth, TLS, and server name via env vars |
| **TLS Enforcement** | Certificate validation in production, relaxed in dev |

---

## Infrastructure

| Feature | Description |
|---|---|
| **Layered Architecture** | Controllers > Services > Repositories with dependency injection (`AppContext` / `ServiceContext`) |
| **Transaction Support** | `withTransaction` helper - passes transaction-bound repos to services |
| **Database Migrations** | Manual SQL migrations applied alphabetically, tracked in `migrations` table |
| **Rate Limiting** | Configurable per-route limits (per-user or per-IP, resource-scoped via custom key) |
| **Signed URLs** | User content access via time-limited HMAC-signed URLs (15-min default expiry) |
| **CORS** | Configurable cross-origin origins list |
| **Docker** | Docker Compose for full local dev stack (app + DB + LiteLLM) |
| **Docker AI Stack** | Separate `docker-compose.ai.yml` for the LiteLLM proxy service |
| **CI/CD** | Gitea Actions workflow (`.gitea/workflows/ci.yml`) with `litellm.yml` deployment |
| **Logging** | File-based logging with configurable `DEBUG`, `DEBUG_TRACE`, and `LOG_SQL` flags |
| **Seeding** | Database seed script with configurable admin credentials |

---

## Frontend

| Feature | Description |
|---|---|
| **Material UI (MUI)** | Design system with enforced deep imports for tree-shaking |
| **Zustand State** | 5 stores: auth, user profile, snackbar (toasts), async confirm dialogs, post-seen tracking |
| **React Router** | Client-side routing with `RequireAuth` / `AuthGuard` for protected routes |
| **React Hook Form** | Form state management with custom `useFormValidation` hook |
| **Responsive** | Mobile-friendly with persistent drawer (desktop) / temporary drawer (mobile) |
| **Skeleton Loading** | Wave-based skeleton placeholders for posts, comments, and pages |
| **Lightbox** | Image preview dialog with dialog-based full view |
| **Async Confirm** | `useConfirmStore.confirm()` returns `Promise<boolean>` - programmatic confirmation dialogs |
| **Toast Notifications** | Snackbar-based notification system |
| **Error Boundary** | Global `ErrorBoundary` + `GlobalErrorHandler` |
| **Device Fingerprinting** | `getDeviceId()` / `getFingerprint()` for anonymous view tracking |
| **SEO** | Sitemap, robots.txt |

---

## Static Pages

Home, About, Projects, Homelab, and a custom 404 page.