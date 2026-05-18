# Telvine Realty — Property Management System

Full-stack real-estate platform with a public marketing site, an admin
console, role-based access control, image-rich property listings, event
popups, and email notifications for new listings.

```
client/   → React + Vite + Redux Toolkit + Tailwind CSS
server/   → Node.js + Express + MongoDB (Mongoose) + JWT + Nodemailer
```

---

## Features at a glance

| Area | What's in the box |
| --- | --- |
| **Auth** | Login / forgot password / reset password. **No public signup** — only admins create accounts. JWT access + refresh tokens, httpOnly cookies, role guard middleware. |
| **RBAC** | `super_admin` · `admin` · `agent` · `user`. Server enforces role hierarchy on create / update / delete. |
| **Users** | Admin can search, paginate, edit, deactivate, delete, and export users to CSV / Excel / PDF. |
| **Properties** | Full CRUD, multi-image upload (Cloudinary), featured flag, status workflow, similar suggestions, view counter. |
| **Events** | Promotional event CRUD with optional banner image, "Show as popup" toggle, smooth modal on the public site, session-aware dismissal. |
| **Email** | Reusable Nodemailer wrapper. New properties automatically email every opted-in user with a professional HTML template. |
| **Admin Dashboard** | Stats, distribution charts, top-viewed properties, "needs your attention" panel, upcoming events, recent activity. |
| **Security** | Helmet, HPP, mongo-sanitize, xss-clean, rate-limit, bcrypt(12), httpOnly cookies, refresh-token rotation. |
| **State** | 100% Redux Toolkit (no Context API). Slices: `auth`, `events`, `users`, `properties`, `notifications`, `ui`. |

---

## Folder layout

```
client/src
├─ App.jsx                # Route table
├─ main.jsx               # Entry — dispatches bootstrapAuth before mount
├─ components/
│  ├─ admin/              # Sidebar, Topbar, StatCard, ExportMenu, …
│  ├─ auth/               # AuthShell
│  ├─ public/             # Navbar, Footer, EventPopup, PropertyCard, …
│  └─ ui/                 # Reusable primitives (Button, Modal, Pagination)
├─ layouts/               # PublicLayout (with EventPopup), AdminLayout
├─ pages/
│  ├─ admin/              # Dashboard, Properties, Events, Users, …
│  ├─ auth/               # Login, ForgotPassword, ResetPassword
│  └─ public/             # Home, Properties, PropertyDetail, About, …
├─ services/              # axios-based API clients (event/user/property/…)
├─ store/
│  ├─ index.js            # configureStore — auth, ui, events, users, properties, notifications
│  └─ slices/             # createSlice + createAsyncThunk
├─ hooks/useAuth.js       # Redux-backed convenience hook
├─ lib/api.js             # Centralized axios instance (JWT, refresh, error handling)
└─ routes/ProtectedRoute  # Role-aware <Route> guard

server
├─ server.js              # entry
├─ app.js                 # express app — helmet / cors / rate-limit / routes
├─ config/                # db.js, cloudinary.js
├─ controllers/           # auth, user, property, event, inquiry, review, dashboard
├─ middlewares/           # auth, error, upload (multer-cloudinary), validate
├─ models/                # User, Property, Event, Inquiry, Review, …
├─ routes/                # one file per resource
├─ services/              # email.service.js, notification.service.js
├─ utils/                 # ApiError, ApiResponse, asyncHandler, generateToken
├─ validations/           # express-validator chains
└─ seed.js                # creates the initial super_admin + sample data
```

---

## Prerequisites

- **Node.js** ≥ 18
- A **MongoDB Atlas** cluster (or local mongod)
- A **Cloudinary** account (free tier is fine)
- **SMTP** credentials — Gmail App Password works, or use Mailtrap for dev

---

## 1) Clone and install

```bash
git clone <repo-url> Property-Management-System
cd Property-Management-System

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## 2) Environment variables

### Backend — `server/.env`

Copy `server/.env.example` to `server/.env` and fill in the values:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<pwd>@cluster0.xxxx.mongodb.net/realestate
JWT_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false        # set "true" behind HTTPS

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Telvine Realty <no-reply@telvine.local>"
```

> **Tip:** SMTP is optional. If credentials are missing, the server logs a
> warning and skips the email — property creation still works.

### Frontend — `client/.env`

```dotenv
VITE_API_URL=http://localhost:5000/api
```

---

## 3) Seed the database

The seed script creates a super_admin and the sample services / testimonials:

```bash
cd server
npm run seed
# → super admin: admin@gmail.com / admin123
```

After first login, change the password in **Admin → Settings**.

---

## 4) Run

In two terminals:

```bash
# terminal A
cd server && npm run dev   # nodemon → http://localhost:5000

# terminal B
cd client && npm run dev   # vite → http://localhost:5173
```

