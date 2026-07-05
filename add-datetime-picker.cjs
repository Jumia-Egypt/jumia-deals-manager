const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const dateFnsImport = "import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';";
const lucideImports = "ChevronLeft, ChevronRight, Calendar, Clock, ";

// Add date-fns import
if (!code.includes('import { format')) {
  code = code.replace("import clsx from 'clsx';", "import clsx from 'clsx';\n" + dateFnsImport);
}

// Add lucide imports
code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('ChevronLeft')) {
    return `import { ${lucideImports}${p1} } from 'lucide-react';`;
  }
  return match;
});

const dateTimePickerCode = `
function DateTimePicker({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ? new Date(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());

  useEffect(() => {
    if (isOpen) {
      const initialDate = value ? new Date(value) : new Date();
      setTempDate(initialDate);
      setCurrentMonth(initialDate);
    }
  }, [isOpen, value]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handleConfirm = () => {
    onChange(tempDate.toISOString());
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="text-xs font-bold block mb-1">{label}</label>
      <div 
        className="border border-slate-300 p-2.5 rounded-lg w-full cursor-pointer flex justify-between items-center bg-white shadow-sm hover:border-orange-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm text-slate-700">
          {value ? format(new Date(value), 'MMM d, yyyy - h:mm a') : 'Select Date & Time'}
        </span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 w-72">
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-xs font-bold text-slate-400 py-1">{d}</div>
              ))}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={\`empty-\${i}\`} />
              ))}
              {days.map(day => {
                const isSelected = isSameDay(day, tempDate);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      const newDate = new Date(day);
                      newDate.setHours(tempDate.getHours());
                      newDate.setMinutes(tempDate.getMinutes());
                      setTempDate(newDate);
                    }}
                    className={clsx(
                      "w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors mx-auto",
                      isSelected ? "bg-orange-500 text-white font-bold" : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mb-4 border-t pt-4">
              <Clock className="w-4 h-4 text-slate-400" />
              <input 
                type="time" 
                className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-orange-500"
                value={format(tempDate, 'HH:mm')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const [h, m] = val.split(':');
                    const newDate = new Date(tempDate);
                    newDate.setHours(parseInt(h, 10));
                    newDate.setMinutes(parseInt(m, 10));
                    setTempDate(newDate);
                  }
                }}
              />
            </div>

            <button 
              type="button"
              onClick={handleConfirm}
              className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Confirm
            </button>
          </div>
        </>
      )}
    </div>
  );
}

`;

if (!code.includes('function DateTimePicker')) {
  code = code.replace("export function AdminDashboard() {", dateTimePickerCode + "\nexport function AdminDashboard() {");
}

code = code.replace(
  /<div>\s*<label className="text-xs font-bold block mb-1">Start Date<\/label>\s*<input type="datetime-local" className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm text-sm" value=\{toLocalISOString\(formData.startDate\)\} onChange=\{e => setFormData\(\{\.\.\.formData, startDate: e\.target\.value \? new Date\(e\.target\.value\)\.toISOString\(\) : formData\.startDate\}\)\} \/>\s*<\/div>/,
  `<DateTimePicker label="Start Date" value={formData.startDate || ''} onChange={val => setFormData({...formData, startDate: val})} />`
);

code = code.replace(
  /<div>\s*<label className="text-xs font-bold block mb-1">End Date<\/label>\s*<input type="datetime-local" className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm text-sm" value=\{toLocalISOString\(formData.endDate\)\} onChange=\{e => setFormData\(\{\.\.\.formData, endDate: e\.target\.value \? new Date\(e\.target\.value\)\.toISOString\(\) : formData\.endDate\}\)\} \/>\s*<\/div>/,
  `<DateTimePicker label="End Date" value={formData.endDate || ''} onChange={val => setFormData({...formData, endDate: val})} />`
);

code = code.replace(
  /<div>\s*<label className="text-xs font-bold block mb-1">Submission Deadline<\/label>\s*<input type="datetime-local" className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm text-sm" value=\{toLocalISOString\(formData.rules\?\.submissionDeadline\)\} onChange=\{e => setFormData\(\{\.\.\.formData, rules: \{\.\.\.formData\.rules!, submissionDeadline: e\.target\.value \? new Date\(e\.target\.value\)\.toISOString\(\) : formData\.rules!\.submissionDeadline\}\}\)\} \/>\s*<\/div>/,
  `<DateTimePicker label="Submission Deadline" value={formData.rules?.submissionDeadline || ''} onChange={val => setFormData({...formData, rules: {...formData.rules!, submissionDeadline: val}})} />`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
