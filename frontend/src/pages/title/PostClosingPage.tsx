import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, CheckCircle, FileText, AlertCircle, Send } from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const POST_CLOSING_DOCS = [
  {
    key: 'recordedDeed',
    label: 'Recorded Deed',
    description: "Certified copy of the recorded deed from the county recorder's office",
    required: true,
  },
  {
    key: 'finalTitlePolicy',
    label: 'Final Title Insurance Policy',
    description: 'Issued title insurance policy (lender and/or owner)',
    required: true,
  },
  {
    key: 'deedOfTrust',
    label: 'Recorded Deed of Trust / Mortgage',
    description: 'Confirmed recorded mortgage/deed of trust with recording info',
    required: true,
  },
  {
    key: 'satisfactions',
    label: 'Lien Satisfactions & Releases',
    description: 'Recorded releases of all prior liens',
    required: false,
  },
  {
    key: 'surveyFinal',
    label: 'Final Survey',
    description: 'Updated survey reflecting any improvements or modifications',
    required: false,
  },
  {
    key: 'hazardPolicy',
    label: 'Final Hazard Insurance Policy',
    description: 'Full policy with lender listed as additional insured/mortgagee',
    required: true,
  },
  {
    key: 'closingPackage',
    label: 'Executed Closing Package',
    description: 'All signed closing documents including note, deed of trust, and disclosures',
    required: true,
  },
];

export default function PostClosingPage() {
  const qc = useQueryClient();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: closingLoans = [] } = useQuery({
    queryKey: ['title-closing-loans'],
    queryFn: () => api.get('/api/loans?status=IN_CLOSING').then((r) => r.data),
  });
  const loan = closingLoans[0];

  const uploadDoc = useMutation({
    mutationFn: ({ file, docKey }: { file: File; docKey: string }) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docKey.toUpperCase());
      fd.append('category', 'POST_CLOSING');
      return api.post(`/api/loans/${loan?.id}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (_, vars) => {
      setUploadedFiles((prev) => ({ ...prev, [vars.docKey]: vars.file }));
    },
  });

  const submitPackage = useMutation({
    mutationFn: () => api.post(`/api/loans/${loan?.id}/post-closing/complete`),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['title-closing-loans'] });
    },
  });

  const requiredKeys = POST_CLOSING_DOCS.filter((d) => d.required).map((d) => d.key);
  const allRequiredUploaded = requiredKeys.every((k) => uploadedFiles[k]);
  const totalUploaded = Object.values(uploadedFiles).filter(Boolean).length;

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Post-Closing Package Submitted</h2>
          <p className="text-gray-500 text-sm">The post-closing package has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post-Closing</h1>
        <p className="text-gray-500 text-sm">Upload recorded documents and finalize the post-closing package.</p>
      </div>

      {!loan ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          No loans available for post-closing at this time.
        </div>
      ) : (
        <>
          {/* Loan info */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
            <span className="font-semibold">Loan #{loan.loanNumber || loan.id.slice(0, 8)}</span>
            {' — '}
            {loan.borrower?.firstName} {loan.borrower?.lastName}
            {' • '}
            {loan.property?.address}
          </div>

          {/* Progress */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Documents Uploaded</span>
              <span className={clsx('text-sm font-bold', allRequiredUploaded ? 'text-emerald-600' : 'text-indigo-600')}>
                {totalUploaded} / {POST_CLOSING_DOCS.length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all', allRequiredUploaded ? 'bg-emerald-500' : 'bg-indigo-600')}
                style={{ width: `${(totalUploaded / POST_CLOSING_DOCS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Document upload zones */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Required Documents</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {POST_CLOSING_DOCS.map((doc) => {
                const uploaded = uploadedFiles[doc.key];
                return (
                  <div key={doc.key} className={clsx('px-5 py-4', uploaded ? 'bg-emerald-50/30' : '')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {uploaded ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                            {doc.label}
                            {doc.required && (
                              <span className="text-xs text-red-500 font-normal">*required</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{doc.description}</div>
                          {uploaded && (
                            <div className="text-xs text-emerald-600 font-medium mt-1">
                              {uploaded.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <label className="cursor-pointer flex-shrink-0">
                        <input
                          ref={(el) => (fileInputRefs.current[doc.key] = el)}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadDoc.mutate({ file, docKey: doc.key });
                          }}
                        />
                        <span className={clsx(
                          'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
                          uploaded
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                        )}>
                          <Upload className="w-3.5 h-3.5" />
                          {uploaded ? 'Replace' : 'Upload'}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            {!allRequiredUploaded && (
              <div className="flex items-start gap-2 text-amber-700 text-sm mb-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Please upload all required documents before submitting the post-closing package.
              </div>
            )}
            <button
              onClick={() => submitPackage.mutate()}
              disabled={!allRequiredUploaded || submitPackage.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {submitPackage.isPending ? (
                <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Submitting...</>
              ) : (
                <><Send className="w-5 h-5" /> Submit Complete Post-Closing Package</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
