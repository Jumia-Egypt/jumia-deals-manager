const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  'className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded border"',
  'className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-60 overflow-y-auto"'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
