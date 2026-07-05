const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/const FormContent = \(\) => \(/g, "const renderFormContent = () => (");
code = code.replace(/<FormContent \/>/g, "{renderFormContent()}");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
