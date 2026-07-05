const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Remove campaign type
code = code.replace(
  /<input type="text" className="border p-2 rounded w-full" value=\{formData.type \|\| ''\} onChange=\{e => setFormData\(\{\.\.\.formData, type: e\.target\.value\}\)\} placeholder="Campaign Type" \/>/g,
  ''
);

// Remove description
code = code.replace(
  /<textarea className="border p-2 rounded w-full" value=\{formData.description \|\| ''\} onChange=\{e => setFormData\(\{\.\.\.formData, description: e\.target\.value\}\)\} placeholder="Description" \/>/g,
  ''
);

// Remove min and max discount grid
code = code.replace(
  /<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label className="text-xs">Min Discount %<\/label>\s*<input type="number" className="border p-2 rounded w-full" value=\{formData.rules\?\.minDiscount \|\| 0\} onChange=\{e => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, minDiscount: Number\(e\.target\.value\)\}\}\)\} \/>\s*<\/div>\s*<div>\s*<label className="text-xs">Max Discount %<\/label>\s*<input type="number" className="border p-2 rounded w-full" value=\{formData.rules\?\.maxDiscount \|\| 0\} onChange=\{e => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, maxDiscount: Number\(e\.target\.value\)\}\}\)\} \/>\s*<\/div>\s*<\/div>/g,
  ''
);

// Replace eligible categories input with a select
code = code.replace(
  /<input type="text" className="border p-2 rounded w-full" value=\{formData\.rules\?\.eligibleCategories\?\.join\(', '\) \|\| ''\} onChange=\{e => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, eligibleCategories: e\.target\.value\.split\(','\)\.map\(s => s\.trim\(\)\)\}\}\)\} \/>/g,
  `<select multiple className="border p-2 rounded w-full h-32" value={formData.rules?.eligibleCategories || []} onChange={e => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({...formData, rules: {...formData.rules!, eligibleCategories: selected}});
  }}>
    <option value="Computing">Computing</option>
    <option value="Fashion">Fashion</option>
    <option value="Stationery">Stationery</option>
    <option value="Food">Food</option>
    <option value="Home Appliances">Home Appliances</option>
    <option value="Smartphones">Smartphones</option>
    <option value="TV & Audio">TV & Audio</option>
    <option value="Gaming">Gaming</option>
    <option value="Supermarket">Supermarket</option>
    <option value="Baby Products">Baby Products</option>
  </select>`
);

code = code.replace(
  /<label className="text-xs">Eligible Categories \(comma separated\)<\/label>/g,
  '<label className="text-xs">Eligible Categories (Hold Ctrl/Cmd to select multiple)</label>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
