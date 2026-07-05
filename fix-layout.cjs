const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(
  "userRole?: 'admin' | 'vendor' | null;\n}",
  "userRole?: 'admin' | 'vendor' | null;\n  userName?: string;\n}"
);

code = code.replace(
  "export function Layout({ children, activeTab = 'calendar', onNavigate, onLogout, userRole }: LayoutProps) {",
  "export function Layout({ children, activeTab = 'calendar', onNavigate, onLogout, userRole, userName }: LayoutProps) {"
);

code = code.replace(
  '<p className="text-sm font-semibold text-slate-900 leading-none mb-1">Tech Store Egypt</p>',
  '<p className="text-sm font-semibold text-slate-900 leading-none mb-1">{userName || "Tech Store Egypt"}</p>'
);

code = code.replace(
  '<p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">ID: 884920</p>',
  '<p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{userRole === "admin" ? "ADMINISTRATOR" : "ID: 884920"}</p>'
);

code = code.replace(
  '<p className="text-sm font-bold text-slate-900">Tech Store Egypt</p>',
  '<p className="text-sm font-bold text-slate-900">{userName || "Tech Store Egypt"}</p>'
);

code = code.replace(
  '<p className="text-xs text-slate-500">ID: 884920</p>',
  '<p className="text-xs text-slate-500">{userRole === "admin" ? "ADMINISTRATOR" : "ID: 884920"}</p>'
);

fs.writeFileSync('src/components/Layout.tsx', code);
