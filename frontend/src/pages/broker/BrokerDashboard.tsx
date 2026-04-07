import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Brain,
  Plus,
  List,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LoanStatusBadge from '../../components/LoanStatusBadge';

function formatAmount(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function BrokerDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: loans = [], isLoading, isError } = useQuery({
    queryKey: ['broker-loans'],
    queryFn: () => api.get('/api/loans').then((r) => r.data),
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const active = loans.filter((l: any) =>
    ['SUBMITTED', 'IN_REVIEW', 'CONDITIONALLY_APPROVED', 'APPROVED', 'IN_CLOSING'].includes(l.status)
  );
  const submittedThisMonth = loans.filter(
    (l: any) => l.status === 'SUBMITTED' && new Date(l.createdAt) >= monthStart
  );
  const awaitingDecision = loans.filter((l: any) => ['SUBMITTED', 'IN_REVIEW'].includes(l.status));
  const withScore = loans.filter((l: any) => l.aiCompositeScore != null);
  const avgScore = withScore.length
    ? Math.round(withScore.reduce((s: number, l: any) => s + l.aiCompositeScore, 0) / withScore.length)
    : null;

  const recentLoans = [...loans]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const actionItems = loans.filter((l: any) => l.status === 'CONDITIONALLY_APPROVED');

  const kpis = [
    { label: 'Active Loans', value: active.length, icon: FileText, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
    { label: 'Submitted This Month', value: submittedThisMonth.length, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { label: 'Awaiting Decision', value: awaitingDecision.length, icon: Clock, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
    { label: 'Avg AI Score', value: avgScore != null ? `${avgScore}/100` : '—', icon: Brain, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.firstName}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your pipeline today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/broker/pipeline"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            <List className="w-4 h-4" /> View Pipeline
          </Link>
          <Link
            to="/broker/loans/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Loan
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`bg-white border ${kpi.border} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{kpi.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Action Items */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Action Required
          </h2>
          {actionItems.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No actions needed right now.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {actionItems.map((loan: any) => (
                <li key={loan.id}>
                  <Link
                    to={`/broker/loans/${loan.id}`}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-gray-900">#{loan.loanNumber || loan.id.slice(0, 8)}</div>
                      <div className="text-xs text-gray-500">Conditions outstanding</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Pipeline */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Pipeline</h2>
            <Link to="/broker/pipeline" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </Link>
          </div>
          {isError ? (
            <div className="text-center py-8 text-red-500 text-sm">Failed to load loans.</div>
          ) : recentLoans.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No loans yet. Submit your first loan to get started.</p>
              <Link to="/broker/loans/new" className="mt-3 inline-block text-sm text-indigo-600 font-medium hover:underline">
                Create a loan →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-3 text-left">Loan #</th>
                    <th className="pb-3 text-left">Borrower</th>
                    <th className="pb-3 text-left">Amount</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-right">AI Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLoans.map((loan: any) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <Link to={`/broker/loans/${loan.id}`} className="font-medium text-indigo-600 hover:underline">
                          #{loan.loanNumber || loan.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-700">
                        {loan.borrower?.firstName} {loan.borrower?.lastName}
                      </td>
                      <td className="py-3 text-gray-700">{formatAmount(loan.amount || 0)}</td>
                      <td className="py-3">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="py-3 text-right">
                        {loan.aiCompositeScore != null ? (
                          <span className="font-semibold text-gray-900">{loan.aiCompositeScore}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
