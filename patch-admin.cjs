const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';",
  "import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';\nimport { getCampaignStyle } from '../utils';\nimport clsx from 'clsx';"
);

// We want to add a dropdown for the campaign name instead of a free-text input
code = code.replace(
  '<input type="text" className="border p-2 rounded w-full" value={formData.name || \'\'} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Campaign Name" />',
  `<select className="border p-2 rounded w-full" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}>
                  <option value="" disabled>Select Campaign Theme</option>
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Daily Deal">Daily Deal</option>
                  <option value="Week End Offer">Week End Offer</option>
                  <option value="JUMIA Anniversary">JUMIA Anniversary</option>
                  <option value="Black Friday">Black Friday</option>
                  <option value="Mothers Day">Mothers Day</option>
                  <option value="Valentines Day">Valentines Day</option>
                  <option value="Back to School">Back to School</option>
                  <option value="Eid Adha">Eid Adha</option>
                  <option value="Ramadan Campaign">Ramadan Campaign</option>
                  <option value="Summer Campaign">Summer Campaign</option>
                  <option value="Pay Week">Pay Week</option>
                </select>`
);

code = code.replace(
  '<input type="text" className="border p-2 rounded w-full" value={formData.name || \'\'} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Campaign Name" />',
  `<select className="border p-2 rounded w-full" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}>
                  <option value="" disabled>Select Campaign Theme</option>
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Daily Deal">Daily Deal</option>
                  <option value="Week End Offer">Week End Offer</option>
                  <option value="JUMIA Anniversary">JUMIA Anniversary</option>
                  <option value="Black Friday">Black Friday</option>
                  <option value="Mothers Day">Mothers Day</option>
                  <option value="Valentines Day">Valentines Day</option>
                  <option value="Back to School">Back to School</option>
                  <option value="Eid Adha">Eid Adha</option>
                  <option value="Ramadan Campaign">Ramadan Campaign</option>
                  <option value="Summer Campaign">Summer Campaign</option>
                  <option value="Pay Week">Pay Week</option>
                </select>`
);


// Replace the listing representation of a campaign with the style from getCampaignStyle
code = code.replace(
  '<h3 className="font-bold text-lg">{c.name}</h3>',
  `{(() => {
    const style = getCampaignStyle(c.name);
    const Icon = style.icon;
    return (
      <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-1", style.bg, style.text)}>
        <Icon className={clsx("w-4 h-4", style.iconColor)} />
        <h3 className="font-bold text-lg">{c.name}</h3>
      </div>
    );
  })()}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
