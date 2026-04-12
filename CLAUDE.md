# CLAUDE.md — LinkedIn Profile Editor

## Project Overview

A Claude Code skill for automating LinkedIn profile edits via browser-use MCP and Playwright MCP. Automates adding/editing experience entries, skills, open-to-work settings, and deleting entries on LinkedIn's React SPA.

- **Language / Runtime**: JavaScript (helper scripts), Markdown (skill definition)
- **Framework**: N/A — browser automation skill
- **Architecture**: Skill file + helper scripts + GitHub Pages site
- **MCP Tools**: browser-use MCP (primary), Playwright MCP (form filling fallback)

---

## Required Skills — ALWAYS Invoke These

These skills **must** be invoked when the relevant situation arises. Never skip them.

| Situation | Skill |
|-----------|-------|
| Before any new feature or screen | `superpowers:brainstorming` |
| Planning multi-step changes | `superpowers:writing-plans` |
| Writing or fixing core logic | `superpowers:test-driven-development` |
| First sign of a bug or failure | `superpowers:systematic-debugging` |
| Before completing a feature branch | `superpowers:requesting-code-review` |
| Before claiming any task done | `superpowers:verification-before-completion` |
| Working on UI / frontend | `frontend-design:frontend-design` |
| After implementing — reviewing quality | `simplify` |

---

## Architecture

```
linkedin-profile-editor/
├── SKILL.md          <- Skill definition (primary product)
├── scripts/          <- JavaScript helpers for browser automation
│   ├── add-skill.js
│   ├── fill-position-form.js
│   ├── navigate-to-edit.js
│   └── ...
├── website/          <- GitHub Pages site
│   ├── index.html
│   └── styles.css
└── CLAUDE.md         <- This file
```

### Layer Rules
- `SKILL.md` is the source of truth for automation behavior
- `scripts/` are reusable browser automation helpers — keep each under 50 lines
- LinkedIn is a React SPA — always wait for React state to settle after interactions

---

## Coding Conventions

- [ ] All models are **immutable** — use `copy()` / spread for mutations
- [ ] Functions are **pure** where possible — no hidden side effects
- [ ] State is a single source of truth per feature
- [ ] No hardcoded strings — use constants, config, or i18n resources

---

## Engineering Principles

### File Size
- **200-line maximum per file** — extract a class, function, or module when approaching the limit

### DRY · SOLID · KISS · YAGNI
- Extract shared logic into named utilities; never copy-paste
- Single Responsibility: one class/function does one thing
- Don't add features not yet needed
- Delete dead code immediately

### TDD
- Write the failing test first, make it pass, then refactor
- Test names describe behaviour: `"should reject duplicate email"`
- One assertion per test — keep tests focused and readable

### Commit hygiene
- Follow Conventional Commits: `feat: ...` / `fix: ...` / `chore: ...`
- The `commit-msg` hook enforces this automatically

---

## Build Commands

```bash
# Install git hooks
./scripts/install-hooks.sh

# No build step — this is a skill/automation repo
```

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — project conventions and session startup |
| `SKILL.md` | LinkedIn automation skill definition |
| `version.txt` | Semantic version (MAJOR.MINOR.PATCH) |
| `.github/workflows/` | CI, release, and Pages automation |
| `.githooks/` | Pre-commit and commit-msg hooks |
| `scripts/install-hooks.sh` | One-time hook installer |

---

## Starting a New Session

1. Read this file
2. Read `SKILL.md` to understand current automation capabilities
3. Invoke `superpowers:brainstorming` before touching any feature
4. Follow the Required Skills table — every skill is mandatory, not optional
