const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /function DateTimePicker\(\{ value, onChange, label \}: \{ value: string, onChange: \(val: string\) => void, label: string \}\) \{/,
  `function DateTimePicker({ value, onChange, label, hasError, isValid }: { value: string, onChange: (val: string) => void, label: string, hasError?: boolean, isValid?: boolean }) {`
);

code = code.replace(
  /className="border border-slate-300 p-2\.5 rounded-lg w-full cursor-pointer flex justify-between items-center bg-white shadow-sm hover:border-orange-500 transition-colors"/,
  `className={clsx("border p-2.5 rounded-lg w-full cursor-pointer flex justify-between items-center bg-white shadow-sm transition-colors", hasError ? "border-red-500" : (isValid ? "border-green-500" : "border-slate-300 hover:border-orange-500"))}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
