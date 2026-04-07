import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const REQUIRED_DOC_TYPES = [
  { type: 'BANK_STATEMENT', label: '3 Months Bank Statements', description: 'Recent 3 months from all accounts' },
  { type: 'TAX_RETURN', label: 'Tax Returns (2 years)', description: 'Federal tax returns for last 2 years' },
  { type: 'PURCHASE_CONTRACT', label: 'Purchase Contract', description: 'Executed purchase & sale agreement' },
  { type: 'ID', label: 'Government ID', description: "Driver's license or passport" },
  { type: 'INSURANCE', label: 'Insurance Binder', description: 'Property insurance documentation' },
  { type: 'APPRAISAL', label: 'Appraisal Report', description: 'Third-party property appraisal' },
];

function statusIcon(status: string) {
  switch (status) {
    case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
    default: return <AlertCircle className="w-5 h-5 text-gray-300" />;
  }
}

function statusLabel(status?: string) {
  switch (status) {
    case 'APPROVED': return { text: 'Approved', cls: 'bg-emerald-100 text-emerald-700' };
    case 'REJECTED': return { text: 'Rejected', cls: 'bg-red-100 text-red-700' };
    case 'PENDING': return { text: 'Under Review', cls: 'bg-amber-100 text-amber-700' };
    default: return { text: 'Not Uploaded', cls: 'bg-gray-100 text-gray-500' };
  }
}

export default function BorrowerDocumentsPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: loans = [] } = useQuery({
    queryKey: ['borrower-loans'],
    queryFn: () => api.get('/api/loans').then((r) => r.data),
  });
  const loan = loans[0];

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['borrower-documents', loan?.id],
    queryFn: () => api.get(`/api/loans/${loan.id}/documents`).then((r) => r.data),
    enabled: !!loan?.id,
  });

  const uploadDoc = useMutation({
    mutationFn: ({ file, docType }: { file: File; docType: string }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docType);
      return api.post(`/api/loans/${loan.id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['borrower-documents', loan?.id] }),
  });

  const approvedCount = documents.filter((d: any) => d.status === 'APPROVED').length;
  const completionPct = REQUIRED_DOC_TYPES.length
    ? Math.round((REQUIRED_DOC_TYPES.filter((req) => documents.some((d: any) => d.type === req.type)).length / REQUIRED_DOC_TYPES.length) * 100)
    : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 text-sm">Upload the required documents to keep your loan moving forward.</p>
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Required Documents</span>
          <span className={clsx('text-sm font-bold', completionPct === 100 ? 'text-emerald-600' : 'text-indigo-600')}>
            {completionPct}% complete
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', completionPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600')}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>{documents.length} uploaded</span>
          <span>{approvedCount} approved</span>
        </div>
      </div>

      {/* Required docs checklist */}
      {isLoading ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Required Documents</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {REQUIRED_DOC_TYPES.map((req) => {
              const uploaded = documents.find((d: any) => d.type === req.type);
              const sl = statusLabel(uploaded?.status);
              return (
                <div key={req.type} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {statusIcon(uploaded?.status || '')}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{req.label}</div>
                      <div className="text-xs text-gray-500">{req.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx('text-xs font-medium px-2.5 py-0.5 rounded-full', sl.cls)}>
                      {sl.text}
                    </span>
                    {uploaded?.url && (
                      <a href={uploaded.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadDoc.mutate({ file, docType: req.type });
                        }}
                      />
                      <span className="text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                        {uploaded ? 'Replace' : 'Upload'}
                      </span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional uploaded documents */}
      {documents.filter((d: any) => !REQUIRED_DOC_TYPES.find((r) => r.type === d.type)).length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Additional Documents</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {documents
              .filter((d: any) => !REQUIRED_DOC_TYPES.find((r) => r.type === d.type))
              .map((doc: any) => {
                const sl = statusLabel(doc.status);
                return (
                  <div key={doc.id} className="px-5 py-3 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.type?.replace(/_/g, ' ')}</div>
                    </div>
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', sl.cls)}>{sl.text}</span>
                    {doc.aiClassification && (
                      <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        AI: {doc.aiClassification.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Upload additional */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-300 transition-colors">
        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600 mb-1">Upload additional documents</p>
        <p className="text-xs text-gray-400 mb-4">PDF, JPG, PNG up to 25MB</p>
        <label className="cursor-pointer">
          <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
            const files = e.target.files;
            if (files) Array.from(files).forEach((f) => uploadDoc.mutate({ file: f, docType: 'OTHER' }));
          }} />
          <span className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Choose Files
          </span>
        </label>
      </div>
    </div>
  );
}
