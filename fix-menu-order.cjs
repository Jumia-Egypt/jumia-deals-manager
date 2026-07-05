const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(
  `const menuItems = [
    { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
  ];
  if (userRole === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Tools', icon: Settings });
    menuItems.push({ id: 'submissions', label: 'Vendors\\' Submissions', icon: Tag });
  } else {
    menuItems.push({ id: 'submissions', label: 'My Submissions', icon: Tag });
  }`,
  `let menuItems = [];
  if (userRole === 'admin') {
    menuItems = [
      { id: 'admin', label: 'Admin Tools', icon: Settings },
      { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
      { id: 'submissions', label: 'Vendors\\' Submissions', icon: Tag }
    ];
  } else {
    menuItems = [
      { id: 'calendar', label: 'Campaign Calendar', icon: Calendar },
      { id: 'submissions', label: 'My Submissions', icon: Tag }
    ];
  }`
);

fs.writeFileSync('src/components/Layout.tsx', code);
