# LinkedIn Profile Editor

A **skill + Playwright script library** for editing LinkedIn profiles via browser automation. The skill orchestrates the flow; 10 JS scripts handle React's synthetic event requirements that standard browser automation cannot touch. Uses **Chrome DevTools MCP** as the primary driver and **Playwright MCP** for React form filling. Install in [Claude Code](https://claude.ai/code), Codex, or any agent that supports skills.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chrome DevTools](https://img.shields.io/badge/Chrome_DevTools_MCP-0d0d0d?style=flat&logo=googlechrome&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright_MCP-2EAD33?style=flat&logo=playwright&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude_Code-D4A27F?style=flat)

**[https://cocodedk.github.io/linkedin-profile-editor/](https://cocodedk.github.io/linkedin-profile-editor/)**

---

## Architecture: Two MCP Servers

| Layer | MCP Server | Responsibility |
|---|---|---|
| Navigation, clicks, state, screenshots | **Chrome DevTools MCP** | `navigate_page`, `take_snapshot`, `click`, `evaluate_script`, `take_screenshot` |
| React form filling | **Playwright MCP** | `browser_evaluate` only — runs the JS scripts below |

---

## The problem

LinkedIn is a React SPA. Standard browser automation breaks:

- Setting `input.value =` directly has no effect — React ignores it
- Form inputs require synthetic events dispatched via `nativeInputValueSetter`
- The company field is a typeahead that needs timed multi-step interaction
- The skill input looks identical to the title input but targets a completely different element

Chrome DevTools MCP handles navigation and clicks via the full accessibility tree. The JS scripts handle React's synthetic event requirements.

---

## Scripts (Playwright `browser_evaluate`)

| Script | Purpose | Parameters |
|---|---|---|
| `inspect-dialog.js` | Show all fields, IDs, values, and buttons in the open dialog | none |
| `fill-position-form.js` | Fill title, employment type, checkbox, and description | `TITLE`, `EMPLOYMENT_TYPE`, `currentlyWorking`, `DESCRIPTION` |
| `fill-company-typeahead.js` | Type company name and select from suggestions | `COMPANY_NAME` |
| `fill-dates.js` | Set start and end date selects | `START_MONTH`, `START_YEAR`, `END_MONTH`, `END_YEAR` |
| `add-skill.js` | Add one skill to an entry (run once per skill) | `SKILL_NAME` |
| `delete-entry.js` | Delete an entry via the edit form (steps 2+3) | `USERNAME`, `ENTRY_ID` |
| `post-company-update.js` | Post a text update to a company page (4 steps) | `COMPANY_ID`, `POST_TEXT` |

---

## How to use

**Add a new experience entry:**

```
1. navigate_page           → linkedin.com/in/USERNAME/details/experience/
2. take_snapshot           → find the + button ("Add a position or career break")
3. click                   → click the + button (by UID)
4. take_snapshot           → find "Add position" menu item
5. click                   → click "Add position"
6. evaluate_script         → inspect-dialog.js (verify dialog, note field IDs)
7. evaluate_script         → fill-position-form.js
8. evaluate_script         → fill-company-typeahead.js (3 steps, wait 1-2s between step 1 and 2)
9. evaluate_script         → fill-dates.js
10. take_snapshot          → find "Save" button UID
    click                  → click Save
11. evaluate_script        → add-skill.js × N (once per skill)
```

**Edit an existing entry:**

```
1. navigate_page           → linkedin.com/in/USERNAME/details/experience/edit/forms/ENTRY_ID/
2. evaluate_script         → inspect-dialog.js (verify + check field IDs)
3. evaluate_script         → fill-position-form.js / fill-dates.js / etc.
4. take_snapshot           → find "Save" button UID
   click                   → click Save
```

**Delete an entry:**

```
1. navigate_page           → linkedin.com/in/USERNAME/details/experience/edit/forms/ENTRY_ID/
2. evaluate_script         → delete-entry.js step 2  (click Delete)
3. evaluate_script         → delete-entry.js step 3  (confirm)
```

---

## Finding entry IDs

Use `navigate_page` to the experience page, then `evaluate_script` with this function:

```javascript
(() => {
  return Array.from(document.querySelectorAll('a[href*="/edit/forms/"]'))
    .map(l => l.href).join('\n');
})()
```

Or take a `take_screenshot` — pencil buttons link to URLs that contain the entry ID.

---

## Employment type values

LinkedIn uses numeric values internally. Pass the number as a string:

| Value | Label |
|---|---|
| `2` | Contract |
| `12` | Full-time |
| `11` | Part-time |
| `3` | Self-employed |
| `20` | Freelance |
| `18` | Internship |
| `19` | Apprenticeship |
| `21` | Seasonal |

---

## Core rules

1. **Use Chrome DevTools `navigate_page` for ALL navigation** — it handles LinkedIn redirects correctly
2. **Always run `take_snapshot` before `click`** — element UIDs shift after DOM mutations; never reuse UIDs from previous snapshots
3. **Never set input values without dispatching React events** — React ignores plain `.value =` assignments
4. **Scripts use arrow function pattern** `() => { const param = 'VALUE'; ... }` — substitute values before running. Do not use IIFE pattern.
5. **Accessibility tree provides precise targeting** — `take_snapshot` returns full DOM structure with UIDs, making element location reliable

---

## Common mistakes

| Mistake | Fix |
|---|---|
| Input value doesn't stick | Scripts use `nativeInputValueSetter` + React events — use the scripts, not inline `.value =` |
| `click` hits wrong element | Run `take_snapshot` immediately before clicking — UIDs shift after DOM changes |
| Company typeahead shows nothing | Wait 1-2s after step 1 before checking suggestions |
| Save button not found | Run `take_snapshot` for current UIDs; check button is visible in snapshot |
| Delete URL 404 | There is no delete URL — go through edit form → Delete button |
| "Add skill" closes after each pick | Expected — run `add-skill.js` once per skill |
| Typed into wrong input | Always use `add-skill.js` — targets `input[placeholder*="Project Management"]` specifically |
| `add-skill.js` says button not found | Scroll down — skills section is below dates |
| Skill shows "No results" under current skills | Normal — look under "Additional skills" in the same dropdown |
| Modal file upload won't respond | Target file inputs directly with `evaluate_script` — React modals block standard clicks |
| Stuck after multiple attempts | Use detailed `evaluate_script` with DOM inspection as fallback |

---

## Installation

### Recommended: npx add-skill

Works with Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, Roo, and more:

```sh
npx add-skill cocodedk/linkedin-profile-editor
```

Target a specific agent:

```sh
npx add-skill cocodedk/linkedin-profile-editor --agent claude
npx add-skill cocodedk/linkedin-profile-editor --agent codex
```

### Manual

Copy `SKILL.md` and `scripts/` to your agent's skills directory:

| Agent | Path |
|---|---|
| Claude Code | `~/.claude/skills/linkedin-profile-editor/` |
| Codex | `~/.codex/skills/linkedin-profile-editor/` |
| Others | Check your agent's documentation |

---

## Requirements

- [Claude Code](https://claude.ai/code)
- **Chrome DevTools MCP** — install once in Claude Code:
  ```
  /plugin chrome-devtools-mcp
  ```
- **Playwright MCP** — add to your project's `.mcp.json` (auto-prompted on first run):
  ```json
  {
    "mcpServers": {
      "playwright": {
        "command": "npx",
        "args": ["@playwright/mcp@latest"]
      }
    }
  }
  ```
- A LinkedIn account with Chrome open and logged in

---

## License

MIT