Open `http://localhost:5173`, click **Login**, and sign in as the seeded
super admin.

---

## 5) Production build

```bash
# Frontend
cd client && npm run build       # outputs to client/dist

# Backend
cd ../server && NODE_ENV=production node server.js
```

Serve `client/dist` via any static host (Vercel, Netlify, Nginx, …) and
point `VITE_API_URL` at your deployed API.

---

## How the new features fit together

### Event popup

1. Admin creates an event in **Admin → Events** with **Show as popup = true**.
2. Public site calls `GET /api/events/popup` on mount — returns the latest
   active popup event (or `null`).
3. `<EventPopup />` (mounted in `PublicLayout`) renders a modal with the
   title, description, optional image, and a Close button.
4. Dismissal is stored in `sessionStorage` per-event — a brand-new event
   pops again, but the same one won't nag the visitor on every page.

### Email notification on new property

1. `propertyController.createProperty` calls
   `notifyNewProperty(property)` from `services/notification.service.js`.
2. The call is wrapped in `setImmediate` → SMTP latency never blocks the
   API response.
3. Notification service queries every active user with
   `notificationsEnabled: true`, batches them in groups of 20, and sends
   each one a branded HTML email (with text fallback).
4. Failures are logged but never thrown — property creation always
   succeeds even if SMTP is down.

### RBAC + admin-only account creation

- `POST /api/auth/register` was removed. The only way to create an
  account is `POST /api/users` (admin-only).
- `userController.createUser` runs `canAssignRole(actor, targetRole)`
  to block privilege escalation (an `admin` can't create a
  `super_admin`).
- Sidebar shows **Users**, **Admins**, **Agents** — all backed by the
  same `UserManagement` component with different `roleFilter` /
  `roleOptions` props.

---

## MongoDB Atlas setup (one-time)

1. Sign up at <https://www.mongodb.com/atlas>.
2. Create a free **M0** cluster.
3. **Database Access** → create a database user (username + strong
   password).
4. **Network Access** → add your IP, or `0.0.0.0/0` for development.
5. **Database** → **Connect** → **Drivers** → copy the URI and paste it
   into `MONGO_URI`. Replace `<password>` with the user's password.

---

## Nodemailer / SMTP setup

### Gmail (production-ish)

1. Enable 2-Step Verification on the Google account.
2. <https://myaccount.google.com/apppasswords> → generate an app
   password.
3. Use:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<your-gmail>
   SMTP_PASS=<app-password>
   ```

### Mailtrap (great for dev)

1. Sign up at <https://mailtrap.io>.
2. **Inboxes** → **My Inbox** → **SMTP Settings** → copy host / port /
   user / pass into `.env`.
3. Every notification email lands safely in your inbox instead of being
   sent for real.

---

## Useful npm scripts

| Where | Command | What it does |
| --- | --- | --- |
| `server/` | `npm run dev` | nodemon on `server.js` |
| `server/` | `npm start` | production start |
| `server/` | `npm run seed` | seeds the database |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Vite production build |
| `client/` | `npm run preview` | Vite preview of the build |

---

## Deployment quick notes

- **Frontend** (Vercel / Netlify): set the build command to
  `npm run build`, output dir to `dist`, and configure the
  `VITE_API_URL` env var to point at your deployed API.
- **Backend** (Render / Railway / Fly / a VPS): expose `5000`, set every
  env var from the table above, and `NODE_ENV=production`. Enable HTTPS
  and set `COOKIE_SECURE=true`.
- **CORS**: `CLIENT_URL` accepts a comma-separated list — list every
  origin that should be allowed to call the API.

---

## API surface (cheat-sheet)

```
POST   /api/auth/login                  → email + password → tokens + user
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token

GET    /api/users                       (admin) search/pagination/filter
POST   /api/users                       (admin) create user/agent/admin
GET    /api/users/export                (admin) full dataset for CSV/Excel
PATCH  /api/users/:id                   (admin)
DELETE /api/users/:id                   (admin)
PATCH  /api/users/me                    (any) self profile
PATCH  /api/users/me/password           (any) change password

GET    /api/properties                  (public) list with filters
GET    /api/properties/:id              (public) detail
GET    /api/properties/:id/similar      (public)
POST   /api/properties                  (admin/agent) multipart, triggers email
PATCH  /api/properties/:id              (admin/agent)
DELETE /api/properties/:id              (admin/agent)
PATCH  /api/properties/:id/featured     (admin/agent)

GET    /api/events/public               (public) all active events
GET    /api/events/popup                (public) latest active popup event
GET    /api/events                      (admin)
POST   /api/events                      (admin) multipart (optional image)
PATCH  /api/events/:id                  (admin)
PATCH  /api/events/:id/toggle           (admin)
DELETE /api/events/:id                  (admin)
```

---

## License

Proprietary — Telvine Realty.
