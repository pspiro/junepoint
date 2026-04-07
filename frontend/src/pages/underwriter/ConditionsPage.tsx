import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, CheckCircle, Save, X } from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const CONDITION_TYPES = ['CREDIT', 'PROPERTY', 'INCOME', 'TITLE', 'INSURANCE', 'LEGAL', 'OTHER'];
const PARTIES = ['BORROWER', 'BROKER', 'TITLE', 'UNDERWRITER'];
const STATUSES = ['OPEN', 'RECEIVED', 'CLEARED', 'WAIVED'];

interface NewConditionForm {
  type: string;
  description: string;
  responsibleParty: string;
  dueDate: string;
}

export default function ConditionsPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [form, setForm] = useState<NewConditionForm>({
    type: '',
    description: '',
    responsibleParty: '',
    dueDate: '',
  });

  const { data: conditions = [], isLoading } = useQuery({
    queryKey: ['loan-conditions', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/conditions`).then((r) => r.data),
    enabled: !!loanId,
  });

  const addCondition = useMutation({
    mutationFn: () => api.post(`/api/loans/${loanId}/conditions`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan-conditions', loanId] });
      setShowForm(false);
      setForm({ type: '', description: '', responsibleParty: '', dueDate: '' });
    },
  });

  const updateCondition = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/api/loans/${loanId}/conditions/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan-conditions', loanId] });
      setEditingId(null);
    },
  });

  const set = (field: keyof NewConditionForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openCount = conditions.filter((c: any) => c.status !== 'CLEARED' && c.status !== 'WAIVED').length;
  const clearedCount = conditions.filter((c: any) => c.status === 'CLEARED' || c.status === 'WAIVED').length;

  const fieldClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <Link
          to={`/underwriter/loans/${loanId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conditions</h1>
            <p className="text-gray-500 text-sm">
              {openCount} open · {clearedCount} cleared
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Condition
          </button>
        </div>
      </div>

      {/* Add Condition Form */}
      {showForm && (
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">New Condition</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={set('type')} className={fieldClass}>
                <option value="">Select type...</option>
                {CONDITION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Responsible Party</label>
              <select value={form.responsibleParty} onChange={set('responsibleParty')} className={fieldClass}>
                <option value="">Select party...</option>
                {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Describe the condition requirement..."
              className={fieldClass + ' resize-none'}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} className={fieldClass} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => addCondition.mutate()}
              disabled={!form.description || !form.type || addCondition.isPending}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Condition
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Conditions list */}
      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : conditions.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
          <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No conditions added yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {conditions.map((cond: any) => (
              <div key={cond.id} className={clsx('px-5 py-4', cond.status === 'CLEARED' || cond.status === 'WAIVED' ? 'bg-emerald-50/30' : '')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {cond.type}
                      </span>
                      <span className="text-xs text-gray-500">Party: {cond.responsibleParty}</span>
                      {cond.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(cond.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800">{cond.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editingId === cond.id ? (
                      <>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={() => updateCondition.mutate({ id: cond.id, status: editStatus })}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full',
                          cond.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-700' :
                          cond.status === 'WAIVED' ? 'bg-gray-100 text-gray-600' :
                          cond.status === 'RECEIVED' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700')}>
                          {cond.status}
                        </span>
                        <button
                          onClick={() => { setEditingId(cond.id); setEditStatus(cond.status); }}
                          className="text-xs text-gray-500 hover:text-indigo-600 border border-gray-200 px-2.5 py-1 rounded-lg hover:border-indigo-300 transition-colors"
                        >
                          Update
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
