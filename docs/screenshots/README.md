# Screenshots

Store GitHub README screenshots in this folder.

## Recommended Files

| File | Page | URL |
|------|------|-----|
| `01-dashboard.png` | Executive Dashboard | `/` |
| `02-ai-intelligence.png` | AI Match Score & Insights | `/candidates/[id]` (candidate with a high match score) |
| `03-job-details.png` | Job Metrics & Pipeline Trend | `/jobs/[id]` |
| `04-pipeline.png` | Kanban Pipeline | `/pipeline` |
| `05-interviews.png` | Interview Calendar | `/interviews` |
| `06-analytics.png` | Recruiter Analytics | `/analytics` |

## Automated Capture

```bash
# 1. Start Docker, the database, and seed data.
docker compose up -d
pnpm db:seed
pnpm dev

# 2. In another terminal, capture screenshots.
pnpm screenshots
```

## Manual Capture Tips

- **Resolution**: 1440x900 or 1280x800 works well in the GitHub README.
- **Login**: `demo@recruitflow.ai` / `demo1234`.
- **AI panel**: Pick a candidate with a high green match percentage from the Candidates list.
- **Notification bell**: Capture the dashboard with unread notifications visible.
- **Browser**: In Chrome DevTools, run `Ctrl+Shift+P`, then choose "Capture full size screenshot".
