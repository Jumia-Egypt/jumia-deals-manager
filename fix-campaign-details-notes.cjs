const fs = require('fs');
let code = fs.readFileSync('src/components/CampaignDetails.tsx', 'utf8');

const replacement = `
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <div className="col-span-2">
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-red-500" /> Deadline
                </p>
                <p className="text-sm font-bold text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-100">
                  {safeFormat(campaign.rules.submissionDeadline, 'MMM d, yyyy')}
                </p>
              </div>
              
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-emerald-500" /> Starts
                </p>
                <p className="text-xs font-bold text-slate-700 bg-white inline-block px-2 py-0.5 rounded border border-slate-200">
                  {safeFormat(campaign.startDate, 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">
                  <MoonStar className="w-3 h-3 text-blue-500" /> Ends
                </p>
                <p className="text-xs font-bold text-slate-700 bg-white inline-block px-2 py-0.5 rounded border border-slate-200">
                  {safeFormat(campaign.endDate, 'MMM d, yyyy')}
                </p>
              </div>

              {campaign.rules.notes && (
                <div className="col-span-2 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Admin Notes
                  </p>
                  <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{campaign.rules.notes}</p>
                </div>
              )}
`;

code = code.replace(
  /<div className="grid grid-cols-2 gap-y-6 gap-x-4 p-4 bg-slate-50\/80 rounded-xl border border-slate-100">\s*<div className="col-span-2">\s*<p className="text-\[10px\] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">\s*<CalendarIcon className="w-3 h-3 text-red-500" \/> Deadline\s*<\/p>\s*<p className="text-sm font-bold text-red-600 bg-red-50 inline-block px-2 py-0\.5 rounded border border-red-100">\s*\{safeFormat\(campaign\.rules\.submissionDeadline, 'MMM d, yyyy'\)\}\s*<\/p>\s*<\/div>\s*<div>\s*<p className="text-\[10px\] uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-1">\s*<Sun className="w-3 h-3 text-emerald-500" \/> Starts\s*<\/p>\s*<p className="text-xs font-bold text-slate-700 bg-white inline-block px-2 py-0\.5 rounded border border-slate-200">\s*\{safeFormat\(campaign\.startDate, 'MMM d, yyyy'\)\}\s*<\/p>\s*<\/div>\s*<div>/,
  replacement + "\n              <div>" // Add back the next div to make sure it matches properly if it matched part of it
);

fs.writeFileSync('src/components/CampaignDetails.tsx', code);
