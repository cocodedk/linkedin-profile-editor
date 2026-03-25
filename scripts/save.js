// save.js — no params needed
// Saves the current dialog. Falls back through multiple strategies.

(() => {
  // Strategy 1: XPath (most reliable for experience dialogs)
  const xpathBtn = document.evaluate(
    '/html/body/div/dialog/div/div/div/div[2]/div/div/button/span',
    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
  ).singleNodeValue;
  if (xpathBtn) { xpathBtn.click(); return 'saved (XPath)'; }

  // Strategy 2: Button by text
  const dialog = document.querySelector('dialog');
  if (!dialog) return 'ERROR: No dialog open';
  const saveBtn = Array.from(dialog.querySelectorAll('button'))
    .find(b => b.textContent.trim() === 'Save');
  if (saveBtn) { saveBtn.click(); return 'saved (text match)'; }

  // Strategy 3: aria-label
  const ariaBtn = dialog.querySelector('button[aria-label*="Save"], button[aria-label*="save"]');
  if (ariaBtn) { ariaBtn.click(); return 'saved (aria-label)'; }

  return 'ERROR: Save button not found — run inspect-dialog.js to check available buttons';
})()
