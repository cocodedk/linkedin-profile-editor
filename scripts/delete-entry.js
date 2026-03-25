// delete-entry.js — run as 3 sequential evaluate calls
// Deletes an experience entry. There is no delete URL — must go through edit form.

// STEP 1: Navigate to edit form
((username, entryId) => {
  window.location.href = `https://www.linkedin.com/in/${username}/details/experience/edit/forms/${entryId}/`;
  return `navigating to edit ${entryId}`;
})('USERNAME', 'ENTRY_ID')

// ---- Wait for dialog to open ----

// STEP 2: Click the Delete button in the edit form
(() => {
  const dialog = document.querySelector('dialog');
  if (!dialog) return 'ERROR: No dialog open';
  const deleteBtn = Array.from(dialog.querySelectorAll('button'))
    .find(b => b.textContent.trim() === 'Delete');
  if (deleteBtn) { deleteBtn.click(); return 'clicked Delete — confirmation dialog should appear'; }
  return 'ERROR: Delete button not found — available buttons: ' +
    Array.from(dialog.querySelectorAll('button')).map(b => `"${b.textContent.trim()}"`).join(', ');
})()

// ---- Wait for confirmation dialog ----

// STEP 3: Confirm deletion
(() => {
  const allButtons = Array.from(document.querySelectorAll('button'));
  const confirmBtn = allButtons.find(b => b.textContent.trim() === 'Delete');
  if (confirmBtn) { confirmBtn.click(); return 'confirmed — URL should return to /details/experience/'; }
  return 'ERROR: Confirm button not found — buttons: ' + allButtons.map(b => `"${b.textContent.trim()}"`).filter(Boolean).join(', ');
})()
