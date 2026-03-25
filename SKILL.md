---
name: linkedin-profile-editor
description: Use when automating LinkedIn profile edits via Playwright MCP - adding/editing experience entries, skills, open-to-work settings, or deleting entries. LinkedIn is a React SPA with specific navigation and form-filling quirks that break standard Playwright patterns.
---

# LinkedIn Profile Editor

## Overview

LinkedIn is a React SPA. Standard `browser_navigate` and direct URL navigation cause redirects or 404s. All navigation must use `window.location.href` assignment, and all form inputs require synthetic React events.

**All scripts are in `scripts/`. Read the file, substitute the UPPERCASE placeholders (e.g. replace `'SKILL_NAME'` with `'Test-Driven Development'`), then paste into `browser_evaluate`.**

**CRITICAL: Always use the scripts. Never write equivalent logic inline — inline code risks targeting the wrong input field or missing React event requirements.**

---

## Core Rules

1. **NEVER use `browser_navigate` for LinkedIn edit URLs** — use `browser_evaluate` with `window.location.href = url`
2. **NEVER set input values without dispatching React events** — React ignores plain `.value =` without `input`/`change` events
3. **Scripts use arrow function pattern**: `() => { const param = 'VALUE'; ... }` — substitute `'VALUE'` before running. Do NOT use IIFE `((p) => {})(val)` — `browser_evaluate` requires a plain `() => {}` wrapper.

---

## Scripts

| Script | Purpose | Params |
|---|---|---|
| `inspect-dialog.js` | Show all fields, IDs, values, buttons in open dialog | none |
| `navigate-to-edit.js` | Open edit dialog for existing entry | `USERNAME`, `ENTRY_ID` |
| `open-add-position.js` | Navigate to experience page + open Add Position dialog | `USERNAME` (step 1 only) |
| `fill-position-form.js` | Fill title, employment type, checkbox, description | `TITLE`, `EMPLOYMENT_TYPE`, `currentlyWorking`, `DESCRIPTION` |
| `fill-company-typeahead.js` | Type company name + wait + select from suggestions (3 steps) | `COMPANY_NAME` |
| `fill-dates.js` | Set start and end date selects | `START_MONTH`, `START_YEAR`, `END_MONTH`, `END_YEAR` |
| `add-skill.js` | Add one skill to entry (run once per skill) | `SKILL_NAME` |
| `save.js` | Save dialog (3 fallback strategies) | none |
| `delete-entry.js` | Delete an entry (3 steps: navigate, click delete, confirm) | `USERNAME`, `ENTRY_ID` |

---

## Workflow: Add New Experience Entry

```
1. open-add-position.js step 1  (navigate)
2. open-add-position.js step 2  (click + → Add position)
3. inspect-dialog.js            (verify dialog opened, note field IDs)
4. fill-position-form.js        (title, employment type, description)
5. fill-company-typeahead.js    (3 steps with wait between each)
6. fill-dates.js                (start + end dates)
7. save.js
8. add-skill.js × N            (one per skill, re-run for each)
```

## Workflow: Edit Existing Entry

```
1. navigate-to-edit.js          (USERNAME + ENTRY_ID)
2. inspect-dialog.js            (verify + check field IDs)
3. fill-position-form.js / fill-dates.js / etc. as needed
4. save.js
```

## Workflow: Delete Entry

```
1. delete-entry.js step 1       (navigate to edit form)
2. delete-entry.js step 2       (click Delete)
3. delete-entry.js step 3       (confirm)
   → URL returns to /details/experience/ on success
```

---

## Finding Entry IDs

```javascript
// Run on the experience page to list all entry edit URLs
(() => {
  return Array.from(document.querySelectorAll('a[href*="/edit/forms/"]'))
    .map(l => l.href).join('\n');
})()
```

Or take a screenshot — pencil/edit buttons link to the edit form URL containing the ID.

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
| `browser_navigate` to edit URL → redirect | Use `browser_evaluate` with `window.location.href =` |
| Input value doesn't stick | Scripts use `nativeInputValueSetter` + React events — make sure you're using the script, not inline `.value =` |
| Company typeahead shows nothing | Wait 1-2s after step 1 before running step 2 |
| Save button not found | `save.js` tries XPath first — if that fails too, run `inspect-dialog.js` and find the button manually |
| Delete URL 404 | LinkedIn has no `/delete/` URL — always go through edit form → Delete button |
| "Add skill" dropdown closes after each pick | This is expected — run `add-skill.js` once per skill |
| Ad Options dialog opens instead of experience dialog | Clicked wrong button — run `open-add-position.js` step 2 again |
| Typed skill name into Title field instead of skill input | The dialog has TWO inputs that look similar. Skill input placeholder: `"Skill (ex: Project Management)"`. Title input placeholder: `"Ex: Retail Sales Manager"`. Always use `add-skill.js` — it targets `input[placeholder*="Project Management"]` specifically. Never write inline skill-input logic. |
| `add-skill.js` says "Add skill button not found" | Scroll down inside the dialog first — the skills section is below the dates/description. The skill input may already be visible without needing the button. `add-skill.js` handles both cases. |
| Skill shows "No results found" under "Currently in your Skills section" | Normal — look under "Additional skills" in the same dropdown. LinkedIn separates profile skills from new additions. |
