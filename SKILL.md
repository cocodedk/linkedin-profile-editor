---
name: linkedin-profile-editor
description: Use when automating LinkedIn profile edits via browser-use MCP + Playwright MCP - adding/editing experience entries, skills, open-to-work settings, or deleting entries. LinkedIn is a React SPA with specific navigation and form-filling quirks that break standard Playwright patterns.
---

# LinkedIn Profile Editor

## Overview

LinkedIn is a React SPA. This skill uses **two MCP servers** with distinct responsibilities:

- **browser-use MCP** — primary driver for navigation, page state, clicking, scrolling, screenshots, and AI-powered content extraction
- **Playwright MCP** — used exclusively for `browser_evaluate` to inject React synthetic events (form filling)

Plain DOM manipulation (`.value =`) is ignored by React — all form inputs require `nativeInputValueSetter` + synthetic events via the scripts in `scripts/`.

**All form-filling scripts are in `scripts/`. Read the file, substitute the UPPERCASE placeholders, then pass to `browser_evaluate` (Playwright MCP).**

**CRITICAL: Always use the scripts for form fields. Never write equivalent logic inline.**

---

## MCP Tool Reference

| Tool | MCP Server | Use for |
|---|---|---|
| `browser_navigate` | **browser-use** | All URL navigation |
| `browser_get_state` | **browser-use** | Get element indices, page structure |
| `browser_click` | **browser-use** | Click buttons/links by element index |
| `browser_type` | **browser-use** | Type into inputs by element index |
| `browser_scroll` | **browser-use** | Scroll page or dialog |
| `browser_screenshot` | **browser-use** | Take screenshots |
| `browser_extract_content` | **browser-use** | AI-powered content extraction |
| `retry_with_browser_use_agent` | **browser-use** | Last resort — AI agent fallback for stuck flows |
| `browser_evaluate` | **Playwright** | Run JS scripts for React form filling |

> **Note:** Both servers share some tool names (e.g. `browser_navigate`). Always use the **browser-use** version unless explicitly noted.

---

## Core Rules

1. **Use browser-use `browser_navigate` for ALL navigation** — it handles LinkedIn redirects correctly
2. **NEVER set input values without dispatching React events** — React ignores plain `.value =` without `input`/`change` events
3. **Use `browser_get_state` before every `browser_click`** — element indices change after DOM mutations (dialog open/close, typeahead appearing)
4. **Scripts use arrow function pattern**: `() => { const param = 'VALUE'; ... }` — substitute `'VALUE'` before running. Do NOT use IIFE `((p) => {})(val)` — `browser_evaluate` requires a plain `() => {}` wrapper.

---

## Scripts (Playwright `browser_evaluate` only)

| Script | Purpose | Params |
|---|---|---|
| `inspect-dialog.js` | Show all fields, IDs, values, buttons in open dialog | none |
| `fill-position-form.js` | Fill title, employment type, checkbox, description | `TITLE`, `EMPLOYMENT_TYPE`, `currentlyWorking`, `DESCRIPTION` |
| `fill-company-typeahead.js` | Type company name + wait + select from suggestions (3 steps) | `COMPANY_NAME` |
| `fill-dates.js` | Set start and end date selects | `START_MONTH`, `START_YEAR`, `END_MONTH`, `END_YEAR` |
| `add-skill.js` | Add one skill to entry (run once per skill) | `SKILL_NAME` |
| `delete-entry.js` step 2+3 | Click Delete + confirm (step 1 replaced by `browser_navigate`) | `USERNAME`, `ENTRY_ID` |

> `navigate-to-edit.js`, `open-add-position.js` step 1, and `save.js` are **replaced by browser-use MCP tools** — see workflows below.

---

## Workflow: Add New Experience Entry

```
1. browser_navigate        → https://www.linkedin.com/in/USERNAME/details/experience/
2. browser_get_state       → find the + button ("Add a position or career break")
3. browser_click           → click the + button
4. browser_get_state       → find "Add position" menu item
5. browser_click           → click "Add position"
6. browser_evaluate        → inspect-dialog.js (verify dialog opened, note field IDs)
7. browser_evaluate        → fill-position-form.js
8. browser_evaluate        → fill-company-typeahead.js step 1
   browser_get_state       → check for suggestions (wait 1-2s if none)
   browser_evaluate        → fill-company-typeahead.js step 2 (check suggestions)
   browser_evaluate        → fill-company-typeahead.js step 3 (click match)
9. browser_evaluate        → fill-dates.js
10. browser_get_state      → find "Save" button index
    browser_click          → click Save
11. browser_evaluate       → add-skill.js × N (one per skill)
```

## Workflow: Edit Existing Entry

```
1. browser_navigate        → https://www.linkedin.com/in/USERNAME/details/experience/edit/forms/ENTRY_ID/
2. browser_evaluate        → inspect-dialog.js (verify + check field IDs)
3. browser_evaluate        → fill-position-form.js / fill-dates.js / etc. as needed
4. browser_get_state       → find "Save" button index
   browser_click           → click Save
```

## Workflow: Delete Entry

```
1. browser_navigate        → https://www.linkedin.com/in/USERNAME/details/experience/edit/forms/ENTRY_ID/
2. browser_evaluate        → delete-entry.js step 2  (click Delete button)
3. browser_evaluate        → delete-entry.js step 3  (confirm)
   → URL returns to /details/experience/ on success
```

---

## Finding Entry IDs

Use `browser_navigate` to the experience page, then `browser_extract_content` with query `"all experience entry edit URLs"` — or run this via `browser_evaluate`:

```javascript
(() => {
  return Array.from(document.querySelectorAll('a[href*="/edit/forms/"]'))
    .map(l => l.href).join('\n');
})()
```

Or take a `browser_screenshot` — pencil/edit buttons link to the edit form URL containing the ID.

---

## Employment Type Values

LinkedIn uses **numeric** values in the select — pass the number as a string:

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

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using Playwright `browser_navigate` to edit URL → redirect | Use **browser-use** `browser_navigate` instead |
| Input value doesn't stick | Scripts use `nativeInputValueSetter` + React events — make sure you're using the script, not inline `.value =` |
| `browser_click` hits wrong element | Always run `browser_get_state` immediately before clicking — indices shift after DOM changes |
| Company typeahead shows nothing | Wait 1-2s after step 1 before checking suggestions |
| Save button not found | Run `browser_get_state` to get current indices; fall back to `save.js` via `browser_evaluate` if needed |
| Delete URL 404 | LinkedIn has no `/delete/` URL — always go through edit form → Delete button |
| "Add skill" dropdown closes after each pick | This is expected — run `add-skill.js` once per skill |
| Typed skill name into Title field instead of skill input | The dialog has TWO inputs that look similar. Always use `add-skill.js` — it targets `input[placeholder*="Project Management"]` specifically |
| `add-skill.js` says "Add skill button not found" | Scroll down inside the dialog first — use `browser_scroll`. `add-skill.js` handles both cases |
| Skill shows "No results found" under "Currently in your Skills section" | Normal — look under "Additional skills" in the same dropdown |
| Stuck on a complex interaction after multiple attempts | Use `retry_with_browser_use_agent` with a detailed task description as a last resort |
