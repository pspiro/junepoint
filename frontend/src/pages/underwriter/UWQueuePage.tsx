import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Brain, Clock, ArrowRight, Inbox } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LoanStatusBadge from '../../components/LoanStatusBadge';
import clsx from 'clsx';

function formatAmount(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function AiRecommendationBadge({ rec }: { rec?: string }) {
  if (!rec) return <span className="text-gray-400 text-xs">—</span>;
  const map: Record<string, string> = {
    APPROVE: 'bg-emerald-100 text-emerald-700',
    CONDITIONALLY_APPROVE: 'bg-blue-100 text-blue-700',
    DECLINE: 'bg-red-100 text-red-700',
    REVIEW: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', map[rec] || 'bg-gray-100 text-gray-600')}>
      {rec.replace(/_/g, ' ')}
    </span>
  );
}

function LoanTable({ loans, onOpen, actionLabel }: { loans: any[]; onOpen: (id: string) => void; actionLabel: string }) {
  if (loans.length === 0) {
    return (
      <div className="text-center py-10">
        <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No loans in this queue.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Loan #</th>
            <th className="px-4 py-3 text-left">Borrower</th>
            <th className="px-4 py-3 text-left">Program</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">AI Score</th>
            <th className="px-4 py-3 text-left">AI Rec.</th>
            <th className="px-4 py-3 text-right">Days</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loans.map((loan: any) => (
            <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-indigo-600">
                #{loan.loanNumber || loan.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {loan.borrower?.firstName} {loan.borrower?.lastName}
              </td>
              <td className="px-4 py-3 text-gray-500">{loan.program?.replace(/_/g, ' ') || '—'}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatAmount(loan.amount)}</td>
              <td className="px-4 py-3 text-right">
                {loan.aiCompositeScore != null ? (
                  <span className={clsx('font-bold', loan.aiCompositeScore >= 70 ? 'text-emerald-600' : loan.aiCompositeScore >= 50 ? 'text-amber-600' : 'text-red-500')}>
                    {loan.aiCompositeScore}
                  </span>
                ) : <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3">
                <AiRecommendationBadge rec={loan.aiRecommendation} />
              </td>
              <td className="px-4 py-3 text-right text-gray-500">{daysSince(loan.createdAt)}d</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onOpen(loan.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UWQueuePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: submitted = [], isLoading: loadingSubmitted } = useQuery({
    queryKey: ['uw-queue-submitted'],
    queryFn: () => api.get('/api/loans?status=SUBMITTED').then((r) => r.data),
  });

  const { data: inReview = [], isLoading: loadingReview } = useQuery({
    queryKey: ['uw-queue-in-review'],
    queryFn: () => api.get('/api/loans?status=IN_REVIEW').then((r) => r.data),
  });

  const myActive = inReview.filter((l: any) => l.assignedUwId === user?.id);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Underwriting Queue</h1>
        <p className="text-gray-500 text-sm">Review and claim loan files for underwriting analysis.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Queue', value: submitted.length, icon: Inbox, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'My Active Reviews', value: myActive.length, icon: ClipboardList, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg Days in Queue', value: submitted.length ? Math.round(submitted.reduce((s: number, l: any) => s + daysSince(l.createdAt), 0) / submitted.length) + 'd' : '—', icon: Clock, color: 'text-amber-600 bg-amber-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', kpi.color)}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="text-xs text-gray-500 font-medium">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My Active Reviews */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Brain className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-gray-900">My Active Reviews ({myActive.length})</h2>
        </div>
        {loadingReview ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <LoanTable loans={myActive} onOpen={(id) => navigate(`/underwriter/loans/${id}`)} actionLabel="Open" />
        )}
      </div>

      {/* Submission Queue */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Inbox className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-gray-900">All Submitted Loans ({submitted.length})</h2>
        </div>
        {loadingSubmitted ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <LoanTable loans={submitted} onOpen={(id) => navigate(`/underwriter/loans/${id}`)} actionLabel="Claim" />
        )}
      </div>
    </div>
  );
}
