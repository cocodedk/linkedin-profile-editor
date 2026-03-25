// fill-position-form.js
// Fills title, employment type, currently-working checkbox, and description.
// Run fill-company-typeahead.js and fill-dates.js separately (they need timing).
//
// PARAMS: title, employmentType, currentlyWorking, description

((title, employmentType, currentlyWorking, description) => {
  const dialog = document.querySelector('dialog');
  if (!dialog) return 'ERROR: No dialog open';

  function setInput(el, value) {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const results = [];
  const inputs = Array.from(dialog.querySelectorAll('input, textarea, select'));

  // Title
  const titleEl = inputs.find(i => i.placeholder?.includes('Retail'));
  if (titleEl) { setInput(titleEl, title); results.push(`title: "${title}"`); }
  else results.push('WARN: title field not found');

  // Employment type — LinkedIn uses numeric IDs: 2=Contract, 12=Full-time, 11=Part-time, 3=Self-employed, 20=Freelance, 18=Internship
  // employmentType param should be the numeric string value, e.g. '2' for Contract
  const empEl = inputs.find(i => i.tagName === 'SELECT' && Array.from(i.options).some(o => o.text === 'Full-time' || o.text === 'Contract'));
  if (empEl) { empEl.value = employmentType; empEl.dispatchEvent(new Event('change', { bubbles: true })); results.push(`employment: ${employmentType} (${Array.from(empEl.options).find(o=>o.value===employmentType)?.text||'unknown'})`); }
  else results.push('WARN: employment type select not found');

  // Currently working checkbox
  const cb = dialog.querySelector('input[type="checkbox"]');
  if (cb && cb.checked !== currentlyWorking) { cb.click(); results.push(`currently working: ${currentlyWorking}`); }

  // Description
  const textarea = dialog.querySelector('textarea');
  if (textarea) { setInput(textarea, description); results.push('description: filled'); }
  else results.push('WARN: textarea not found');

  return results.join('\n') + '\n\nNext: fill-company-typeahead.js, then fill-dates.js, then save.js';
})(
  'TITLE',           // e.g. 'GRC Consultant'
  'CONTRACT',        // FULL_TIME | PART_TIME | CONTRACT | FREELANCE | SELF_EMPLOYED
  false,             // true = currently working (hides end date)
  'DESCRIPTION'      // multi-line ok
)
