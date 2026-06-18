# Screenshots

GitHub README용 스크린샷을 이 폴더에 저장합니다.

## 권장 파일명

| 파일 | 페이지 | URL |
|------|--------|-----|
| `01-dashboard.png` | Executive Dashboard | `/` |
| `02-ai-intelligence.png` | AI Match Score & Insights | `/candidates/[id]` (높은 match score 후보) |
| `03-job-details.png` | Job Metrics & Pipeline Trend | `/jobs/[id]` |
| `04-pipeline.png` | Kanban Pipeline | `/pipeline` |
| `05-interviews.png` | Interview Calendar | `/interviews` |
| `06-analytics.png` | Recruiter Analytics | `/analytics` |

## 자동 캡처

```bash
# 1. Docker + DB + 시드
docker compose up -d
pnpm db:seed
pnpm dev

# 2. 다른 터미널에서
pnpm screenshots
```

## 수동 캡처 팁

- **해상도**: 1440×900 또는 1280×800 (GitHub README에 잘 맞음)
- **로그인**: `demo@recruitflow.ai` / `demo1234`
- **AI 패널**: Candidates 목록에서 match %가 높은(녹색) 후보 선택
- **알림 벨**: 대시보드에서 unread 알림이 보이도록 캡처
- **브라우저**: Chrome DevTools → `Ctrl+Shift+P` → "Capture full size screenshot"
