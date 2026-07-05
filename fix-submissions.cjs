const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<h2 className="text-xl font-bold text-slate-800 mb-2">My Submissions</h2>',
  '<h2 className="text-xl font-bold text-slate-800 mb-2">{userRole === "admin" ? "Vendors\' Submissions" : "My Submissions"}</h2>'
);

code = code.replace(
  '<p className="text-slate-500">You have no active submissions at this time.</p>',
  '<p className="text-slate-500">{userRole === "admin" ? "No vendors have submitted SKUs yet." : "You have no active submissions at this time."}</p>'
);

fs.writeFileSync('src/App.tsx', code);
