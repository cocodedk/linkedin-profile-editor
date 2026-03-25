// fill-dates.js
// Sets start and optional end date selects.
// PARAMS: startMonth, startYear, endMonth, endYear ('' to skip end date)

((startMonth, startYear, endMonth, endYear) => {
  const dialog = document.querySelector('dialog');
  if (!dialog) return 'ERROR: No dialog open';

  const selects = Array.from(dialog.querySelectorAll('select'));
  const yearSelects = selects.filter(s => Array.from(s.options).some(o => /^\d{4}$/.test(o.value)));
  const monthSelects = selects.filter(s => Array.from(s.options).some(o => /^([1-9]|1[0-2])$/.test(o.value)));
  const results = [];

  function setSelect(el, value, label) {
    if (!el) { results.push(`WARN: ${label} not found`); return; }
    const opt = Array.from(el.options).find(o => o.value === String(value));
    if (!opt) { results.push(`WARN: ${label} value "${value}" not found. Options: ${Array.from(el.options).slice(0,6).map(o=>o.value).join(',')}`); return; }
    el.value = opt.value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    results.push(`${label}: ${opt.text}`);
  }

  setSelect(monthSelects[0], startMonth, 'start month');
  setSelect(yearSelects[0], startYear, 'start year');

  if (endMonth && endYear) {
    setSelect(monthSelects[1], endMonth, 'end month');
    setSelect(yearSelects[1], endYear, 'end year');
  }

  return results.join('\n');
})(
  'START_MONTH',  // '1'=Jan ... '12'=Dec
  'START_YEAR',   // e.g. '2024'
  'END_MONTH',    // '' to skip (currently working)
  'END_YEAR'      // '' to skip
)
