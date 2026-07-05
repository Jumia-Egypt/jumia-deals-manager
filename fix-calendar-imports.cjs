const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarDashboard.tsx', 'utf8');

if (!code.includes('import { X')) {
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { X, $1 } from 'lucide-react';");
}

fs.writeFileSync('src/components/CalendarDashboard.tsx', code);
