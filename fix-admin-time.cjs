const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const toLocalISOString = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

// Insert toLocalISOString function
code = code.replace(
  /export function AdminDashboard\(\) \{/,
  `const toLocalISOString = (dateInput: string | Date | undefined) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

export function AdminDashboard() {`
);

// Replace the usages of value={(() => { try { return formData.startDate ? new Date(formData.startDate).toISOString().slice(0,16) : ''; } catch { return ''; } })()}
code = code.replace(
  /value=\{[\s\S]*?formData\.startDate[\s\S]*?\}/g,
  `value={toLocalISOString(formData.startDate)}`
);

code = code.replace(
  /value=\{[\s\S]*?formData\.endDate[\s\S]*?\}/g,
  `value={toLocalISOString(formData.endDate)}`
);

code = code.replace(
  /value=\{[\s\S]*?formData\.rules\?\.submissionDeadline[\s\S]*?\}/g,
  `value={toLocalISOString(formData.rules?.submissionDeadline)}`
);

// For the onChange handlers, we can just save the value string directly, as it's in YYYY-MM-DDTHH:mm format, or we can convert it to a full ISO string representing that local time. If we just save the local time string, it might be interpreted as local time anyway. Wait, new Date("2026-07-03T19:00").toISOString() will give the UTC representation of that local time. Let's do that!
code = code.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, startDate: e\.target\.value \? new Date\(e\.target\.value\)\.toISOString\(\) : formData\.startDate\}\)\}/g,
  `onChange={e => setFormData({...formData, startDate: e.target.value ? new Date(e.target.value).toISOString() : formData.startDate})}`
);

code = code.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, endDate: e\.target\.value \? new Date\(e\.target\.value\)\.toISOString\(\) : formData\.endDate\}\)\}/g,
  `onChange={e => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : formData.endDate})}`
);

code = code.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, submissionDeadline: e\.target\.value \? new Date\(e\.target\.value\)\.toISOString\(\) : formData\.rules!\.submissionDeadline\}\}\)\}/g,
  `onChange={e => setFormData({...formData, rules: {...formData.rules!, submissionDeadline: e.target.value ? new Date(e.target.value).toISOString() : formData.rules!.submissionDeadline}})}`
);


fs.writeFileSync('src/components/AdminDashboard.tsx', code);
