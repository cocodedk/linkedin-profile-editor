# LinkedIn Profile Editor

An agent skill for editing LinkedIn profiles via browser automation. Install it in [Claude Code](https://claude.ai/code), Codex, or any other agent that supports skills and the [Playwright MCP](https://github.com/microsoft/playwright-mcp) server.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude_Code-D4A27F?style=flat)

**[https://cocodedk.github.io/linkedin-profile-editor/](https://cocodedk.github.io/linkedin-profile-editor/)**

---

## The problem

LinkedIn is a React SPA. Standard Playwright patterns break:

- `browser_navigate` to edit URLs causes redirects or 404s
- Setting `input.value =` directly has no effect — React ignores it
- Form inputs require synthetic events dispatched via `nativeInputValueSetter`
- The company field is a typeahead that needs timed multi-step interaction
- The skill input looks identical to the title input but targets a completely different element

These scripts handle all of that correctly.

---

## Scripts

| Script | Purpose | Parameters |
|---|---|---|
| `inspect-dialog.js` | Show all fields, IDs, values, and buttons in the open dialog | none |
| `navigate-to-edit.js` | Open the edit dialog for an existing entry | `USERNAME`, `ENTRY_ID` |
| `open-add-position.js` | Navigate to experience page and open the Add Position dialog | `USERNAME` |
| `fill-position-form.js` | Fill title, employment type, checkbox, and description | `TITLE`, `EMPLOYMENT_TYPE`, `currentlyWorking`, `DESCRIPTION` |
| `fill-company-typeahead.js` | Type company name and select from suggestions | `COMPANY_NAME` |
| `fill-dates.js` | Set start and end date selects | `START_MONTH`, `START_YEAR`, `END_MONTH`, `END_YEAR` |
| `add-skill.js` | Add one skill to an entry (run once per skill) | `SKILL_NAME` |
| `save.js` | Save the dialog with three fallback strategies | none |
| `delete-entry.js` | Delete an entry via the edit form | `USERNAME`, `ENTRY_ID` |
| `post-company-update.js` | Post a text update to a company page (4 steps) | `COMPANY_ID`, `POST_TEXT` |

---

## How to use

These scripts are designed to run inside `browser_evaluate` in Claude Code with Playwright MCP. Each script is self-contained. You substitute the UPPERCASE placeholder values before running.

**Add a new experience entry:**

```
1. open-add-position.js  (step 1: navigate)
2. open-add-position.js  (step 2: click + → Add position)
3. inspect-dialog.js     (verify dialog opened)
4. fill-position-form.js (title, employment type, description)
5. fill-company-typeahead.js (3 steps with wait between each)
6. fill-dates.js         (start + end dates)
7. save.js
8. add-skill.js × N     (once per skill)
```

**Edit an existing entry:**

```
1. navigate-to-edit.js   (USERNAME + ENTRY_ID)
2. inspect-dialog.js     (verify fields)
3. fill-position-form.js / fill-dates.js / etc.
4. save.js
```

**Delete an entry:**

```
1. delete-entry.js step 1  (navigate to edit form)
2. delete-entry.js step 2  (click Delete)
3. delete-entry.js step 3  (confirm)
```

---

## Finding entry IDs

Run this on the experience page to list all edit URLs with their IDs:

```javascript
(() => {
  return Array.from(document.querySelectorAll('a[href*="/edit/forms/"]'))
    .map(l => l.href).join('\n');
})()
```

Or take a screenshot — the pencil/edit buttons link to URLs that contain the entry ID.

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

1. **Never use `browser_navigate` for LinkedIn edit URLs** — use `browser_evaluate` with `window.location.href =`
2. **Never set input values without dispatching React events** — React ignores plain `.value =` assignments
3. **Scripts use arrow function pattern** `() => { const param = 'VALUE'; ... }` — substitute values before running. Do not use IIFE pattern `((p) => {})(val)` — `browser_evaluate` requires a plain `() => {}` wrapper.

---

## Common mistakes

| Mistake | Fix |
|---|---|
| `browser_navigate` to edit URL → redirect | Use `browser_evaluate` with `window.location.href =` |
| Input value doesn't stick | Scripts use `nativeInputValueSetter` + React events — use the scripts, not inline `.value =` |
| Company typeahead shows nothing | Wait 1-2s after step 1 before running step 2 |
| Save button not found | `save.js` tries three strategies — if all fail, run `inspect-dialog.js` first |
| Delete URL 404 | There is no delete URL — always go through the edit form → Delete button |
| "Add skill" closes after each pick | Expected behavior — run `add-skill.js` once per skill |
| Typed into wrong input | The dialog has two similar-looking inputs. Skill input: `input[placeholder*="Project Management"]`. Title input: `input[placeholder*="Retail"]`. Always use `add-skill.js`. |
| `add-skill.js` says button not found | Scroll down inside the dialog — the skills section is below dates and description |
| Skill shows "No results" under current skills | Normal — look under "Additional skills" in the same dropdown |

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
- [Playwright MCP server](https://github.com/microsoft/playwright-mcp) connected to Claude Code
- A LinkedIn account

---

## License

MIT
