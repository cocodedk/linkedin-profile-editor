# Contributing to LinkedIn Profile Editor

## Local Setup
1. Install Claude Code with MCP configured (browser-use MCP + Playwright MCP).
2. Clone the repository.
3. Install Git hooks (see below).

## Install Git Hooks
```sh
./scripts/install-hooks.sh
```

## Local Git Setup
Run these once after cloning:
```bash
git config pull.rebase true
git config core.autocrlf input
git config push.autoSetupRemote true
git config init.defaultBranch main
```

## What Belongs Here

This repository contains a Claude Code skill for automating LinkedIn profile edits via browser automation. Changes fall into:

1. **Skill content** — `SKILL.md` — the Markdown instructions defining automation behavior.
2. **Helper scripts** — `scripts/` — JavaScript automation helpers for browser-use/Playwright MCP.
3. **Website** — `website/` — GitHub Pages site documenting the skill.

## Coding Style
- Keep files small and focused — 200-line maximum
- Follow Conventional Commits for all commit messages

## PR Checklist
- [ ] Smoke check passes
- [ ] Manual test: invoke the skill on LinkedIn and verify behavior
- [ ] Updated SKILL.md if behavior changed
- [ ] Updated README.md if public-facing behavior changed

## Branch Naming Conventions

| Branch prefix | Conventional Commit type | Example |
|---|---|---|
| `feature/` | `feat:` | `feature/add-open-to-work` |
| `fix/` | `fix:` | `fix/react-form-typeahead` |
| `chore/` | `chore:` | `chore/update-dependencies` |
| `docs/` | `docs:` | `docs/update-usage-guide` |
| `refactor/` | `refactor:` | `refactor/simplify-navigation` |
| `ci/` | `ci:` | `ci/pin-action-shas` |

Branch names use **kebab-case**. Never commit directly to `master` — always open a PR.
