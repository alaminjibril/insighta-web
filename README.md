# Insighta Web Portal

A React web portal for the Insighta Labs+ Profile Intelligence System. Browse, search, filter, and export profiles through a clean browser interface.

## Live URL

```
https://insighta-web-theta.vercel.app
```

## Tech Stack

- React + Vite
- React Router v6
- Axios
- Tailwind CSS
- Deployed on Vercel

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | / | GitHub OAuth login button |
| Auth Callback | /auth/callback | Captures and stores tokens |
| Dashboard | /dashboard | Stats overview |
| Profiles | /profiles | List, filter, search, export |
| Profile Detail | /profiles/:id | Single profile view |
| Account | /account | Current user info |

## Authentication Flow

1. User visits `https://insighta-web-theta.vercel.app`
2. Clicks **"Login with GitHub"**
3. Redirected to backend `/auth/github`
4. GitHub handles OAuth authorization
5. Backend redirects to `/auth/callback?access_token=...&refresh_token=...`
6. Tokens extracted from URL and stored in React Context
7. URL cleared of tokens using `history.replaceState`
8. User redirected to `/dashboard`

## Token Handling

- Tokens stored in **React Context** (memory only — not localStorage)
- Axios interceptor automatically attaches:
  - `Authorization: Bearer <access_token>`
  - `X-API-Version: 1`
- On 401 response: interceptor auto-refreshes tokens silently
- On refresh failure: user redirected to login page

## Role-Based UI

| Feature | Admin | Analyst |
|---------|-------|---------|
| View profiles | ✅ | ✅ |
| Search profiles | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Create profile | ✅ | ❌ |
| Delete profile | ✅ | ❌ |

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/alaminjibril/insighta-web
cd insighta-web
npm install
```

### 2. Create `.env` file

```
VITE_API_URL=https://insighta-backend-production-301c.up.railway.app
```

### 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment — Vercel

1. Push code to GitHub
2. Go to Vercel → New Project → Import from GitHub
3. Select `insighta-web` repo
4. Add environment variable:
```
   VITE_API_URL=https://insighta-backend-production-301c.up.railway.app
```
5. Deploy
6. After deploying, update `FRONTEND_URL` in Railway backend variables to your Vercel URL

## System Architecture

```
insighta-web (Vercel)
       │
       ▼
insighta-backend (Railway) ──► MongoDB Atlas
       ▲
insighta-cli (local)
```

All three interfaces share the same backend and the same database. Data is consistent across all interfaces in real time.
