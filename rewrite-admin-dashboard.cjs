const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { getCampaignStyle } from '../utils';
import clsx from 'clsx';

const toLocalISOString = (dateInput: string | Date | undefined) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
};

export function AdminDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Campaign>>({});

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = () => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => setCampaigns(data));
  };

  const handleEdit = (c: Campaign) => {
    setEditingId(c.id);
    setFormData(c);
  };

  const handleSave = async () => {
    const isNew = !formData.id;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/campaigns' : \`/api/campaigns/\${formData.id}\`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setEditingId(null);
    setFormData({});
    fetchCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await fetch(\`/api/campaigns/\${id}\`, { method: 'DELETE' });
      fetchCampaigns();
    }
  };

  const handleCreate = () => {
    setEditingId('new');
    setFormData({
      name: '',
      type: '',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      description: '',
      rules: {
        minDiscount: 0,
        maxDiscount: 100,
        eligibleCategories: [],
        submissionDeadline: new Date().toISOString(),
        notes: ''
      }
    });
  };

  const FormContent = () => (
    <div className="space-y-4">
      <select className="border p-2 rounded w-full" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}>
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
      </select>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold block mb-1">Start Date</label>
          <input type="datetime-local" className="border p-2 rounded w-full" value={toLocalISOString(formData.startDate)} onChange={e => setFormData({...formData, startDate: e.target.value ? new Date(e.target.value).toISOString() : formData.startDate})} />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">End Date</label>
          <input type="datetime-local" className="border p-2 rounded w-full" value={toLocalISOString(formData.endDate)} onChange={e => setFormData({...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : formData.endDate})} />
        </div>
      </div>
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <h4 className="font-bold">Rules</h4>
        <div>
          <label className="text-xs font-bold mb-2 block">Eligible Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded border">
            {["Phones", "Tablets", "Phones accessories", "Computing", "Computing Accessories", "Gaming", "Gaming Accessories", "Fashion", "Small Home Appliance", "Medium Home Applainces", "Large Home Appliances", "TVs", "Health and Beauty"].map(cat => (
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
          </div>
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">Submission Deadline</label>
          <input type="datetime-local" className="border p-2 rounded w-full" value={toLocalISOString(formData.rules?.submissionDeadline)} onChange={e => setFormData({...formData, rules: {...formData.rules!, submissionDeadline: e.target.value ? new Date(e.target.value).toISOString() : formData.rules!.submissionDeadline}})} />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">Notes (e.g., Minimum SKUs)</label>
          <input type="text" className="border p-2 rounded w-full" value={formData.rules?.notes || ''} onChange={e => setFormData({...formData, rules: {...formData.rules!, notes: e.target.value}})} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg flex items-center gap-2"><X className="w-4 h-4"/> Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"><Save className="w-4 h-4"/> Save</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Admin Dashboard</h2>
        <button onClick={handleCreate} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Campaign
        </button>
      </div>
      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="border border-slate-200 p-4 rounded-lg">
            {editingId === c.id ? (
              <FormContent />
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  {(() => {
                    const style = getCampaignStyle(c.name);
                    const Icon = style.icon;
                    return (
                      <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-1", style.bg, style.text)}>
                        <Icon className={clsx("w-4 h-4", style.iconColor)} />
                        <h3 className="font-bold text-lg">{c.name}</h3>
                      </div>
                    );
                  })()}
                  <p className="text-sm text-slate-500">{new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {editingId === 'new' && (
          <div className="border border-slate-200 p-4 rounded-lg border-orange-500 shadow-sm">
             <FormContent />
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
