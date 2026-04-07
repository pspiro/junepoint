import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building2,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
} from 'lucide-react';
import api from '../../lib/api';
import LoanStatusBadge from '../../components/LoanStatusBadge';

function formatAmount(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function TitleDashboard() {
  const { data: closingLoans = [], isLoading } = useQuery({
    queryKey: ['title-closing-loans'],
    queryFn: () => api.get('/api/loans?status=IN_CLOSING').then((r) => r.data),
  });

  const urgent = closingLoans.filter((l: any) => daysSince(l.closingDate || l.updatedAt) > 5);
  const today = closingLoans.filter((l: any) => {
    if (!l.closingDate) return false;
    const d = new Date(l.closingDate);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });

  const quickLinks = [
    { to: '/title/closing', label: 'Manage Closing', icon: Building2 },
    { to: '/title/documents', label: 'Documents', icon: FileText },
    { to: '/title/post-closing', label: 'Post-Closing', icon: CheckCircle },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Title Dashboard</h1>
        <p className="text-gray-500 text-sm">{closingLoans.length} loans in closing</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'In Closing', value: closingLoans.length, color: 'bg-sky-50 text-sky-600 border-sky-100', icon: Building2 },
          { label: 'Closing Today', value: today.length, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle },
          { label: 'Urgent / Overdue', value: urgent.length, color: 'bg-red-50 text-red-600 border-red-100', icon: AlertCircle },
        ].map((k) => (
          <div key={k.label} className={`bg-white border ${k.color.split(' ').find((c) => c.startsWith('border-'))} rounded-2xl shadow-sm p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color.split(' ').filter((c) => !c.startsWith('border-')).join(' ')}`}>
              <k.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{k.value}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {quickLinks.map((ql) => (
          <Link
            key={ql.to}
            to={ql.to}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <ql.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">{ql.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Urgent items */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Urgent Items ({urgent.length})
          </h2>
          <div className="space-y-2">
            {urgent.map((loan: any) => (
              <Link
                key={loan.id}
                to={`/title/closing?loanId=${loan.id}`}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100 hover:border-red-300 transition-colors"
              >
                <div>
                  <span className="font-semibold text-gray-900 text-sm">
                    #{loan.loanNumber || loan.id.slice(0, 8)}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {loan.borrower?.firstName} {loan.borrower?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-xs font-medium">{daysSince(loan.updatedAt)}d since update</span>
                  <ArrowRight className="w-4 h-4 text-red-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active closing loans */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="font-semibold text-gray-900">Active Closing Loans</h2>
        </div>
        {isLoading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : closingLoans.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No loans currently in closing.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Loan #</th>
                <th className="px-4 py-3 text-left">Borrower</th>
                <th className="px-4 py-3 text-left">Program</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Closing Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {closingLoans.map((loan: any) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-indigo-600">
                    #{loan.loanNumber || loan.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {loan.borrower?.firstName} {loan.borrower?.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{loan.program?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatAmount(loan.amount)}</td>
                  <td className="px-4 py-3"><LoanStatusBadge status={loan.status} /></td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {loan.closingDate ? new Date(loan.closingDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/title/closing?loanId=${loan.id}`}
                      className="text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
