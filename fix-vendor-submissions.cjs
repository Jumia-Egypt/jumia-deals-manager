const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(
  "menuItems.push({ id: 'admin', label: 'Admin Tools', icon: Settings });",
  "menuItems.push({ id: 'admin', label: 'Admin Tools', icon: Settings });\n    menuItems.push({ id: 'submissions', label: 'Vendors\\' Submissions', icon: Tag });"
);

fs.writeFileSync('src/components/Layout.tsx', code);
