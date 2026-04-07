import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, DollarSign } from 'lucide-react';
import api from '../../lib/api';

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function DataRoomPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const qc = useQueryClient();
  const [bidAmount, setBidAmount] = useState('');
  const [bidTerms, setBidTerms] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['marketplace', loanId],
    queryFn: () => api.get(`/api/marketplace/${loanId}`).then(r => r.data),
  });

  const { data: docs } = useQuery({
    queryKey: ['documents', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/documents`).then(r => r.data),
    enabled: !!loanId,
  });

  const bidMutation = useMutation({
    mutationFn: (body: { bidAmount: number; terms?: string }) =>
      api.post(`/api/marketplace/${loanId}/bid`, body).then(r => r.data),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading…</div>;
  if (!listing) return <div className="text-center py-16 text-gray-400">Listing not found</div>;

  const { loan } = listing;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/investor/marketplace" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Due Diligence</h1>
          <p className="text-gray-500 text-sm mt-0.5">{loan?.program?.replace(/_/g, ' ')} · {fmt(listing.askingPrice)} asking</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Financial metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Financial Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Loan Amount', value: fmt(loan?.loanAmount || 0) },
                { label: 'LTV', value: loan?.ltv ? `${loan.ltv}%` : '—' },
                { label: 'DSCR', value: loan?.dscr ? loan.dscr.toFixed(2) : '—' },
                { label: 'Yield', value: `${(listing.yield * 100).toFixed(1)}%` },
                { label: 'Program', value: loan?.program?.replace(/_/g, ' ') || '—' },
                { label: 'Term', value: loan?.termMonths ? `${loan.termMonths}mo` : '—' },
                { label: 'Interest Rate', value: loan?.interestRate ? `${(loan.interestRate * 100).toFixed(2)}%` : '—' },
                { label: 'Asking Price', value: fmt(listing.askingPrice) },
              ].map(m => (
                <div key={m.label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{m.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Property */}
          {loan?.propertyAddress && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Property</h2>
              <p className="text-sm text-gray-700">{loan.propertyAddress}, {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}</p>
              <p className="text-sm text-gray-500 mt-1">{loan.propertyType} · {loan.occupancyType}</p>
            </div>
          )}

          {/* AI summary */}
          {listing.aiSummary && (
            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
              <h2 className="font-semibold text-indigo-900 mb-2">AI Investment Summary</h2>
              <p className="text-sm text-indigo-800 leading-relaxed">{listing.aiSummary}</p>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Available Documents</h2>
            {(docs?.documents || []).length === 0 ? (
              <p className="text-sm text-gray-400">No documents available</p>
            ) : (
              <div className="space-y-2">
                {(docs?.documents || []).map((d: any) => (
                  <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{d.fileName}</span>
                    <span className="text-xs text-gray-400">{d.aiClassification || d.docType || 'Other'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bid panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Submit Bid</h2>
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-medium text-gray-900">Bid Submitted</p>
                <p className="text-sm text-gray-500 mt-1">We'll notify you of any updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bid Amount ($)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    placeholder={String(listing.askingPrice)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Terms (optional)</label>
                  <textarea
                    value={bidTerms}
                    onChange={e => setBidTerms(e.target.value)}
                    rows={3}
                    placeholder="Any special terms or conditions..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button
                  onClick={() => bidMutation.mutate({ bidAmount: Number(bidAmount), terms: bidTerms || undefined })}
                  disabled={!bidAmount || bidMutation.isPending}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {bidMutation.isPending ? 'Submitting…' : 'Submit Bid'}
                </button>
                {bidMutation.isError && <p className="text-xs text-red-600">Failed to submit bid. Please try again.</p>}
              </div>
            )}
          </div>

          {/* Asking price summary */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Asking Price</span>
              <span className="font-medium text-gray-900">{fmt(listing.askingPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Yield</span>
              <span className="font-medium text-emerald-600">{(listing.yield * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Listed</span>
              <span className="font-medium text-gray-900">{new Date(listing.listedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
