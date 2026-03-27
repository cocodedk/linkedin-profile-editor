# LinkedIn Profile Editor

An agent skill for editing LinkedIn profiles via browser automation. Uses **browser-use MCP** as the primary driver and **Playwright MCP** for React form filling. Install it in [Claude Code](https://claude.ai/code), Codex, or any other agent that supports skills.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![browser-use](https://img.shields.io/badge/browser--use_MCP-0d0d0d?style=flat&logo=googlechrome&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright_MCP-2EAD33?style=flat&logo=playwright&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude_Code-D4A27F?style=flat)

**[https://cocodedk.github.io/linkedin-profile-editor/](https://cocodedk.github.io/linkedin-profile-editor/)**

---

## Architecture: Two MCP Servers

| Layer | MCP Server | Responsibility |
|---|---|---|
| Navigation, clicks, state, screenshots | **browser-use MCP** | `browser_navigate`, `browser_get_state`, `browser_click`, `browser_extract_content`, `retry_with_browser_use_agent` |
| React form filling | **Playwright MCP** | `browser_evaluate` only — runs the JS scripts below |

---

## The problem

LinkedIn is a React SPA. Standard browser automation breaks:

- Setting `input.value =` directly has no effect — React ignores it
- Form inputs require synthetic events dispatched via `nativeInputValueSetter`
- The company field is a typeahead that needs timed multi-step interaction
- The skill input looks identical to the title input but targets a completely different element

browser-use MCP handles navigation and clicks. The JS scripts handle React's synthetic event requirements.

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

> `navigate-to-edit.js`, `open-add-position.js` step 1, and `save.js` are replaced by native browser-use MCP tools.

---

## How to use

**Add a new experience entry:**

```
1. browser_navigate        → linkedin.com/in/USERNAME/details/experience/
2. browser_get_state       → find the + button
3. browser_click           → click the + button
4. browser_get_state       → find "Add position" menu item
5. browser_click           → click "Add position"
6. browser_evaluate        → inspect-dialog.js
7. browser_evaluate        → fill-position-form.js
8. browser_evaluate        → fill-company-typeahead.js (3 steps)
9. browser_evaluate        → fill-dates.js
10. browser_get_state      → find "Save" button index
    browser_click          → click Save
11. browser_evaluate       → add-skill.js × N
```

**Edit an existing entry:**

```
1. browser_navigate        → linkedin.com/in/USERNAME/details/experience/edit/forms/ENTRY_ID/
2. browser_evaluate        → inspect-dialog.js
3. browser_evaluate        → fill-position-form.js / fill-dates.js / etc.
4. browser_get_state       → find "Save" button index
   browser_click           → click Save
```

**Delete an entry:**

```
1. browser_navigate        → linkedin.com/in/USERNAME/details/experience/edit/forms/ENTRY_ID/
2. browser_evaluate        → delete-entry.js step 2  (click Delete)
3. browser_evaluate        → delete-entry.js step 3  (confirm)
```

---

## Finding entry IDs

Use `browser_extract_content` with query `"all experience entry edit URLs"` — or run this via `browser_evaluate`:

```javascript
(() => {
  return Array.from(document.querySelectorAll('a[href*="/edit/forms/"]'))
    .map(l => l.href).join('\n');
})()
```

Or take a `browser_screenshot` — pencil buttons link to URLs that contain the entry ID.

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

1. **Use browser-use `browser_navigate` for ALL navigation** — it handles LinkedIn redirects correctly
2. **Always run `browser_get_state` before `browser_click`** — element indices shift after DOM mutations
3. **Never set input values without dispatching React events** — React ignores plain `.value =` assignments
4. **Scripts use arrow function pattern** `() => { const param = 'VALUE'; ... }` — substitute values before running. Do not use IIFE pattern.

---

## Common mistakes

| Mistake | Fix |
|---|---|
| Using Playwright `browser_navigate` → redirect | Use **browser-use** `browser_navigate` instead |
| Input value doesn't stick | Scripts use `nativeInputValueSetter` + React events — use the scripts, not inline `.value =` |
| `browser_click` hits wrong element | Run `browser_get_state` immediately before clicking — indices shift after DOM changes |
| Company typeahead shows nothing | Wait 1-2s after step 1 before checking suggestions |
| Save button not found | Run `browser_get_state` for current indices; fall back to `save.js` via `browser_evaluate` |
| Delete URL 404 | There is no delete URL — go through edit form → Delete button |
| "Add skill" closes after each pick | Expected — run `add-skill.js` once per skill |
| Typed into wrong input | Always use `add-skill.js` — targets `input[placeholder*="Project Management"]` specifically |
| `add-skill.js` says button not found | Scroll down with `browser_scroll` — skills section is below dates |
| Skill shows "No results" under current skills | Normal — look under "Additional skills" in the same dropdown |
| Stuck after multiple attempts | Use `retry_with_browser_use_agent` with a detailed task description |

---

## Installation

### Recommended: npx add-skill

Works with Claude Code, Codex, Cursor, OpenCode, GitHub Copilot, Roo, and more — installs to all detected agents automatically:

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
- [browser-use MCP](https://github.com/browser-use/browser-use) — register with `claude mcp add --scope user browser-use /path/to/browser-use -- --mcp`
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) connected to Claude Code
- A LinkedIn account

---

## License

MIT
