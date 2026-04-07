import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function PortfolioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
  });

  const loans = data?.loans || [];
  const summary = data?.summary || { totalDeployed: 0, interestEarned: 0, activeCount: 0 };

  const handleExport = () => {
    const headers = ['Loan #', 'Program', 'Original Amount', 'Bid Amount', 'Status'];
    const rows = loans.map((l: any) => [l.loanNumber, l.program, l.loanAmount, l.bidAmount, l.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'portfolio.csv'; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-gray-500 text-sm mt-1">{summary.activeCount} active loan(s)</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Deployed', value: fmt(summary.totalDeployed), color: 'text-indigo-600' },
          { label: 'Interest Earned', value: fmt(summary.interestEarned), color: 'text-emerald-600' },
          { label: 'Active Loans', value: summary.activeCount, color: 'text-sky-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Portfolio Loans</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No loans in portfolio yet</p>
            <p className="text-sm text-gray-400 mt-1">Browse the marketplace to find opportunities</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Loan #</th>
                <th className="px-5 py-3 text-left">Program</th>
                <th className="px-5 py-3 text-right">Original Amount</th>
                <th className="px-5 py-3 text-right">Bid Amount</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loans.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-medium text-gray-900">{l.loanNumber}</td>
                  <td className="px-5 py-3.5 text-gray-600">{l.program?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3.5 text-right text-gray-900">{fmt(l.loanAmount)}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-emerald-600">{fmt(l.bidAmount)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Active</span>
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
