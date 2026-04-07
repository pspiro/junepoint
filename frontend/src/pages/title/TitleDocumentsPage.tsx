import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, FileText } from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const TITLE_DOC_TYPES = [
  '', 'TITLE_COMMITMENT', 'TITLE_REPORT', 'CLOSING_DISCLOSURE', 'DEED', 'DEED_OF_TRUST',
  'SURVEY', 'FLOOD_CERT', 'INSURANCE', 'PAYOFF_STATEMENT', 'HUD1', 'OTHER',
];

function statusClass(status?: string) {
  switch (status) {
    case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
    case 'REJECTED': return 'bg-red-100 text-red-700';
    case 'PENDING': return 'bg-amber-100 text-amber-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function TitleDocumentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: documents = [], isLoading, isError } = useQuery({
    queryKey: ['title-documents'],
    queryFn: () => api.get('/api/documents').then((r) => r.data),
  });

  const filtered = documents.filter((doc: any) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.loanNumber || '').toLowerCase().includes(q);
    const matchType = !typeFilter || doc.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Title Documents</h1>
        <p className="text-gray-500 text-sm">{documents.length} documents</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          {TITLE_DOC_TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(search || typeFilter) && (
          <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading documents...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500 text-sm">Failed to load documents.</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No documents found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Document Name</th>
                  <th className="px-4 py-3 text-left">Loan #</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Uploaded By</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-indigo-600 font-medium">
                      #{doc.loanNumber || doc.loanId?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{doc.type?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs font-medium px-2.5 py-0.5 rounded-full', statusClass(doc.status))}>
                        {doc.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
