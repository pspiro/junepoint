import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Brain,
  FileText,
  CheckSquare,
  Edit3,
  StickyNote,
  Download,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../lib/api';
import LoanStatusBadge from '../../components/LoanStatusBadge';
import clsx from 'clsx';

const RIGHT_TABS = [
  { id: 'ai', label: 'AI Report', icon: Brain },
  { id: 'conditions', label: 'Conditions', icon: CheckSquare },
  { id: 'loandata', label: 'Loan Data', icon: Edit3 },
  { id: 'notes', label: 'Notes', icon: StickyNote },
];

function ScoreBar({ label, value }: { label: string; value?: number }) {
  const pct = value ?? 0;
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={clsx('font-bold', pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500')}>
          {value ?? '—'}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatAmount(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function UWWorkspacePage() {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai');
  const [notes, setNotes] = useState('');

  const { data: loan, isLoading: loanLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}`).then((r) => r.data),
    enabled: !!loanId,
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['loan-documents', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/documents`).then((r) => r.data),
    enabled: !!loanId,
  });

  const { data: aiReport } = useQuery({
    queryKey: ['ai-analysis', loanId],
    queryFn: () => api.get(`/api/ai/analyses/${loanId}`).then((r) => r.data),
    enabled: activeTab === 'ai' && !!loanId,
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['loan-conditions', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/conditions`).then((r) => r.data),
    enabled: activeTab === 'conditions' && !!loanId,
  });

  if (loanLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loan) return <div className="p-6 text-red-500">Loan not found.</div>;

  const recColors: Record<string, string> = {
    APPROVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CONDITIONALLY_APPROVE: 'bg-blue-100 text-blue-700 border-blue-200',
    DECLINE: 'bg-red-100 text-red-700 border-red-200',
    REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  const recStyle = recColors[loan.aiRecommendation] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="p-6 max-w-full mx-auto space-y-4">
      {/* Header */}
      <div>
        <Link to="/underwriter/queue" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-3">
          <ArrowLeft className="w-4 h-4" /> Queue
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              Loan #{loan.loanNumber || loanId?.slice(0, 8).toUpperCase()}
            </h1>
            <LoanStatusBadge status={loan.status} />
            {loan.aiRecommendation && (
              <span className={clsx('text-xs font-semibold px-3 py-1 rounded-full border', recStyle)}>
                AI: {loan.aiRecommendation.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/underwriter/loans/${loanId}/decision`)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" /> Make Decision
            </button>
          </div>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-5" style={{ minHeight: '620px' }}>
        {/* Left: Document list */}
        <div className="w-72 flex-shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Documents ({documents.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {docsLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No documents uploaded yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{doc.type?.replace(/_/g, ' ')}</div>
                        {doc.aiClassification && (
                          <div className="text-xs text-indigo-600 mt-0.5">
                            AI: {doc.aiClassification.replace(/_/g, ' ')}
                          </div>
                        )}
                      </div>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 mt-0.5">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 inline-block',
                      doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500')}>
                      {doc.status || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Tabbed panel */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Tab bar */}
          <div className="border-b border-gray-100 bg-gray-50 flex">
            {RIGHT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* AI Report */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                {!aiReport ? (
                  <div className="text-center py-10">
                    <Brain className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No AI analysis available for this loan yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">AI Underwriting Report</h3>
                      <span className={clsx('text-sm font-bold px-3 py-1 rounded-full border', recStyle)}>
                        Recommendation: {aiReport.recommendation?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Composite Score</div>
                        <div className={clsx('text-4xl font-extrabold', aiReport.compositeScore >= 70 ? 'text-emerald-600' : aiReport.compositeScore >= 50 ? 'text-amber-600' : 'text-red-500')}>
                          {aiReport.compositeScore ?? '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">out of 100</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Document Completeness</div>
                        <div className="text-4xl font-extrabold text-indigo-600">{aiReport.completenessScore ?? '—'}%</div>
                        <div className="text-xs text-gray-500 mt-1">documents reviewed</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-4">Risk Factor Scores</h4>
                      <ScoreBar label="LTV Risk" value={aiReport.ltvScore} />
                      <ScoreBar label="DSCR Risk" value={aiReport.dscrScore} />
                      <ScoreBar label="Credit Risk" value={aiReport.creditScore} />
                      <ScoreBar label="Property Risk" value={aiReport.propertyScore} />
                      <ScoreBar label="Borrower Risk" value={aiReport.borrowerScore} />
                    </div>

                    {aiReport.reasoning && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" /> AI Reasoning
                        </h4>
                        <p className="text-sm text-indigo-800 leading-relaxed">{aiReport.reasoning}</p>
                      </div>
                    )}

                    {aiReport.riskFlags?.length > 0 && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Risk Flags
                        </h4>
                        <ul className="space-y-1">
                          {aiReport.riskFlags.map((flag: string, i: number) => (
                            <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                              <span className="text-amber-500 mt-0.5">•</span> {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Conditions */}
            {activeTab === 'conditions' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Conditions ({conditions.length})</h3>
                  <Link
                    to={`/underwriter/loans/${loanId}/conditions`}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Manage conditions →
                  </Link>
                </div>
                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No conditions added yet.</div>
                ) : (
                  <div className="space-y-3">
                    {conditions.map((cond: any) => (
                      <div key={cond.id} className={clsx('border rounded-xl p-4', cond.status === 'CLEARED' ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50')}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{cond.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {cond.type} • Party: {cond.responsibleParty}
                            </div>
                          </div>
                          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0', cond.status === 'CLEARED' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800')}>
                            {cond.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loan Data */}
            {activeTab === 'loandata' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Loan Data</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Program', value: loan.program?.replace(/_/g, ' ') },
                    { label: 'Amount', value: formatAmount(loan.amount) },
                    { label: 'Purpose', value: loan.purpose?.replace(/_/g, ' ') },
                    { label: 'LTV', value: loan.ltv ? `${loan.ltv}%` : '—' },
                    { label: 'Term', value: loan.term ? `${loan.term} mo` : '—' },
                    { label: 'Rate', value: loan.interestRate ? `${loan.interestRate}%` : '—' },
                    { label: 'Property Address', value: loan.property?.address },
                    { label: 'Property Type', value: loan.property?.type?.replace(/_/g, ' ') },
                    { label: 'Est. Value', value: formatAmount(loan.property?.value) },
                    { label: 'Monthly Rent', value: loan.monthlyRent ? formatAmount(loan.monthlyRent) : '—' },
                    { label: 'Borrower', value: `${loan.borrower?.firstName || ''} ${loan.borrower?.lastName || ''}`.trim() },
                    { label: 'Broker', value: `${loan.broker?.firstName || ''} ${loan.broker?.lastName || ''}`.trim() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-gray-500 font-medium text-xs uppercase tracking-wide">{label}</dt>
                      <dd className="text-gray-900 font-semibold mt-0.5">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Underwriter Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={12}
                  placeholder="Add your analysis notes here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Save Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision buttons */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-semibold text-gray-700">Underwriting Decision:</div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/underwriter/loans/${loanId}/decision?recommend=APPROVE`)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <ThumbsUp className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => navigate(`/underwriter/loans/${loanId}/decision?recommend=CONDITIONALLY_APPROVE`)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> Conditionally Approve
          </button>
          <button
            onClick={() => navigate(`/underwriter/loans/${loanId}/decision?recommend=DECLINE`)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <ThumbsDown className="w-4 h-4" /> Decline
          </button>
          <button
            onClick={() => navigate(`/underwriter/loans/${loanId}/decision?recommend=SUSPEND`)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <PauseCircle className="w-4 h-4" /> Suspend
          </button>
        </div>
      </div>
    </div>
  );
}
