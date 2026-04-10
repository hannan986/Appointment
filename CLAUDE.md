@AGENTS.md

# AppointEase — Appointment Scheduling App

## Quick Start
```bash
npm run dev          # Start development server at http://localhost:3000
npm run db:seed      # (Re)seed demo data
npm run db:push      # Push schema changes to database
npm run setup        # First-time setup: push schema + seed
```

## Demo Credentials
- **Admin:** admin@demo.com / admin123
- **User:** user@demo.com / user123

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4 (config in globals.css via @theme)
- Prisma v7 + SQLite (better-sqlite3 adapter)
- NextAuth v4 (JWT, credentials)
- Nodemailer (email), node-cron (reminders)

## Important Notes
- Prisma v7: datasource URL is in `prisma.config.ts`, NOT schema.prisma
- Database file: `./dev.db` at project root
- Generated Prisma client: `src/generated/prisma`
- SQLite adapter: `PrismaBetterSqlite3` (camelCase, not SQLite3)
- Email requires configuring `.env` with real SMTP credentials
