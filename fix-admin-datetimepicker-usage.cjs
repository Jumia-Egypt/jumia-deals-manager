const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const replacement = `
      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const startDate = new Date(formData.startDate || '');
          const endDate = new Date(formData.endDate || '');
          const deadline = new Date(formData.rules?.submissionDeadline || '');
          const isStartValid = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
          const isStartError = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate;
          
          const isEndValid = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
          const isEndError = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate;
          
          const isDeadlineValid = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline <= startDate;
          const isDeadlineError = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline > startDate;
          
          return (
            <>
              <DateTimePicker label="Start Date" value={formData.startDate || ''} onChange={val => setFormData({...formData, startDate: val})} hasError={isStartError} isValid={isStartValid} />
              <DateTimePicker label="End Date" value={formData.endDate || ''} onChange={val => setFormData({...formData, endDate: val})} hasError={isEndError} isValid={isEndValid} />
            </>
          );
        })()}
      </div>
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h4 className="font-bold">Rules</h4>
        <div>
          <label className="text-xs font-bold mb-2 block">Eligible Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-60 overflow-y-auto">
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
              );
            })}
          </div>
        </div>
        {(() => {
          const startDate = new Date(formData.startDate || '');
          const deadline = new Date(formData.rules?.submissionDeadline || '');
          const isDeadlineValid = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline <= startDate;
          const isDeadlineError = !isNaN(deadline.getTime()) && !isNaN(startDate.getTime()) && deadline > startDate;
          return <DateTimePicker label="Submission Deadline" value={formData.rules?.submissionDeadline || ''} onChange={val => setFormData({...formData, rules: {...formData.rules!, submissionDeadline: val}})} hasError={isDeadlineError} isValid={isDeadlineValid} />
        })()}
`;

code = code.replace(
  /<div className="grid grid-cols-2 gap-4">\s*<DateTimePicker label="Start Date" value=\{formData\.startDate \|\| ''\} onChange=\{val => setFormData\(\{\.\.\.formData, startDate: val\}\)\} \/>\s*<DateTimePicker label="End Date" value=\{formData\.endDate \|\| ''\} onChange=\{val => setFormData\(\{\.\.\.formData, endDate: val\}\)\} \/>\s*<\/div>\s*<div className="bg-slate-50 p-4 rounded-lg space-y-4">\s*<h4 className="font-bold">Rules<\/h4>\s*<div>\s*<label className="text-xs font-bold mb-2 block">Eligible Categories<\/label>\s*<div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-60 overflow-y-auto">\s*\{Object\.keys\(categoryIcons\)\.map\(cat => \{\s*const Icon = categoryIcons\[cat\];\s*return \(\s*<label key=\{cat\} className="flex items-center gap-2 text-sm cursor-pointer p-1 hover:bg-slate-50 rounded">\s*<input \s*type="checkbox"\s*className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"\s*checked=\{formData\.rules\?\.eligibleCategories\?\.includes\(cat\) \|\| false\}\s*onChange=\{\(e\) => \{\s*const current = formData\.rules\?\.eligibleCategories \|\| \[\];\s*const next = e\.target\.checked \s*\? \[\.\.\.current, cat\]\s*: current\.filter\(c => c !== cat\);\s*setFormData\(\{\s*\.\.\.formData, \s*rules: \{ \.\.\.formData\.rules!, eligibleCategories: next \}\s*\}\);\s*\}\}\s*\/>\s*<Icon className="w-4 h-4 text-slate-500" \/>\s*<span className="truncate" title=\{cat\}>\{cat\}<\/span>\s*<\/label>\s*\);\s*\}\)\}\s*<\/div>\s*<\/div>\s*<DateTimePicker label="Submission Deadline" value=\{formData\.rules\?\.submissionDeadline \|\| ''\} onChange=\{val => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, submissionDeadline: val\}\}\)\} \/>/,
  replacement
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
