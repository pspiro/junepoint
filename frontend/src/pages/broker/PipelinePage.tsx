import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import api from '../../lib/api';
import LoanStatusBadge from '../../components/LoanStatusBadge';

const PAGE_SIZE = 10;

const STATUSES = ['', 'DRAFT', 'SUBMITTED', 'IN_REVIEW', 'CONDITIONALLY_APPROVED', 'APPROVED', 'IN_CLOSING', 'CLOSED', 'DECLINED', 'SUSPENDED'];
const PROGRAMS = ['', 'BRIDGE', 'DSCR', 'FIX_AND_FLIP', 'LONG_TERM_RENTAL', 'CONSTRUCTION', 'COMMERCIAL'];

function formatAmount(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86400000);
}

type SortField = 'loanNumber' | 'amount' | 'aiCompositeScore' | 'createdAt';

export default function PipelinePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: loans = [], isLoading, isError } = useQuery({
    queryKey: ['broker-loans'],
    queryFn: () => api.get('/api/loans').then((r) => r.data),
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = loans
    .filter((l: any) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (l.loanNumber || '').toLowerCase().includes(q) ||
        (l.borrower?.firstName || '').toLowerCase().includes(q) ||
        (l.borrower?.lastName || '').toLowerCase().includes(q) ||
        (l.borrower?.email || '').toLowerCase().includes(q);
      const matchStatus = !statusFilter || l.status === statusFilter;
      const matchProgram = !programFilter || l.program === programFilter;
      return matchSearch && matchStatus && matchProgram;
    })
    .sort((a: any, b: any) => {
      let av = a[sortField] ?? 0;
      let bv = b[sortField] ?? 0;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-3.5 h-3.5 inline ml-1 ${sortField === field ? 'text-indigo-600' : 'text-gray-300'}`}
    />
  );

  const programLabel = (p: string) => p?.replace(/_/g, ' ') ?? '—';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Pipeline</h1>
          <p className="text-gray-500 text-sm">{loans.length} total loans</p>
        </div>
        <Link
          to="/broker/loans/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Loan
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by loan #, borrower..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={programFilter}
          onChange={(e) => { setProgramFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Programs</option>
          {PROGRAMS.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(search || statusFilter || programFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setProgramFilter(''); setPage(1); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading loans...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500 text-sm">Failed to load loans. Please refresh.</div>
        ) : paginated.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No loans match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-gray-900" onClick={() => toggleSort('loanNumber')}>
                    Loan # <SortIcon field="loanNumber" />
                  </th>
                  <th className="px-4 py-3 text-left">Borrower</th>
                  <th className="px-4 py-3 text-left">Program</th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-gray-900" onClick={() => toggleSort('amount')}>
                    Amount <SortIcon field="amount" />
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:text-gray-900" onClick={() => toggleSort('aiCompositeScore')}>
                    AI Score <SortIcon field="aiCompositeScore" />
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:text-gray-900" onClick={() => toggleSort('createdAt')}>
                    Days <SortIcon field="createdAt" />
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((loan: any) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/broker/loans/${loan.id}`} className="font-semibold text-indigo-600 hover:underline">
                        #{loan.loanNumber || loan.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {loan.borrower?.firstName} {loan.borrower?.lastName}
                      {loan.borrower?.email && (
                        <div className="text-xs text-gray-400">{loan.borrower.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{programLabel(loan.program)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{formatAmount(loan.amount)}</td>
                    <td className="px-4 py-3">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {loan.aiCompositeScore != null ? (
                        <span className={`font-bold ${loan.aiCompositeScore >= 70 ? 'text-emerald-600' : loan.aiCompositeScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {loan.aiCompositeScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{daysSince(loan.createdAt)}d</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/broker/loans/${loan.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
