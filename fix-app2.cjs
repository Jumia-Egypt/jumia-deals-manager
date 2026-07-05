const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [userRole, setUserRole] = useState<\'admin\' | \'vendor\' | null>(null);',
  'const [userRole, setUserRole] = useState<\'admin\' | \'vendor\' | null>(null);\n  const [userName, setUserName] = useState(\'\');'
);

code = code.replace(
  '<Login onLogin={(role) => {\n      setIsLoggedIn(true);\n      setUserRole(role);\n      if (role === \'admin\') setActiveTab(\'admin\');\n    }} />',
  `<Login onLogin={(role, name) => {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(name || '');
      if (role === 'admin') setActiveTab('admin');
    }} />`
);

code = code.replace(
  'userRole={userRole}>',
  'userRole={userRole} userName={userName}>'
);

fs.writeFileSync('src/App.tsx', code);
