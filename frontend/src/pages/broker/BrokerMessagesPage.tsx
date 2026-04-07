import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Search } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import LoanStatusBadge from '../../components/LoanStatusBadge';
import clsx from 'clsx';

export default function BrokerMessagesPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');

  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ['broker-loans'],
    queryFn: () => api.get('/api/loans').then((r) => r.data),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['loan-messages', selectedLoanId],
    queryFn: () => api.get(`/api/loans/${selectedLoanId}/messages`).then((r) => r.data),
    enabled: !!selectedLoanId,
    refetchInterval: 15000,
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post(`/api/loans/${selectedLoanId}/messages`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loan-messages', selectedLoanId] });
      setMessageText('');
    },
  });

  const activeLoan = loans.find((l: any) => l.id === selectedLoanId);
  const filteredLoans = loans.filter((l: any) => {
    const q = search.toLowerCase();
    return !q || (l.loanNumber || '').toLowerCase().includes(q) ||
      (l.borrower?.firstName || '').toLowerCase().includes(q) ||
      (l.borrower?.lastName || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm">Communicate with your team on each loan file</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex" style={{ height: '600px' }}>
        {/* Left: Loan list */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search loans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loansLoading ? (
              <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
            ) : filteredLoans.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">No loans found</div>
            ) : (
              filteredLoans.map((loan: any) => (
                <button
                  key={loan.id}
                  onClick={() => setSelectedLoanId(loan.id)}
                  className={clsx(
                    'w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                    selectedLoanId === loan.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      #{loan.loanNumber || loan.id.slice(0, 8)}
                    </span>
                    <LoanStatusBadge status={loan.status} />
                  </div>
                  <div className="text-xs text-gray-500">
                    {loan.borrower?.firstName} {loan.borrower?.lastName}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message thread */}
        {!selectedLoanId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a loan to view messages</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Thread header */}
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="font-semibold text-gray-900 text-sm">
                Loan #{activeLoan?.loanNumber || selectedLoanId.slice(0, 8)}
              </div>
              <div className="text-xs text-gray-500">
                {activeLoan?.borrower?.firstName} {activeLoan?.borrower?.lastName} •{' '}
                {activeLoan?.program?.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="text-center py-8 text-sm text-gray-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={clsx('max-w-xs rounded-2xl px-4 py-2.5 text-sm', isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900')}>
                        {!isMe && (
                          <div className="text-xs font-semibold mb-1 opacity-70">
                            {msg.sender?.firstName} {msg.sender?.lastName}
                          </div>
                        )}
                        <div>{msg.content}</div>
                        <div className={clsx('text-xs mt-1 opacity-60', isMe ? 'text-right' : '')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send form */}
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
      </div>
    </div>
  );
}
