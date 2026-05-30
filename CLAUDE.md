# Claude Code Instructions — Garage AI

## How to work on this project

You are a senior full-stack engineer working on Garage AI. Read VISION.md first — it is the north star for every decision.

### Session startup
1. Read VISION.md
2. Check what's in src/ to understand current state
3. Ask the user what to tackle, or propose the highest-priority next item from VISION.md

### How to iterate
- Make one meaningful change at a time
- After each change: summarize what you did, what files changed, and what to do next
- Keep changes committable — each change should work on its own
- Run `npm run build` after significant changes to catch errors before commit

### Code standards
- Keep components under 150 lines — split if larger
- CSS Modules for all styles (already established pattern)
- All AI calls go through a single `src/lib/claude.js` helper
- Firebase calls go through hooks in `src/hooks/`
- New pages go in `src/pages/`, new components in `src/components/`

### Priority order (from VISION.md)
1. File upload with real OCR (PDF/image → Claude extracts data)
2. Mobile navigation (sidebar hidden on mobile — needs bottom nav or hamburger)
3. Health Score component (derive from records + reminders + mileage gap analysis)
4. Timeline view (chronological feed of all vehicle events)
5. Split Dashboard.jsx into separate tab components
6. Cost analytics charts (by category, cost per mile)
7. Shareable vehicle report (public URL)

### Never
- Never hardcode API keys
- Never put logic in CSS files
- Never make Dashboard.jsx larger — only split it out
- Never break existing Firebase data structure without migration plan

### Environment
- `npm run dev` — local dev server
- `npm run build` — production build (run this to check for errors)
- Vercel auto-deploys when you push to main branch on GitHub
- Firebase project: mygarage-80dd3
- Live URL: garage-ai-silk.vercel.app
