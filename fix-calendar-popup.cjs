const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarDashboard.tsx', 'utf8');

code = code.replace(
  'onClick={() => {\n                        setSelectedDayInfo(null);\n                        onSelectCampaign(c);\n                      }}',
  `onClick={() => {
                        if (userRole !== 'admin') {
                          setSelectedDayInfo(null);
                          onSelectCampaign(c);
                        }
                      }}`
);

code = code.replace(
  'className="p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5 transition-all cursor-pointer group flex flex-col gap-3 bg-white"',
  'className={clsx("p-4 rounded-xl border border-slate-200 flex flex-col gap-3 bg-white", userRole !== "admin" && "hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5 transition-all cursor-pointer group")}'
);

fs.writeFileSync('src/components/CalendarDashboard.tsx', code);
