import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, FileText, AlertCircle, Eye } from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const CLOSING_DOCS = [
  {
    key: 'closingDisclosure',
    label: 'Closing Disclosure',
    description: 'Review the final loan terms, closing costs, and cash-to-close amounts.',
  },
  {
    key: 'promissoryNote',
    label: 'Promissory Note',
    description: 'Your promise to repay the loan. Review all repayment terms carefully.',
  },
  {
    key: 'deedOfTrust',
    label: 'Deed of Trust / Mortgage',
    description: 'This document pledges the property as collateral for the loan.',
  },
  {
    key: 'rightOfRescission',
    label: 'Right of Rescission',
    description: 'Your right to cancel the loan within 3 business days (refinances only).',
  },
  {
    key: 'hazardInsurance',
    label: 'Hazard Insurance Acknowledgment',
    description: 'Confirmation of required property insurance coverage.',
  },
];

export default function ClosingReviewPage() {
  const qc = useQueryClient();
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const { data: loans = [] } = useQuery({
    queryKey: ['borrower-loans'],
    queryFn: () => api.get('/api/loans').then((r) => r.data),
  });
  const loan = loans[0];

  const { data: closingData, isLoading } = useQuery({
    queryKey: ['closing', loan?.id],
    queryFn: () => api.get(`/api/loans/${loan.id}/closing`).then((r) => r.data),
    enabled: !!loan?.id,
  });

  const acknowledgeDoc = useMutation({
    mutationFn: (docKey: string) =>
      api.post(`/api/loans/${loan.id}/closing/acknowledge`, { document: docKey }),
    onSuccess: (_data, docKey) => {
      setAcknowledged((prev) => ({ ...prev, [docKey]: true }));
      qc.invalidateQueries({ queryKey: ['closing', loan?.id] });
    },
  });

  const allAcknowledged = CLOSING_DOCS.every((d) => acknowledged[d.key] || closingData?.acknowledgments?.[d.key]);
  const acknowledgedCount = CLOSING_DOCS.filter((d) => acknowledged[d.key] || closingData?.acknowledgments?.[d.key]).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Closing Review</h1>
        <p className="text-gray-500 text-sm">Review and acknowledge each closing document before your closing date.</p>
      </div>

      {/* Status */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Documents Reviewed</span>
          <span className={clsx('text-sm font-bold', allAcknowledged ? 'text-emerald-600' : 'text-indigo-600')}>
            {acknowledgedCount} / {CLOSING_DOCS.length}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', allAcknowledged ? 'bg-emerald-500' : 'bg-indigo-600')}
            style={{ width: `${(acknowledgedCount / CLOSING_DOCS.length) * 100}%` }}
          />
        </div>
        {allAcknowledged && (
          <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> All documents acknowledged — you're ready to close!
          </div>
        )}
      </div>

      {loan?.status !== 'IN_CLOSING' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Closing documents not yet available</div>
            <div className="opacity-80 mt-0.5">Your loan must be approved and in the closing stage before documents are ready for review.</div>
          </div>
        </div>
      )}

      {/* Document list */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {CLOSING_DOCS.map((doc) => {
            const isAcknowledged = acknowledged[doc.key] || closingData?.acknowledgments?.[doc.key];
            const closingDoc = closingData?.documents?.[doc.key];
            return (
              <div key={doc.key} className={clsx('px-5 py-4', isAcknowledged ? 'bg-emerald-50/50' : '')}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={clsx('mt-0.5 flex-shrink-0', isAcknowledged ? 'text-emerald-500' : 'text-gray-300')}>
                      {isAcknowledged ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{doc.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{doc.description}</div>
                      {isAcknowledged && (
                        <div className="text-xs text-emerald-600 font-medium mt-1">Acknowledged</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {closingDoc?.url && (
                      <a
                        href={closingDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </a>
                    )}
                    {!isAcknowledged ? (
                      <button
                        onClick={() => acknowledgeDoc.mutate(doc.key)}
                        disabled={acknowledgeDoc.isPending || loan?.status !== 'IN_CLOSING'}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Acknowledge
                      </button>
                    ) : (
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">
                        Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {allAcknowledged && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-emerald-900 text-lg mb-1">Ready to Close</h3>
          <p className="text-emerald-700 text-sm">
            You've reviewed all closing documents. Your title company will be in touch to schedule your closing date.
          </p>
        </div>
      )}
    </div>
  );
}
