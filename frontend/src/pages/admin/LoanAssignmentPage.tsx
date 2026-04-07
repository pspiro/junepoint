import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import LoanStatusBadge from '../../components/LoanStatusBadge';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function LoanAssignmentPage() {
  const qc = useQueryClient();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [assigned, setAssigned] = useState<Set<string>>(new Set());

  const { data: loansData } = useQuery({
    queryKey: ['admin-all-loans'],
    queryFn: () => api.get('/api/loans?limit=100').then(r => r.data),
  });

  const { data: uwData } = useQuery({
    queryKey: ['underwriters'],
    queryFn: () => api.get('/api/users?role=UNDERWRITER&isActive=true&limit=50').then(r => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: ({ loanId, underwriterId }: { loanId: string; underwriterId: string }) =>
      api.post(`/api/loans/${loanId}/assign`, { underwriterId }).then(r => r.data),
    onSuccess: (_, vars) => {
      setAssigned(prev => new Set([...prev, vars.loanId]));
      qc.invalidateQueries({ queryKey: ['admin-all-loans'] });
    },
  });

  const allLoans = loansData?.loans || [];
  const unassigned = allLoans.filter((l: any) => l.status === 'SUBMITTED' && !l.assignedUwId && !assigned.has(l.id));
  const underwriters = uwData?.users || [];

  // Build workload map
  const workload = allLoans.reduce((acc: Record<string, number>, l: any) => {
    if (l.assignedUwId && l.status === 'IN_REVIEW') {
      acc[l.assignedUwId] = (acc[l.assignedUwId] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Assignment</h1>
        <p className="text-gray-500 text-sm mt-1">{unassigned.length} loan(s) awaiting assignment</p>
      </div>

      {/* Unassigned loans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Submitted — Awaiting Assignment</h2>
        </div>
        {unassigned.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-medium text-gray-700">All loans are assigned</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Loan #</th>
                <th className="px-5 py-3 text-left">Broker</th>
                <th className="px-5 py-3 text-left">Program</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-left">Submitted</th>
                <th className="px-5 py-3 text-left">Assign To</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {unassigned.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-gray-900">{l.loanNumber}</td>
                  <td className="px-5 py-3.5 text-gray-600">{l.broker?.firstName} {l.broker?.lastName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{l.program?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-900">{fmt(l.loanAmount)}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={assignments[l.id] || ''}
                      onChange={e => setAssignments(prev => ({ ...prev, [l.id]: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[180px]"
                    >
                      <option value="">Select underwriter…</option>
                      {underwriters.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({workload[u.id] || 0} active)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => assignments[l.id] && assignMutation.mutate({ loanId: l.id, underwriterId: assignments[l.id] })}
                      disabled={!assignments[l.id] || assignMutation.isPending}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All loans table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Loans</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Loan #</th>
              <th className="px-5 py-3 text-left">Program</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-left">Underwriter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allLoans.slice(0, 20).map((l: any) => {
              const uw = underwriters.find((u: any) => u.id === l.assignedUwId);
              return (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-gray-900">{l.loanNumber}</td>
                  <td className="px-5 py-3.5 text-gray-600">{l.program?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-900">{fmt(l.loanAmount)}</td>
                  <td className="px-5 py-3.5 text-center"><LoanStatusBadge status={l.status} /></td>
                  <td className="px-5 py-3.5 text-gray-500">{uw ? `${uw.firstName} ${uw.lastName}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
