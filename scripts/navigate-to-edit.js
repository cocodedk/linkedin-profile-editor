// navigate-to-edit.js
// Opens the edit dialog for an existing experience entry.
// Replace USERNAME and ENTRY_ID before running.

((username, entryId) => {
  window.location.href = `https://www.linkedin.com/in/${username}/details/experience/edit/forms/${entryId}/`;
  return `navigating to edit ${entryId}`;
})('USERNAME', 'ENTRY_ID')
