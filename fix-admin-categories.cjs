const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace the select multiple with checkboxes
code = code.replace(
  /<label className="text-xs">Eligible Categories \(Hold Ctrl\/Cmd to select multiple\)<\/label>\s*<select multiple className="border p-2 rounded w-full h-32" value=\{formData\.rules\?\.eligibleCategories \|\| \[\]\} onChange=\{e => \{\s*const selected = Array\.from\(e\.target\.selectedOptions, option => option\.value\);\s*setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, eligibleCategories: selected\}\}\);\s*\}\}>\s*<option value="Computing">Computing<\/option>\s*<option value="Fashion">Fashion<\/option>\s*<option value="Stationery">Stationery<\/option>\s*<option value="Food">Food<\/option>\s*<option value="Home Appliances">Home Appliances<\/option>\s*<option value="Smartphones">Smartphones<\/option>\s*<option value="TV & Audio">TV & Audio<\/option>\s*<option value="Gaming">Gaming<\/option>\s*<option value="Supermarket">Supermarket<\/option>\s*<option value="Baby Products">Baby Products<\/option>\s*<\/select>/g,
  `<label className="text-xs font-bold mb-2 block">Eligible Categories</label>
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded border">
                      {["Computing", "Fashion", "Stationery", "Food", "Home Appliances", "Smartphones", "TV & Audio", "Gaming", "Supermarket", "Baby Products"].map(cat => (
                        <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
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
                          {cat}
                        </label>
                      ))}
                    </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
