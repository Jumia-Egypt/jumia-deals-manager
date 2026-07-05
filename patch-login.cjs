const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

code = code.replace(
  "export function Login({ onLogin }: LoginProps) {",
  `export function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'admin' | 'vendor'>('vendor');
  const [error, setError] = useState('');`
);

code = code.replace(
  "const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (email === 'george.ayman@jumia.com' && password === 'admin123') {\n      onLogin('admin');\n    } else if (email && password) {\n      onLogin('vendor');\n    }\n  };",
  `const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (role === 'admin') {
      if (email === 'george.ayman@jumia.com' && password === 'admin123') {
        onLogin('admin', 'Hello George');
      } else {
        setError('Invalid admin credentials');
      }
    } else {
      if (email === 'george.ayman@jumia.com') {
        setError('Please use the Admin login tab for this email.');
      } else if (email && password) {
        const vendorName = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') + ' Shop';
        onLogin('vendor', vendorName);
      }
    }
  };`
);

code = code.replace(
  "interface LoginProps {\n  onLogin: (role: 'admin' | 'vendor') => void;\n}",
  "interface LoginProps {\n  onLogin: (role: 'admin' | 'vendor', name?: string) => void;\n}"
);

code = code.replace(
  '<h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Vendor Portal</h2>',
  `<div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              className={\`flex-1 py-2 text-sm font-semibold rounded-md transition-all \${role === 'vendor' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}\`}
              onClick={() => setRole('vendor')}
            >
              Vendor Login
            </button>
            <button
              type="button"
              className={\`flex-1 py-2 text-sm font-semibold rounded-md transition-all \${role === 'admin' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}\`}
              onClick={() => setRole('admin')}
            >
              Admin Login
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">{role === 'admin' ? 'Admin Portal' : 'Vendor Portal'}</h2>`
);

code = code.replace(
  '<p className="text-slate-500 text-center text-sm mb-8">Sign in to manage your campaigns and deals.</p>',
  `<p className="text-slate-500 text-center text-sm mb-8">Sign in to manage your campaigns and deals.</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}`
);


fs.writeFileSync('src/components/Login.tsx', code);
