// inspect-dialog.js — no params needed
// Run to see all form fields, IDs, and current values in the open dialog.

(() => {
  const dialog = document.querySelector('dialog');
  if (!dialog) return `NO DIALOG\nURL: ${window.location.href}`;

  const heading = dialog.querySelector('h1,h2,h3,[role=heading]')?.textContent?.trim() || '(no heading)';

  const fields = Array.from(dialog.querySelectorAll('input, textarea, select')).map(el => {
    const opts = el.tagName === 'SELECT'
      ? ' options=[' + Array.from(el.options).slice(0,5).map(o => `${o.value}="${o.text}"`).join(', ') + (el.options.length > 5 ? '...' : '') + ']'
      : '';
    return `[${el.tagName.toLowerCase()}] id="${el.id}" type=${el.type||el.tagName.toLowerCase()} placeholder="${el.placeholder||''}" value="${el.value||''}"${opts}`;
  }).join('\n');

  const btns = Array.from(dialog.querySelectorAll('button'))
    .map(b => b.textContent.trim() || b.getAttribute('aria-label') || '').filter(Boolean).join(' | ');

  return `=== "${heading}" ===\nURL: ${window.location.href}\n\nFIELDS:\n${fields}\n\nBUTTONS: ${btns}`;
})()
