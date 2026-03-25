// fill-company-typeahead.js — run as 3 sequential evaluate calls
//
// STEP 1: Type into company field

((companyName) => {
  const dialog = document.querySelector('dialog');
  if (!dialog) return 'ERROR: No dialog open';
  const input = Array.from(dialog.querySelectorAll('input')).find(i => i.placeholder?.includes('Microsoft'));
  if (!input) return 'ERROR: Company input not found';
  input.focus();
  input.value = companyName;
  ['input', 'change'].forEach(e => input.dispatchEvent(new Event(e, { bubbles: true })));
  input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  return `typed "${companyName}" — wait 1-2s then run STEP 2`;
})('COMPANY_NAME')

// ---- wait 1-2 seconds ----

// STEP 2: Check suggestions

(() => {
  const opts = Array.from(document.querySelectorAll('[role="option"], [role="listbox"] li'));
  if (!opts.length) return 'No suggestions yet — wait longer or try STEP 1 again';
  return opts.map((o, i) => `[${i}] ${o.textContent.trim().substring(0, 80)}`).join('\n');
})()

// ---- Run STEP 3 after reviewing suggestions ----

// STEP 3: Click matching suggestion

((companyName) => {
  const opts = Array.from(document.querySelectorAll('[role="option"], [role="listbox"] li'));
  const match = opts.find(o => o.textContent.includes(companyName));
  if (match) { match.click(); return `selected: "${match.textContent.trim().substring(0, 80)}"`; }
  return `"${companyName}" not found.\nAvailable:\n` + opts.map(o => o.textContent.trim().substring(0, 60)).join('\n');
})('COMPANY_NAME')
