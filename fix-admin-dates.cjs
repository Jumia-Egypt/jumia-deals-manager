const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const safeDateStr = (val) => {
  try {
    if (!val) return '';
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 16);
    return '';
  } catch {
    return '';
  }
};

const safeToISO = (val, fallback) => {
  try {
    if (!val) return fallback;
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
    return fallback;
  } catch {
    return fallback;
  }
};

// Replace value={new Date(formData.startDate || '').toISOString().slice(0,16)}
code = code.replace(
  /value=\{new Date\(formData\.startDate \|\| ''\)\.toISOString\(\)\.slice\(0,16\)\}/g,
  `value={(() => { try { return formData.startDate ? new Date(formData.startDate).toISOString().slice(0,16) : ''; } catch { return ''; } })()}`
);

code = code.replace(
  /value=\{new Date\(formData\.endDate \|\| ''\)\.toISOString\(\)\.slice\(0,16\)\}/g,
  `value={(() => { try { return formData.endDate ? new Date(formData.endDate).toISOString().slice(0,16) : ''; } catch { return ''; } })()}`
);

code = code.replace(
  /value=\{new Date\(formData\.rules\?\.submissionDeadline \|\| ''\)\.toISOString\(\)\.slice\(0,16\)\}/g,
  `value={(() => { try { return formData.rules?.submissionDeadline ? new Date(formData.rules.submissionDeadline).toISOString().slice(0,16) : ''; } catch { return ''; } })()}`
);

// Replace onChange={e => setFormData({...formData, startDate: new Date(e.target.value).toISOString()})}
code = code.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, startDate: new Date\(e\.target\.value\)\.toISOString\(\)\}\)\}/g,
  `onChange={e => setFormData({...formData, startDate: e.target.value ? new Date(e.target.value).toISOString() : formData.startDate})}`
);

code = code.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, endDate: new Date\(e\.target\.value\)\.toISOString\(\)\}\)\}/g,
  `onChange={e => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : formData.endDate})}`
);

code = code.replace(
  /onChange=\{e => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, submissionDeadline: new Date\(e\.target\.value\)\.toISOString\(\)\}\}\)\}/g,
  `onChange={e => setFormData({...formData, rules: {...formData.rules!, submissionDeadline: e.target.value ? new Date(e.target.value).toISOString() : formData.rules!.submissionDeadline}})}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
