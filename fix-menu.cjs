const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(
  "const menuItems = [\n    { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },\n    { id: 'submissions', label: 'My Submissions', icon: Tag },\n  ];\n\n  if (userRole === 'admin') {\n    menuItems.push({ id: 'admin', label: 'Admin Tools', icon: Settings });\n    menuItems.push({ id: 'submissions', label: 'Vendors\\' Submissions', icon: Tag });\n  }",
  `const menuItems = [
    { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
  ];
  if (userRole === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Tools', icon: Settings });
    menuItems.push({ id: 'submissions', label: 'Vendors\\' Submissions', icon: Tag });
  } else {
    menuItems.push({ id: 'submissions', label: 'My Submissions', icon: Tag });
  }`
);

code = code.replace(
  '<span className="font-bold text-xl tracking-tight text-slate-900">Vendor Portal</span>',
  '<span className="font-bold text-xl tracking-tight text-slate-900">{userRole === "admin" ? "Admin Portal" : "Vendor Portal"}</span>'
);

fs.writeFileSync('src/components/Layout.tsx', code);
