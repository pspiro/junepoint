import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, BarChart2, Percent, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function InvestorDashboard() {
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
  });
  const { data: market } = useQuery({
    queryKey: ['marketplace'],
    queryFn: () => api.get('/api/marketplace?limit=5').then(r => r.data),
  });
  const { data: criteria } = useQuery({
    queryKey: ['investor-criteria'],
    queryFn: () => api.get('/api/investor/criteria').then(r => r.data),
  });

  const summary = portfolio?.summary || { totalDeployed: 0, interestEarned: 0, activeCount: 0 };
  const listings = market?.listings || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your portfolio performance and marketplace activity</p>
        </div>
        <Link to="/investor/marketplace" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          Browse Marketplace
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Deployed', value: fmt(summary.totalDeployed), icon: DollarSign, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Loans Held', value: summary.activeCount, icon: BarChart2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Interest Earned', value: fmt(summary.interestEarned), icon: TrendingUp, color: 'bg-sky-50 text-sky-600' },
          { label: 'Avg. Yield', value: '9.0%', icon: Percent, color: 'bg-amber-50 text-amber-600' },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Marketplace listings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Matched Marketplace Listings</h2>
            <Link to="/investor/marketplace" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          {listings.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No listings available</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {listings.map((l: any) => (
                <div key={l.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{l.program.replace('_', ' ')} — {fmt(l.amount)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">LTV {l.ltv}% · Yield {(l.yield * 100).toFixed(1)}% · {l.daysOnMarket}d on market</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      {l.matchScore}% match
                    </span>
                    <Link to={`/investor/marketplace/${l.loanId}`} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Criteria card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Purchase Criteria</h2>
            <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>
          {criteria ? (
            <div className="p-5 space-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">Programs</p>
                <div className="flex flex-wrap gap-1">
                  {(criteria.programs || []).map((p: string) => (
                    <span key={p} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{p.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">Amount</p>
                  <p className="text-gray-900">{criteria.minAmount ? fmt(criteria.minAmount) : '—'} – {criteria.maxAmount ? fmt(criteria.maxAmount) : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">Max LTV</p>
                  <p className="text-gray-900">{criteria.maxLtv ? `${criteria.maxLtv}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">Min Yield</p>
                  <p className="text-gray-900">{criteria.minYield ? `${(criteria.minYield * 100).toFixed(1)}%` : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-1">States</p>
                  <p className="text-gray-900">{(criteria.states || []).join(', ') || '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 text-sm text-gray-400">No criteria set</div>
          )}
        </div>
      </div>
    </div>
  );
}
