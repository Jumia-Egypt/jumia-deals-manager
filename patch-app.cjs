const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<CalendarDashboard onSelectCampaign={setSelectedCampaign} />',
  '<CalendarDashboard onSelectCampaign={setSelectedCampaign} userRole={userRole} />'
);

fs.writeFileSync('src/App.tsx', code);
