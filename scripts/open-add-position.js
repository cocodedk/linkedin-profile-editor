// open-add-position.js — step 1 of 2
// Navigates to experience page. Run step 2 after page loads.

((username) => {
  window.location.href = `https://www.linkedin.com/in/${username}/details/experience/`;
  return 'navigating';
})('USERNAME')

// ---- After page loads, run step 2 ----

// open-add-position-step2.js — step 2 of 2
// Clicks the + button and selects "Add position" from the dropdown.

(() => {
  const addBtn = Array.from(document.querySelectorAll('button'))
    .find(b => b.getAttribute('aria-label') === 'Add a position or career break');
  if (!addBtn) return 'ERROR: + button not found';
  addBtn.click();

  return new Promise(resolve => {
    setTimeout(() => {
      const addPos = Array.from(document.querySelectorAll('li, [role="menuitem"], button'))
        .find(el => el.textContent.trim() === 'Add position');
      if (addPos) { addPos.click(); resolve('opened — URL should end in /edit/forms/new/'); }
      else resolve('ERROR: "Add position" not in dropdown');
    }, 300);
  });
})()
