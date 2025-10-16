# Deployment Guide: Vercel + TiDB

This document walks you through deploying this Next.js app to Vercel backed by TiDB Cloud.

## 1) Prerequisites
- Vercel account and the Vercel CLI (optional)
- TiDB Cloud (Serverless or Dedicated) with a MySQL user/password
- Your app repository (GitHub/GitLab/Bitbucket) connected to Vercel

## 2) Environment variables
Set these in Vercel Project Settings → Environment Variables (Production):

- JWT_SECRET: a long random string (32+ chars)
- DATABASE_URL: your TiDB Cloud connection string, for example:
  mysql://<user>:<password>@<host>:4000/Bus-system?ssl={"rejectUnauthorized":true}&timezone=Z

Notes:
- The database name here matches the app default: `Bus-system`
- Ensure SSL is enabled with rejectUnauthorized to true for TiDB Cloud
- timezone=Z ensures UTC time inside the pool

Optional variables:
- DB_POOL_SIZE: e.g. 5–10
- DB_PREFER_LOCAL: not needed in production (defaults to remote). In dev, set to true to force local XAMPP.

## 3) First deploy
- Push your repository and import it in Vercel.
- Set the environment variables as above.
- Trigger a deploy.

## 4) Initialize the database schema
After the first successful deploy, run the init endpoint once to create all tables:
- GET https://<your-vercel-domain>/api/init
- Optionally seed example data: https://<your-vercel-domain>/api/init?seed=1

The init route is idempotent and safe to call multiple times.

## 5) Health check
Open https://<your-vercel-domain>/api/health — you should see:
{
  "status": "ok",
  "db": true,
  "jwtConfigured": true
}
If `jwtConfigured` is false or you get 500, set JWT_SECRET in Vercel.

## 6) Assets (route PDFs)
In production (Vercel), route PDF uploads are stored in Vercel Blob automatically (no extra setup). In development, they are saved to `public/route-pdfs`.

## 7) Production notes
- Admin/dev bypass logins should be disabled in production (keep using real accounts).
- The app relies on JWT_SECRET. Never deploy without it.
- The `/api/init` route provides schema migrations (create-if-missing). For destructive schema changes, plan migrations carefully.

## 8) Local development vs production
- Local dev: defaults to XAMPP MySQL (localhost, root, no password) and ignores TiDB unless `DB_PREFER_LOCAL` is set otherwise.
- Production: defaults to using `DATABASE_URL` with SSL (TiDB Cloud) when set.

---
Happy shipping! If you need a one-time admin bootstrap route or a safer migration flow, add an internal-only endpoint guarded via a secret header in Vercel.
