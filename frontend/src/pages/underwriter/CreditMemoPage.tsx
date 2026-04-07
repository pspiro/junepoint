import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import api from '../../lib/api';
import LoanStatusBadge from '../../components/LoanStatusBadge';
import clsx from 'clsx';

const DECISIONS = [
  { value: 'APPROVE', label: 'Approve', color: 'border-emerald-400 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  { value: 'CONDITIONALLY_APPROVE', label: 'Conditionally Approve', color: 'border-blue-400 bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  { value: 'DECLINE', label: 'Decline', color: 'border-red-400 bg-red-50 text-red-700', dot: 'bg-red-500' },
  { value: 'SUSPEND', label: 'Suspend', color: 'border-amber-400 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
];

export default function CreditMemoPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDecision = searchParams.get('recommend') || '';

  const [memo, setMemo] = useState('');
  const [decision, setDecision] = useState(initialDecision);
  const [overrideReason, setOverrideReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: loan } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}`).then((r) => r.data),
    enabled: !!loanId,
  });

  const { data: aiReport } = useQuery({
    queryKey: ['ai-analysis', loanId],
    queryFn: () => api.get(`/api/ai/analyses/${loanId}`).then((r) => r.data),
    enabled: !!loanId,
  });

  // Pre-populate memo from AI
  useEffect(() => {
    if (aiReport?.creditMemo && !memo) {
      setMemo(aiReport.creditMemo);
    }
  }, [aiReport]);

  const submitDecision = useMutation({
    mutationFn: () =>
      api.post(`/api/loans/${loanId}/underwriting/decision`, {
        decision,
        creditMemo: memo,
        overrideReason: overrideReason || undefined,
      }),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => navigate('/underwriter/queue'), 2000);
    },
  });

  const aiRec = loan?.aiRecommendation || aiReport?.recommendation;
  const isDifferentFromAI = decision && aiRec && decision !== aiRec;

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Decision Submitted</h2>
          <p className="text-gray-500 text-sm">Redirecting to queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <Link
          to={`/underwriter/loans/${loanId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Credit Memo & Decision</h1>
          {loan && <LoanStatusBadge status={loan.status} />}
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Loan #{loan?.loanNumber || loanId?.slice(0, 8).toUpperCase()} •{' '}
          {loan?.borrower?.firstName} {loan?.borrower?.lastName}
        </p>
      </div>

      {/* AI Recommendation Banner */}
      {aiRec && (
        <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">AI Recommendation</div>
            <div className="font-bold text-indigo-900">{aiRec.replace(/_/g, ' ')}</div>
          </div>
          {aiReport?.compositeScore != null && (
            <div className="ml-auto text-right">
              <div className="text-xs text-indigo-500 font-medium">Composite Score</div>
              <div className={clsx('text-2xl font-extrabold', aiReport.compositeScore >= 70 ? 'text-emerald-600' : aiReport.compositeScore >= 50 ? 'text-amber-600' : 'text-red-500')}>
                {aiReport.compositeScore}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credit Memo */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Credit Memo</h2>
          {aiReport?.creditMemo && (
            <button
              onClick={() => setMemo(aiReport.creditMemo)}
              className="text-xs text-indigo-600 font-medium border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
            >
              <Brain className="w-3.5 h-3.5" /> Load from AI
            </button>
          )}
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={12}
          placeholder="Write your credit analysis and rationale here. This will be part of the permanent loan record."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-gray-400">{memo.length} characters</p>
      </div>

      {/* Decision Selector */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Underwriting Decision</h2>
        <div className="grid grid-cols-2 gap-3">
          {DECISIONS.map((d) => (
            <label
              key={d.value}
              className={clsx(
                'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                decision === d.value ? d.color : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <input
                type="radio"
                name="decision"
                value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
                className="sr-only"
              />
              <div className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center', decision === d.value ? 'border-current' : 'border-gray-300')}>
                {decision === d.value && <div className={clsx('w-2 h-2 rounded-full', d.dot)} />}
              </div>
              <span className="font-semibold text-sm">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Override Reason */}
      {isDifferentFromAI && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Your decision differs from the AI recommendation ({aiRec?.replace(/_/g, ' ')})</span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-1.5">Override Reason (required)</label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={3}
              placeholder="Explain why your decision differs from the AI recommendation..."
              className="w-full px-4 py-2.5 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => submitDecision.mutate()}
        disabled={
          !decision ||
          !memo.trim() ||
          (isDifferentFromAI && !overrideReason.trim()) ||
          submitDecision.isPending
        }
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        {submitDecision.isPending ? (
          <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Submitting...</>
        ) : (
          <><Send className="w-5 h-5" /> Submit Decision</>
        )}
      </button>
    </div>
  );
}
