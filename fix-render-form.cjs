const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/\{editingId === c\.id \? \(\s*\{renderFormContent\(\)\}\s*\) : \(/, "{editingId === c.id ? renderFormContent() : (");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
