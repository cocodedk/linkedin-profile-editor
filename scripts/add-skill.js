// add-skill.js — run once per skill to add
// After each run, the input clears. Run again for the next skill.
// PARAM: substitute 'SKILL_NAME' before running
//
// Handles two cases:
//   A) Skill input already visible in dialog (common after scrolling to skills section)
//   B) Need to click "Add skill" button first (input not yet shown)

() => {
  const skillName = 'SKILL_NAME';

  const dialog = document.querySelector('dialog');
  if (!dialog) return 'ERROR: No dialog open';

  // The skill input has placeholder "Skill (ex: Project Management)"
  // DO NOT confuse with title input "Ex: Retail Sales Manager"
  let input = dialog.querySelector('input[placeholder*="Project Management"]');

  if (!input) {
    // Input not visible yet — click "Add skill" to reveal it
    const addBtn = Array.from(dialog.querySelectorAll('button'))
      .find(b => b.textContent.trim() === 'Add skill');
    if (!addBtn) return 'ERROR: "Add skill" button not found and skill input not visible — scroll down in dialog first';
    addBtn.click();
  }

  return new Promise(resolve => {
    setTimeout(() => {
      input = dialog.querySelector('input[placeholder*="Project Management"]');
      if (!input) return resolve('ERROR: skill input not found after clicking Add skill');

      // Type the skill name using React-compatible setter
      const proto = HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, skillName);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();

      // Wait for search results to appear
      setTimeout(() => {
        const opts = Array.from(document.querySelectorAll('[role="option"], li'))
          .filter(o => o.textContent.trim().toLowerCase().includes(skillName.toLowerCase()));
        const match = opts[0];
        if (match) {
          match.click();
          resolve(`added: "${match.textContent.trim().substring(0, 60)}"`);
        } else {
          const available = Array.from(document.querySelectorAll('[role="option"], li'))
            .map(o => o.textContent.trim())
            .filter(t => t.length > 2 && t.length < 80)
            .slice(0, 10);
          resolve(`"${skillName}" not found.\nAvailable:\n` + available.join('\n'));
        }
      }, 800);
    }, 300);
  });
}
