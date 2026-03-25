// post-company-update.js
// Post a text update to a LinkedIn company page.
//
// Params: COMPANY_ID, POST_TEXT
//
// Steps:
//   Step 1 — navigate to the company admin page
//   Step 2 — click Create → Start a post
//   Step 3 — type the post text
//   Step 4 — submit
//
// Run each step separately with a browser_snapshot in between to verify state.
//
// NOTE: Use browser_navigate (not window.location.href) for the admin dashboard —
// it is not a LinkedIn edit URL, so the redirect rule does not apply here.

// ─── Step 1: Navigate to company admin dashboard ─────────────────────────────
// Run this step with browser_navigate (not browser_evaluate).
// URL: https://www.linkedin.com/company/COMPANY_ID/admin/dashboard/
// Replace COMPANY_ID with your numeric company ID (e.g. 112334547).

// ─── Step 2: Open the post composer ──────────────────────────────────────────
// After step 1, click the "Create" link in the left sidebar (ref changes each
// load — use browser_snapshot to find it), then click "Start a post".
// The post composer dialog will open with a textbox labelled
// "Text editor for creating content".

// ─── Step 3: Fill the post text ──────────────────────────────────────────────
() => {
  const POST_TEXT = 'REPLACE_WITH_YOUR_POST_TEXT';

  // The composer is a contenteditable div wrapped in a textbox role.
  // LinkedIn does NOT use a standard <textarea> — use browser_type targeting
  // the textbox by role, or use this evaluate as a fallback.
  const editor = document.querySelector('[role="textbox"][contenteditable="true"]');
  if (!editor) return 'Editor not found — run browser_snapshot to check state';

  // Focus and set content via execCommand so LinkedIn registers the input.
  editor.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, POST_TEXT);

  return 'Text inserted — verify with browser_snapshot before posting';
}

// ─── Step 4: Submit the post ──────────────────────────────────────────────────
// After verifying the text looks correct, click the Post button:
() => {
  const btn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.trim() === 'Post');
  if (!btn) return 'Post button not found — run browser_snapshot';
  btn.click();
  return 'Posted';
}

// ─── Notes ────────────────────────────────────────────────────────────────────
// - If browser_type is available, prefer it over step 3's evaluate approach:
//     browser_type targeting "Text editor for creating content" textbox
//   This is more reliable and handles newlines correctly.
// - LinkedIn automatically fetches a link preview card when it detects a URL
//   in the post text. No extra steps needed.
// - After posting, the dialog closes and the URL returns to:
//     /company/COMPANY_ID/admin/page-posts/published/
//   A green "Post successful." toast confirms success.
// - Finding your COMPANY_ID: it appears in the admin URL, e.g.
//     https://www.linkedin.com/company/112334547/admin/dashboard/
//                                               ^^^^^^^^^
