const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /className="border p-2 rounded w-full"/g,
  'className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm text-sm"'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
