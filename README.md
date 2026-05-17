# Telvine Realty — Real Estate Management Platform

A production-ready, full-stack real estate management platform. Includes a premium public website, a glassmorphism admin dashboard, and a secure Node.js + MongoDB Atlas REST API.

```
Property-Management-System/
├── server/   # Node + Express + MongoDB backend
└── client/   # React + Vite + Tailwind frontend (public site + admin panel)
```

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router DOM, Axios, React Hook Form, Zod, Recharts, lucide-react, react-hot-toast.

**Backend:** Node.js, Express, MongoDB (Atlas) + Mongoose, JWT (access + refresh), bcryptjs, Multer + Cloudinary, Helmet, CORS, express-validator, express-rate-limit, express-mongo-sanitize, xss-clean, hpp, compression, morgan.

---

## 1. Prerequisites

- **Node.js 18+**
- **MongoDB Atlas** account (free tier works) — get a connection string
- **Cloudinary** account — for image uploads (optional in dev; uploads will fail without it)

---

## 2. Backend Setup

```bash
cd server
cp .env.example .env       # then edit .env with your secrets
npm install
npm run seed               # seeds super admin + sample services
npm run dev                # http://localhost:5000
```

### Required env vars (`server/.env`)

```ini
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/realestate?retryWrites=true&w=majority

JWT_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false

CLOUDINARY_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Seed user

`npm run seed` creates a Super Admin:

- **Email:** `admin@telvine.com`
- **Password:** `Admin@123`

Change the password immediately after first login.

---

## 3. Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

### Frontend env (`client/.env`)

```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Project Structure

### Backend (`server/`)

```
server/
├── app.js                   # Express app + middleware pipeline
├── server.js                # Entry point, connects to DB
├── seed.js                  # Bootstraps a super admin + sample data
├── config/
│   ├── db.js                # Mongoose connection
│   └── cloudinary.js        # Cloudinary SDK config
├── controllers/             # Route handlers (auth, user, property, inquiry, review, service, dashboard)
├── middlewares/             # auth (protect/authorize), error, upload (Multer+Cloudinary), validate
├── models/                  # Mongoose schemas (User, Property, Inquiry, Review, Service, Testimonial, Settings)
├── routes/                  # Express routers
├── utils/                   # ApiError, ApiResponse, asyncHandler, generateToken
└── validations/             # express-validator schemas
```

### Frontend (`client/`)

```
client/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── public/favicon.svg
└── src/
    ├── main.jsx             # React entry, providers, toaster
    ├── App.jsx              # Routes (public, auth, admin)
    ├── index.css            # Tailwind layers + global styles
    ├── lib/
    │   ├── api.js           # Axios instance with refresh-token interceptor
    │   └── utils.js         # Helpers (cn, formatPrice, status colors, …)
    ├── context/
    │   ├── AuthContext.jsx  # User session, login/register/logout
    │   └── ThemeContext.jsx # Dark/light mode (persisted)
    ├── services/            # API client modules (one per domain)
    ├── routes/
    │   └── ProtectedRoute.jsx
    ├── layouts/
    │   ├── PublicLayout.jsx
    │   └── AdminLayout.jsx
    ├── components/
    │   ├── ui/              # Button, Input, Card, Modal, Pagination, Badge, Skeleton, Rating, EmptyState
    │   ├── public/          # Navbar, Footer, PropertyCard, SectionHeader
    │   ├── auth/            # AuthShell
    │   └── admin/           # Sidebar, Topbar, StatCard, PageHeader
    └── pages/
        ├── public/          # Home, About, Services, Properties, PropertyDetail, Contact
        ├── auth/            # Login, Register, ForgotPassword, ResetPassword
        ├── admin/           # Dashboard, Properties, PropertyForm, Inquiries, Reviews, Users, Settings
        └── NotFound.jsx
```

---

## 5. REST API

Base URL: `http://localhost:5000/api`

All authenticated routes accept either `Authorization: Bearer <token>` or the `accessToken` cookie. Refresh-token rotation is automatic via the Axios interceptor on the frontend.

### Auth — `/auth`

| Method | Path                          | Auth | Description                       |
| ------ | ----------------------------- | ---- | --------------------------------- |
| POST   | `/register`                   | —    | Register a new admin user         |
| POST   | `/login`                      | —    | Login → access + refresh tokens   |
| POST   | `/refresh`                    | —    | Refresh access token              |
| POST   | `/logout`                     | ✅    | Logout, clear refresh             |
| GET    | `/me`                         | ✅    | Current user                      |
| POST   | `/forgot-password`            | —    | Generates reset token             |
| POST   | `/reset-password/:token`      | —    | Reset password                    |

### Properties — `/properties`

