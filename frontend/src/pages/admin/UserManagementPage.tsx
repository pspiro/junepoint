import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search } from 'lucide-react';
import api from '../../lib/api';

const ROLES = ['BROKER', 'BORROWER', 'UNDERWRITER', 'TITLE', 'INVESTOR', 'ADMIN'];

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  UNDERWRITER: 'bg-purple-100 text-purple-700',
  BROKER: 'bg-indigo-100 text-indigo-700',
  BORROWER: 'bg-sky-100 text-sky-700',
  TITLE: 'bg-amber-100 text-amber-700',
  INVESTOR: 'bg-emerald-100 text-emerald-700',
};

export default function UserManagementPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ role: '', isActive: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', role: 'BROKER', companyName: '' });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.role) params.set('role', filters.role);
      if (filters.isActive !== '') params.set('isActive', filters.isActive);
      return api.get(`/api/users?${params}&limit=50`).then(r => r.data);
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) => api.post('/api/users', body).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowModal(false); setForm({ email: '', firstName: '', lastName: '', role: 'BROKER', companyName: '' }); },
    onError: (e: any) => setError(e.response?.data?.error || 'Failed to create user'),
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.put(`/api/users/${userId}`, { isActive }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.total || 0} total users</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filters.isActive} onChange={e => setFilters(f => ({ ...f, isActive: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-left">Last Login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.companyName || '—'}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => deactivateMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                      className="text-xs text-gray-500 hover:text-red-600 font-medium"
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Add New User</h2>
            <div className="space-y-4">
              {[
                { key: 'firstName', label: 'First Name', type: 'text' },
                { key: 'lastName', label: 'Last Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'companyName', label: 'Company (optional)', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {ROLES.filter(r => r !== 'BORROWER').map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
