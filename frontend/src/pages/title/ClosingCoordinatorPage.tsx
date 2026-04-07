import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, DollarSign, AlertCircle, Save } from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const CTC_ITEMS = [
  { key: 'titleCommitment', label: 'Title Commitment Issued' },
  { key: 'titleExam', label: 'Title Exam Complete' },
  { key: 'liensCleared', label: 'Liens & Encumbrances Cleared' },
  { key: 'hazardInsurance', label: 'Hazard Insurance Confirmed' },
  { key: 'floodCert', label: 'Flood Zone Certification' },
  { key: 'surveyReceived', label: 'Survey Received' },
  { key: 'closingDisclosureSent', label: 'Closing Disclosure Sent (3-day wait)' },
  { key: 'wireInstructionsVerified', label: 'Wire Instructions Verified' },
  { key: 'signingScheduled', label: 'Signing Appointment Scheduled' },
  { key: 'recordingReadied', label: 'Recording Package Prepared' },
];

export default function ClosingCoordinatorPage() {
  const [searchParams] = useSearchParams();
  const loanId = searchParams.get('loanId');
  const qc = useQueryClient();

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [wire, setWire] = useState({ amount: '', date: '', reference: '' });
  const [fundSuccess, setFundSuccess] = useState(false);
  const [fundError, setFundError] = useState('');

  const { data: closingLoans = [] } = useQuery({
    queryKey: ['title-closing-loans'],
    queryFn: () => api.get('/api/loans?status=IN_CLOSING').then((r) => r.data),
  });

  const selectedLoan = loanId
    ? closingLoans.find((l: any) => l.id === loanId) || closingLoans[0]
    : closingLoans[0];

  const { data: closingData } = useQuery({
    queryKey: ['closing', selectedLoan?.id],
    queryFn: () => api.get(`/api/loans/${selectedLoan.id}/closing`).then((r) => r.data),
    enabled: !!selectedLoan?.id,
    onSuccess: (data: any) => {
      if (data?.checklist) setChecklist(data.checklist);
    },
  } as any);

  const saveChecklist = useMutation({
    mutationFn: () =>
      api.put(`/api/loans/${selectedLoan?.id}/closing`, { checklist }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['closing', selectedLoan?.id] }),
  });

  const fundLoan = useMutation({
    mutationFn: () =>
      api.post(`/api/loans/${selectedLoan?.id}/closing/fund`, {
        wireAmount: parseFloat(wire.amount),
        wireDate: wire.date,
        wireReference: wire.reference,
      }),
    onSuccess: () => {
      setFundSuccess(true);
      qc.invalidateQueries({ queryKey: ['title-closing-loans'] });
    },
    onError: (err: any) => {
      setFundError(err.response?.data?.message || 'Failed to fund loan.');
    },
  });

  const toggle = (key: string) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  const closingAny = closingData as any;
  const checkedCount = CTC_ITEMS.filter((i) => checklist[i.key] || closingAny?.checklist?.[i.key]).length;
  const allChecked = checkedCount === CTC_ITEMS.length;

  const fieldClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Closing Coordinator</h1>
        {selectedLoan && (
          <p className="text-gray-500 text-sm">
            Loan #{selectedLoan.loanNumber || selectedLoan.id.slice(0, 8)} •{' '}
            {selectedLoan.borrower?.firstName} {selectedLoan.borrower?.lastName}
          </p>
        )}
      </div>

      {!selectedLoan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          No loans currently in closing. Check back when a loan is approved and moving to close.
        </div>
      )}

      {selectedLoan && (
        <>
          {/* Loan selector if multiple */}
          {closingLoans.length > 1 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Select Loan</label>
              <select
                value={selectedLoan.id}
                onChange={(e) => window.history.pushState({}, '', `?loanId=${e.target.value}`)}
                className={fieldClass}
              >
                {closingLoans.map((l: any) => (
                  <option key={l.id} value={l.id}>
                    #{l.loanNumber || l.id.slice(0, 8)} — {l.borrower?.firstName} {l.borrower?.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CTC Checklist */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Clear to Close (CTC) Checklist</h2>
                <p className="text-xs text-gray-500 mt-0.5">{checkedCount} / {CTC_ITEMS.length} items completed</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all', allChecked ? 'bg-emerald-500' : 'bg-indigo-600')}
                    style={{ width: `${(checkedCount / CTC_ITEMS.length) * 100}%` }}
                  />
                </div>
                {allChecked && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {CTC_ITEMS.map((item) => {
                const checked = checklist[item.key] || closingAny?.checklist?.[item.key];
                return (
                  <label key={item.key} className={clsx('flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors', checked ? 'bg-emerald-50/30' : '')}>
                    <div className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all', checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white')}>
                      {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={!!checked} onChange={() => toggle(item.key)} />
                    <span className={clsx('text-sm', checked ? 'line-through text-gray-400' : 'text-gray-700 font-medium')}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => saveChecklist.mutate()}
                disabled={saveChecklist.isPending}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" /> Save Checklist
              </button>
            </div>
          </div>

          {/* Wire Confirmation */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Wire Confirmation
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Wire Amount ($)</label>
                <input
                  type="number"
                  value={wire.amount}
                  onChange={(e) => setWire((w) => ({ ...w, amount: e.target.value }))}
                  placeholder="500000"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Wire Date</label>
                <input
                  type="date"
                  value={wire.date}
                  onChange={(e) => setWire((w) => ({ ...w, date: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Reference #</label>
                <input
                  type="text"
                  value={wire.reference}
                  onChange={(e) => setWire((w) => ({ ...w, reference: e.target.value }))}
                  placeholder="WIRE-2026-001"
                  className={fieldClass}
                />
              </div>
            </div>

            {fundError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {fundError}
              </div>
            )}

            {fundSuccess ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">Loan funded successfully!</span>
              </div>
            ) : (
              <button
                onClick={() => fundLoan.mutate()}
                disabled={!allChecked || !wire.amount || !wire.date || fundLoan.isPending}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
              >
                <DollarSign className="w-5 h-5" />
                {!allChecked ? 'Complete CTC Checklist to Fund' : 'Fund Loan'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
