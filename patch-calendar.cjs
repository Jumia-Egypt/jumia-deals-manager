const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarDashboard.tsx', 'utf8');

// replace the getCampaignStyle block and imports
code = code.replace(/import { format.*?from 'date-fns';\nimport { ChevronLeft.*?from 'lucide-react';/,
`import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { getCampaignStyle } from '../utils';`);

// Find the start of getCampaignStyle
const start = code.indexOf('const getCampaignStyle =');
if (start !== -1) {
  const end = code.indexOf('};', start) + 2;
  code = code.slice(0, start) + code.slice(end);
}

// Add userRole
code = code.replace(
  'interface CalendarDashboardProps {\n  onSelectCampaign: (campaign: Campaign) => void;\n}',
  'interface CalendarDashboardProps {\n  onSelectCampaign: (campaign: Campaign) => void;\n  userRole?: "admin" | "vendor" | null;\n}'
);

code = code.replace(
  'export function CalendarDashboard({ onSelectCampaign }: CalendarDashboardProps) {',
  'export function CalendarDashboard({ onSelectCampaign, userRole }: CalendarDashboardProps) {'
);

// update the click behavior
code = code.replace(
  'onClick={() => onSelectCampaign(c)}',
  'onClick={() => userRole !== "admin" && onSelectCampaign(c)}'
);

code = code.replace(
  'className={clsx(\n                        "text-[10px] px-2 py-1.5 rounded-lg ring-1 font-bold truncate shadow-sm flex items-center justify-between gap-1.5",\n                        style.bg,\n                        style.ring,\n                        style.text,\n                        "hover:opacity-80 cursor-pointer transition-opacity"',
  'className={clsx(\n                        "text-[10px] px-2 py-1.5 rounded-lg ring-1 font-bold truncate shadow-sm flex items-center justify-between gap-1.5",\n                        style.bg,\n                        style.ring,\n                        style.text,\n                        userRole !== "admin" ? "hover:opacity-80 cursor-pointer transition-opacity" : "cursor-default"'
);

fs.writeFileSync('src/components/CalendarDashboard.tsx', code);
