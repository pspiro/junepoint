import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Building2, TrendingUp, DollarSign, UserPlus } from 'lucide-react';
import api from '../../lib/api';
import LoanStatusBadge from '../../components/LoanStatusBadge';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function AdminDashboard() {
  const { data: loansData } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: () => api.get('/api/loans?limit=100').then(r => r.data),
  });
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/users?limit=100').then(r => r.data),
  });

  const loans = loansData?.loans || [];
  const users = usersData?.users || [];
  const activeLoans = loans.filter((l: any) => !['DECLINED', 'SUSPENDED', 'SOLD'].includes(l.status));
  const unassignedLoans = loans.filter((l: any) => l.status === 'SUBMITTED' && !l.assignedUwId);
  const totalCapital = activeLoans.reduce((s: number, l: any) => s + (l.loanAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: usersData?.total || 0, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Active Loans', value: activeLoans.length, icon: Building2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Capital in Pipeline', value: fmt(totalCapital), icon: DollarSign, color: 'bg-sky-50 text-sky-600' },
          { label: 'Needs Assignment', value: unassignedLoans.length, icon: UserPlus, color: 'bg-amber-50 text-amber-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unassigned loans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Needs Assignment</h2>
            <Link to="/admin/loans" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Manage →</Link>
          </div>
          {unassignedLoans.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">All loans are assigned ✓</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {unassignedLoans.slice(0, 5).map((l: any) => (
                <div key={l.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{l.loanNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.program?.replace(/_/g, ' ')} · {fmt(l.loanAmount)}</p>
                  </div>
                  <Link to="/admin/loans" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Assign</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent loans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Loans</h2>
            <Link to="/admin/loans" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loans.slice(0, 5).map((l: any) => (
              <div key={l.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 font-mono">{l.loanNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.program?.replace(/_/g, ' ')}</p>
                </div>
                <LoanStatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
