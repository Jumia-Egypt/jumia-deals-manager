const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /onLogout=\{\(\) => \{\s*setIsLoggedIn\(false\);\s*setUserRole\(null\);\s*\}\}/,
  `onLogout={() => {
      setIsLoggedIn(false);
      setUserRole(null);
      setActiveTab('calendar');
    }}`
);
fs.writeFileSync('src/App.tsx', code);
