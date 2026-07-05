const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const handleDeleteCode = `
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await fetch(\`/api/campaigns/\${id}\`, { method: 'DELETE' });
      fetchCampaigns();
    }
  };
`;

code = code.replace(
  /const handleCreate = \(\) => \{/,
  handleDeleteCode + '\n  const handleCreate = () => {'
);

code = code.replace(
  /<button onClick=\{.*?\} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg">\s*<Edit2 className="w-4 h-4" \/>\s*<\/button>/g,
  `<div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
