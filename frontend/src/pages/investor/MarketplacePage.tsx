import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import api from '../../lib/api';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function MarketplacePage() {
  const [filters, setFilters] = useState({ program: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(filters.page), limit: '20' });
      if (filters.program) params.set('program', filters.program);
      return api.get(`/api/marketplace?${params}`).then(r => r.data);
    },
  });

  const listings = data?.listings || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loan Marketplace</h1>
        <p className="text-gray-500 text-sm mt-1">Browse closed loans available for purchase · {total} listings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <select
          value={filters.program}
          onChange={e => setFilters(f => ({ ...f, program: e.target.value, page: 1 }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Programs</option>
          {['BRIDGE', 'DSCR', 'FIX_FLIP', 'LONG_TERM_RENTAL', 'CONSTRUCTION', 'COMMERCIAL'].map(p => (
            <option key={p} value={p}>{p.replace('_', ' ')}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-400">{listings.length} of {total} results</span>
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading listings…</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400">
          No listings match your criteria
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((l: any) => (
            <div key={l.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {l.program.replace(/_/g, ' ')}
                    </span>
                    {l.matchScore && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {l.matchScore}% match
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{l.daysOnMarket} days on market</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{fmt(l.amount)}</p>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">LTV</p>
                      <p className="font-semibold text-gray-800">{l.ltv ? `${l.ltv}%` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">DSCR</p>
                      <p className="font-semibold text-gray-800">{l.dscr ? l.dscr.toFixed(2) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Yield</p>
                      <p className="font-semibold text-emerald-600">{(l.yield * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  {l.aiSummary && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">{l.aiSummary}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    to={`/investor/marketplace/${l.loanId}`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <p className="text-center text-sm font-semibold text-gray-900">{fmt(l.askingPrice)}</p>
                  <p className="text-center text-xs text-gray-400">asking price</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            disabled={listings.length < 20}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