| Method | Path             | Auth          | Description                                       |
| ------ | ---------------- | ------------- | ------------------------------------------------- |
| GET    | `/`              | —             | List (filters: `search, propertyType, listingType, city, minPrice, maxPrice, bedrooms, status, featured, sort, page, limit`) |
| GET    | `/:id`           | —             | Get by ID or slug                                 |
| GET    | `/:id/similar`   | —             | Similar properties                                |
| POST   | `/`              | Admin / Agent | Create (multipart, up to 12 images)               |
| PATCH  | `/:id`           | Admin / Agent | Update (multipart; `removeImages` JSON array)     |
| PATCH  | `/:id/featured`  | Admin / Agent | Toggle featured                                   |
| DELETE | `/:id`           | Admin / Agent | Delete (also removes Cloudinary assets)           |

### Inquiries — `/inquiries`

| Method | Path        | Auth          | Description                       |
| ------ | ----------- | ------------- | --------------------------------- |
| POST   | `/`         | —             | Public submission                 |
| GET    | `/`         | Admin / Agent | List (search, status, page)       |
| GET    | `/export`   | Admin / Agent | CSV export                        |
| GET    | `/:id`      | Admin / Agent | Single                            |
| PATCH  | `/:id`      | Admin / Agent | Update status / notes             |
| DELETE | `/:id`      | Admin / Agent | Delete                            |

### Reviews — `/reviews`

| Method | Path             | Auth          | Description                       |
| ------ | ---------------- | ------------- | --------------------------------- |
| POST   | `/`              | —             | Public submission (pending)       |
| GET    | `/approved`      | —             | Public approved reviews           |
| GET    | `/`              | Admin         | Admin list                        |
| PATCH  | `/:id/status`    | Admin         | Approve / reject                  |
| DELETE | `/:id`           | Admin         | Delete                            |

### Users — `/users`

Admin / Super Admin only. `super_admin` can create and delete.

| Method | Path            | Description           |
| ------ | --------------- | --------------------- |
| GET    | `/`             | List with search      |
| POST   | `/`             | Create (super_admin)  |
| GET    | `/:id`          | Detail                |
| PATCH  | `/:id`          | Update                |
| DELETE | `/:id`          | Delete (super_admin)  |
| PATCH  | `/me`           | Update own profile    |
| PATCH  | `/me/password`  | Change own password   |

### Services / Testimonials / Settings — `/services`

Public: `GET /`, `GET /testimonials`, `GET /settings`. Admin endpoints to manage everything.

### Dashboard — `/dashboard/stats`

Admin only — returns counts, distributions, monthly inquiries, recent activity.

---

## 6. Roles

- **super_admin** — full access (users, settings, etc.)
- **admin** — manages content, inquiries, reviews
- **agent** — manages properties and views inquiries

---

## 7. Production Build

### Backend

```bash
cd server
NODE_ENV=production npm start
```

Deploy to Render / Railway / Fly.io. Make sure the env vars listed above are set, `COOKIE_SECURE=true` is on HTTPS, and the Atlas IP allow-list includes the deploy target (`0.0.0.0/0` for managed platforms).

### Frontend

```bash
cd client
npm run build      # outputs to dist/
```

Deploy `dist/` to Vercel / Netlify / Cloudflare Pages. Set `VITE_API_URL` to the deployed backend URL. For SPA routing, the host must rewrite all routes to `index.html`.

---

## 8. Highlights

- **Premium UI** — Telvine V3 design with glassmorphism, gradients, soft shadows, Framer Motion.
- **Dark / light mode** — class-based, persisted via `localStorage`, prefers-color-scheme aware on first load.
- **Auth** — JWT (access + httpOnly refresh cookie), automatic refresh in Axios.
- **Security** — Helmet, CORS, rate limiting, Mongo sanitize, XSS, HPP, bcrypt cost-12.
- **Validation** — express-validator on backend + Zod/RHF on frontend.
- **Property module** — multipart create/update, Cloudinary uploads, search + filter + sort + pagination, slugs, featured.
- **Inquiries** — public submit form + admin pipeline (new → contacted → interested → closed/spam) + CSV export.
- **Reviews** — public submit (pending) + admin moderation; only approved show publicly.
- **Dashboard** — stats cards, property type pie, monthly inquiries bar chart, status distribution, recent activity.
- **Roles** — `super_admin`, `admin`, `agent`.

---

## 9. Useful Scripts

| Folder    | Command          | What it does                  |
| --------- | ---------------- | ----------------------------- |
| `server/` | `npm run dev`    | Start API (nodemon)           |
| `server/` | `npm run seed`   | Create super admin + samples  |
| `server/` | `npm start`      | Production start              |
| `client/` | `npm run dev`    | Vite dev server               |
| `client/` | `npm run build`  | Production build              |
| `client/` | `npm run preview`| Preview production build      |

---

## 10. License

MIT — use, modify, ship.
