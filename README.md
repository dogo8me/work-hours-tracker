# Work Hours Tracker

A clean, dark-mode time tracker for logging work hours and earnings. Clock in/out, edit past entries, and export timesheets as CSV spreadsheets.

## Features

- **Clock in / out** with live timer and session earnings
- **Set hourly rate** — earnings calculated automatically
- **Dashboard stats** — total hours, total earnings, avg hours/day, today, this week, work streak, longest session
- **7-day chart** — visual breakdown of recent hours
- **Edit & delete** past entries, or add manual entries
- **Import / export CSV** — works with Excel, Google Sheets, etc.
- **Local storage** — data stays in your browser, no account needed

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to GitHub Pages

1. Create a repo named `work-hours-tracker` on GitHub
2. Push this project:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/work-hours-tracker.git
git push -u origin main
```

3. In repo **Settings → Pages**, set source to **GitHub Actions**
4. The workflow deploys automatically on push to `main`

Your site will be at: `https://YOUR_USERNAME.github.io/work-hours-tracker/`

> If your repo has a different name, update `base` in `vite.config.ts` to match.

## CSV Format

| Date | Start | End | Hours | Rate | Earnings | Notes |
|------|-------|-----|-------|------|----------|-------|
| 2026-06-17 | 09:00 | 17:30 | 8.50 | 15.00 | 127.50 | Project work |

Export produces this format. Import accepts the same columns.

## Manual Deploy

```bash
GITHUB_PAGES=true npm run build
npx gh-pages -d dist
```

Or use `npm run deploy` (requires `gh-pages` package).
