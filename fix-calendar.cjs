const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarDashboard.tsx', 'utf8');

if (!code.includes('import {') || !code.includes('X')) {
  // Let's just find lucide-react import
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, p1) => {
    if (!p1.includes('X,')) {
      return `import { X, ${p1} } from 'lucide-react';`;
    }
    return match;
  });
}
fs.writeFileSync('src/components/CalendarDashboard.tsx', code);
