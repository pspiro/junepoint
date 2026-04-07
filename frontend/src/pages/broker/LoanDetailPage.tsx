import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Clock,
  CheckSquare,
  Upload,
  Send,
  Download,
  Calendar,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LoanStatusBadge from '../../components/LoanStatusBadge';
import clsx from 'clsx';

function formatAmount(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Upload },
  { id: 'conditions', label: 'Conditions', icon: CheckSquare },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export default function LoanDetailPage() {
  const { loanId } = useParams<{ loanId: string }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [messageText, setMessageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: loan, isLoading: loanLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}`).then((r) => r.data),
    enabled: !!loanId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['loan-documents', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/documents`).then((r) => r.data),
    enabled: activeTab === 'documents' && !!loanId,
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['loan-conditions', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/conditions`).then((r) => r.data),
    enabled: activeTab === 'conditions' && !!loanId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['loan-messages', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/messages`).then((r) => r.data),
    enabled: activeTab === 'messages' && !!loanId,
    refetchInterval: activeTab === 'messages' ? 15000 : false,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['loan-events', loanId],
    queryFn: () => api.get(`/api/loans/${loanId}/events`).then((r) => r.data),
    enabled: activeTab === 'timeline' && !!loanId,
  });

  const sendMessage = useMutation({
    mutationFn: (text: string) => api.post(`/api/loans/${loanId}/messages`, { content: text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan-messages', loanId] });
      setMessageText('');
    },
  });

  if (loanLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading loan...</p>
        </div>
      </div>
    );
  }

  if (!loan) return <div className="p-6 text-red-500">Loan not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <Link to="/broker/pipeline" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Pipeline
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Loan #{loan.loanNumber || loanId?.slice(0, 8).toUpperCase()}
              </h1>
              <LoanStatusBadge status={loan.status} />
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {loan.program?.replace(/_/g, ' ')} • {formatAmount(loan.amount)} •{' '}
              {loan.property?.city}, {loan.property?.state}
            </p>
          </div>
          {loan.aiCompositeScore != null && (
            <div className="text-center bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3">
              <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">AI Score</div>
              <div className={clsx('text-3xl font-extrabold', loan.aiCompositeScore >= 70 ? 'text-emerald-600' : loan.aiCompositeScore >= 50 ? 'text-amber-600' : 'text-red-500')}>
                {loan.aiCompositeScore}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'conditions' && conditions.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {conditions.filter((c: any) => c.status !== 'CLEARED').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Loan Summary</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Program', value: loan.program?.replace(/_/g, ' ') },
                  { label: 'Loan Amount', value: formatAmount(loan.amount) },
                  { label: 'Purpose', value: loan.purpose },
                  { label: 'Term', value: loan.term ? `${loan.term} months` : '—' },
                  { label: 'Interest Rate', value: loan.interestRate ? `${loan.interestRate}%` : '—' },
                  { label: 'LTV', value: loan.ltv ? `${loan.ltv}%` : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-gray-500 font-medium">{label}</dt>
                    <dd className="text-gray-900 font-semibold mt-0.5">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Property Information</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Address', value: loan.property?.address },
                  { label: 'City / State', value: `${loan.property?.city || ''}, ${loan.property?.state || ''}` },
                  { label: 'Zip', value: loan.property?.zip },
                  { label: 'Type', value: loan.property?.type },
                  { label: 'Estimated Value', value: formatAmount(loan.property?.value) },
                  { label: 'Monthly Rent', value: loan.monthlyRent ? formatAmount(loan.monthlyRent) : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-gray-500 font-medium">{label}</dt>
                    <dd className="text-gray-900 font-semibold mt-0.5">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Borrower</h3>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-gray-900 text-base">
                  {loan.borrower?.firstName} {loan.borrower?.lastName}
                </div>
                <div className="text-gray-500">{loan.borrower?.email}</div>
                <div className="text-gray-500">{loan.borrower?.phone}</div>
              </div>
            </div>
            {loan.aiCompositeScore != null && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">AI Risk Scores</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'LTV Risk', value: loan.aiLtvScore },
                    { label: 'DSCR Risk', value: loan.aiDscrScore },
                    { label: 'Credit Risk', value: loan.aiCreditScore },
                    { label: 'Property Risk', value: loan.aiPropertyScore },
                    { label: 'Borrower Risk', value: loan.aiBorrowerScore },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className={clsx('font-bold', value >= 70 ? 'text-emerald-600' : value >= 50 ? 'text-amber-600' : 'text-red-500')}>
                        {value ?? '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Documents ({documents.length})</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
            <input ref={fileInputRef} type="file" className="hidden" multiple />
          </div>
          {documents.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No documents uploaded yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="pb-2 text-left">Name</th>
                  <th className="pb-2 text-left">Type</th>
                  <th className="pb-2 text-left">Status</th>
                  <th className="pb-2 text-left">Uploaded</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{doc.name}</td>
                    <td className="py-3 text-gray-500">{doc.type?.replace(/_/g, ' ')}</td>
                    <td className="py-3">
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Conditions Tab */}
      {activeTab === 'conditions' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Conditions ({conditions.length})</h3>
          {conditions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No conditions set.</div>
          ) : (
            <div className="space-y-3">
              {conditions.map((cond: any) => (
                <div key={cond.id} className={clsx('border rounded-xl p-4', cond.status === 'CLEARED' ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-amber-50')}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{cond.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Responsible: {cond.responsibleParty} • Due: {cond.dueDate ? new Date(cond.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0', cond.status === 'CLEARED' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800')}>
                      {cond.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col" style={{ height: '520px' }}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No messages yet. Start the conversation.</div>
            ) : (
              messages.map((msg: any) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={clsx('max-w-sm rounded-2xl px-4 py-2.5 text-sm', isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900')}>
                      {!isMe && <div className="text-xs font-semibold mb-1 opacity-70">{msg.sender?.firstName} {msg.sender?.lastName}</div>}
                      <div>{msg.content}</div>
                      <div className={clsx('text-xs mt-1 opacity-60', isMe ? 'text-right' : '')}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-4 border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (messageText.trim()) sendMessage.mutate(messageText.trim());
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sendMessage.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-2.5 rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Timeline</h3>
          {events.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No timeline events yet.</div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-4">
                {events.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white ring-2 ring-indigo-100 flex items-center justify-center flex-shrink-0 relative z-10">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="font-semibold text-gray-900 text-sm">{event.description || event.type}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(event.createdAt).toLocaleString()} • {event.actor?.firstName} {event.actor?.lastName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
