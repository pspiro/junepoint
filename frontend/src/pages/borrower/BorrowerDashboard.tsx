import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LoanStatusBadge from '../../components/LoanStatusBadge';
import clsx from 'clsx';

const LIFECYCLE_STAGES = [
  { key: 'DRAFT', label: 'Application' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'IN_REVIEW', label: 'Under Review' },
  { key: 'CONDITIONALLY_APPROVED', label: 'Cond. Approved' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'IN_CLOSING', label: 'In Closing' },
  { key: 'CLOSED', label: 'Funded' },
];

function getStageIndex(status: string) {
  return LIFECYCLE_STAGES.findIndex((s) => s.key === status);
}

function formatAmount(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function BorrowerDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['borrower-loans'],
    queryFn: () => api.get('/api/loans').then((r) => r.data),
  });

  const loan = loans[0] ?? null;
  const stageIdx = loan ? getStageIndex(loan.status) : -1;
  const declined = ['DECLINED', 'SUSPENDED'].includes(loan?.status);

  const { data: documents = [] } = useQuery({
    queryKey: ['borrower-documents', loan?.id],
    queryFn: () => api.get(`/api/loans/${loan.id}/documents`).then((r) => r.data),
    enabled: !!loan?.id,
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['borrower-conditions', loan?.id],
    queryFn: () => api.get(`/api/loans/${loan.id}/conditions`).then((r) => r.data),
    enabled: !!loan?.id,
  });

  const pendingConditions = conditions.filter((c: any) => c.status !== 'CLEARED' && c.responsibleParty === 'BORROWER');
  const uploadedDocs = documents.filter((d: any) => d.status !== 'MISSING');

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}</h1>
        <p className="text-gray-500 text-sm">Here's the latest on your loan application.</p>
      </div>

      {!loan ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="font-semibold text-gray-700 mb-1">No active loan</h2>
          <p className="text-gray-400 text-sm">Your broker will create a loan application for you. Check back soon.</p>
        </div>
      ) : (
        <>
          {/* Loan Status Progress */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-gray-900 text-lg">
                    Loan #{loan.loanNumber || loan.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <LoanStatusBadge status={loan.status} />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{loan.program?.replace(/_/g, ' ')} • {formatAmount(loan.amount)}</p>
              </div>
            </div>

            {declined ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Loan {loan.status === 'DECLINED' ? 'Declined' : 'Suspended'}</div>
                  <div className="opacity-80 mt-0.5">Please contact your broker for more information.</div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-start justify-between relative z-10">
                  {LIFECYCLE_STAGES.map((stage, idx) => {
                    const isCompleted = idx < stageIdx;
                    const isCurrent = idx === stageIdx;
                    return (
                      <div key={stage.key} className="flex flex-col items-center flex-1">
                        <div className={clsx(
                          'w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all',
                          isCompleted ? 'bg-emerald-500 border-emerald-500' :
                          isCurrent ? 'bg-indigo-600 border-indigo-600 ring-4 ring-indigo-100' :
                          'bg-white border-gray-200'
                        )}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : isCurrent ? (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          ) : (
                            <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                          )}
                        </div>
                        <span className={clsx('text-xs text-center leading-tight', isCurrent ? 'font-bold text-indigo-600' : isCompleted ? 'text-emerald-600 font-medium' : 'text-gray-400')}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Connector line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 -z-0">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: stageIdx > 0 ? `${(stageIdx / (LIFECYCLE_STAGES.length - 1)) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Items + Doc Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Action Items
              </h3>
              {pendingConditions.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-500">No actions required from you right now.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {pendingConditions.map((c: any) => (
                    <li key={c.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl text-sm">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-800">{c.description}</div>
                        {c.dueDate && <div className="text-xs text-gray-500 mt-0.5">Due: {new Date(c.dueDate).toLocaleDateString()}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/borrower/documents"
                className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Manage documents <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Document Status
              </h3>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Upload progress</span>
                  <span className="font-semibold text-gray-900">{uploadedDocs.length} / {documents.length}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: documents.length ? `${(uploadedDocs.length / documents.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              <Link
                to="/borrower/documents"
                className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Upload Documents
              </Link>
            </div>
          </div>

          {/* Broker Contact */}
          {loan.broker && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Your Broker</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{loan.broker.firstName} {loan.broker.lastName}</div>
                  <div className="text-sm text-gray-500">{loan.broker.companyName}</div>
                </div>
                <div className="flex items-center gap-3">
                  {loan.broker.email && (
                    <a href={`mailto:${loan.broker.email}`} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {loan.broker.phone && (
                    <a href={`tel:${loan.broker.phone}`} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
