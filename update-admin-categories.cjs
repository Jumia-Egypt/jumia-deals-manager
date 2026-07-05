const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const iconsImport = "import { Smartphone, Tablet, Headphones, Laptop, Mouse, Gamepad2, Shirt, Microwave, Coffee, Refrigerator, Tv, Sparkles } from 'lucide-react';";
code = code.replace("import clsx from 'clsx';", "import clsx from 'clsx';\n" + iconsImport);

const catMap = `
const categoryIcons: Record<string, any> = {
  "Phones": Smartphone,
  "Tablets": Tablet,
  "Phones accessories": Headphones,
  "Computing": Laptop,
  "Computing Accessories": Mouse,
  "Gaming": Gamepad2,
  "Gaming Accessories": Headphones,
  "Fashion": Shirt,
  "Small Home Appliance": Coffee,
  "Medium Home Applainces": Microwave,
  "Large Home Appliances": Refrigerator,
  "TVs": Tv,
  "Health and Beauty": Sparkles
};
`;

code = code.replace("export function AdminDashboard", catMap + "export function AdminDashboard");

const catsRender = `
            {Object.keys(categoryIcons).map(cat => {
              const Icon = categoryIcons[cat];
              return (
              <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-slate-50 rounded">
                <input 
                  type="checkbox"
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  checked={formData.rules?.eligibleCategories?.includes(cat) || false}
                  onChange={(e) => {
                    const current = formData.rules?.eligibleCategories || [];
                    const next = e.target.checked 
                      ? [...current, cat]
                      : current.filter(c => c !== cat);
                    setFormData({
                      ...formData, 
                      rules: { ...formData.rules!, eligibleCategories: next }
                    });
                  }}
                />
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="truncate" title={cat}>{cat}</span>
              </label>
            )})}
`;

code = code.replace(
  /\{\["Phones".*?\}\)\}/s,
  catsRender
);

// Add validation to handleSave
code = code.replace(
  /const handleSave = async \(\) => \{/,
  `const handleSave = async () => {
    if (new Date(formData.startDate || '') > new Date(formData.endDate || '')) {
      alert("Start date cannot be after end date.");
      return;
    }
    if (formData.rules?.submissionDeadline && new Date(formData.rules.submissionDeadline) > new Date(formData.startDate || '')) {
      alert("Submission deadline cannot be after start date.");
      return;
    }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
