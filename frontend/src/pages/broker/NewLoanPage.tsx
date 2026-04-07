import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  FileText,
  Home,
  User,
  DollarSign,
  Upload,
  ClipboardCheck,
} from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';

const STEPS = [
  { id: 1, label: 'Loan Details', icon: FileText },
  { id: 2, label: 'Property', icon: Home },
  { id: 3, label: 'Borrower', icon: User },
  { id: 4, label: 'Financials', icon: DollarSign },
  { id: 5, label: 'Documents', icon: Upload },
  { id: 6, label: 'Review', icon: ClipboardCheck },
];

const PROGRAMS = ['BRIDGE', 'DSCR', 'FIX_AND_FLIP', 'LONG_TERM_RENTAL', 'CONSTRUCTION', 'COMMERCIAL'];
const PURPOSES = ['PURCHASE', 'REFINANCE', 'CASH_OUT_REFI', 'CONSTRUCTION'];
const PROPERTY_TYPES = ['SINGLE_FAMILY', 'MULTI_FAMILY', 'CONDO', 'COMMERCIAL', 'LAND', 'MIXED_USE'];
const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

interface FormData {
  program: string;
  amount: string;
  purpose: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  propertyValue: string;
  borrowerEmail: string;
  borrowerFirstName: string;
  borrowerLastName: string;
  ltv: string;
  term: string;
  interestRate: string;
  monthlyRent: string;
}

export default function NewLoanPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loanId, setLoanId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [form, setForm] = useState<FormData>({
    program: '',
    amount: '',
    purpose: '',
    propertyAddress: '',
    propertyCity: '',
    propertyState: '',
    propertyZip: '',
    propertyType: '',
    propertyValue: '',
    borrowerEmail: '',
    borrowerFirstName: '',
    borrowerLastName: '',
    ltv: '',
    term: '',
    interestRate: '',
    monthlyRent: '',
  });

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const createLoan = useMutation({
    mutationFn: () =>
      api.post('/api/loans', {
        program: form.program,
        amount: parseFloat(form.amount),
        purpose: form.purpose,
        property: {
          address: form.propertyAddress,
          city: form.propertyCity,
          state: form.propertyState,
          zip: form.propertyZip,
          type: form.propertyType,
          value: parseFloat(form.propertyValue),
        },
        ltv: form.ltv ? parseFloat(form.ltv) : undefined,
        term: form.term ? parseInt(form.term) : undefined,
        interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
        monthlyRent: form.monthlyRent ? parseFloat(form.monthlyRent) : undefined,
      }).then((r) => r.data),
    onSuccess: (data) => setLoanId(data.id),
  });

  const inviteBorrower = useMutation({
    mutationFn: () =>
      api.post('/api/users/invite', {
        email: form.borrowerEmail,
        firstName: form.borrowerFirstName,
        lastName: form.borrowerLastName,
        role: 'BORROWER',
        loanId,
      }),
  });

  const submitLoan = useMutation({
    mutationFn: () => api.post(`/api/loans/${loanId}/submit`),
    onSuccess: () => navigate(`/broker/loans/${loanId}`),
  });

  const validateStep = (): boolean => {
    const errs: Partial<FormData> = {};
    if (step === 1) {
      if (!form.program) errs.program = 'Required';
      if (!form.amount) errs.amount = 'Required';
      if (!form.purpose) errs.purpose = 'Required';
    }
    if (step === 2) {
      if (!form.propertyAddress) errs.propertyAddress = 'Required';
      if (!form.propertyCity) errs.propertyCity = 'Required';
      if (!form.propertyState) errs.propertyState = 'Required';
      if (!form.propertyType) errs.propertyType = 'Required';
    }
    if (step === 3) {
      if (!form.borrowerEmail) errs.borrowerEmail = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step === 3 && !loanId) {
      try {
        await createLoan.mutateAsync();
        if (form.borrowerEmail) await inviteBorrower.mutateAsync();
      } catch {
        return;
      }
    }
    if (step === 6) {
      if (!loanId) {
        try { await createLoan.mutateAsync(); } catch { return; }
      }
      await submitLoan.mutateAsync();
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const fieldClass = (err?: string) => clsx(
    'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
    err ? 'border-red-300 bg-red-50' : 'border-gray-200'
  );

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Loan Application</h1>
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  step > s.id ? 'bg-emerald-500 text-white' :
                  step === s.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' :
                  'bg-gray-100 text-gray-400'
                )}>
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <span className={clsx('text-xs mt-1.5 font-medium hidden sm:block', step === s.id ? 'text-indigo-600' : 'text-gray-400')}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={clsx('flex-1 h-0.5 mx-1 mt-0 sm:-mt-5', step > s.id ? 'bg-emerald-300' : 'bg-gray-100')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-5">
        {/* Step 1: Loan Details */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Loan Details</h2>
            <Field label="Loan Program" error={errors.program}>
              <select value={form.program} onChange={set('program')} className={fieldClass(errors.program)}>
                <option value="">Select program...</option>
                {PROGRAMS.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
            <Field label="Loan Amount ($)" error={errors.amount}>
              <input type="number" min="0" placeholder="500000" value={form.amount} onChange={set('amount')} className={fieldClass(errors.amount)} />
            </Field>
            <Field label="Loan Purpose" error={errors.purpose}>
              <select value={form.purpose} onChange={set('purpose')} className={fieldClass(errors.purpose)}>
                <option value="">Select purpose...</option>
                {PURPOSES.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
              </select>
            </Field>
          </>
        )}

        {/* Step 2: Property */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Property Information</h2>
            <Field label="Street Address" error={errors.propertyAddress}>
              <input type="text" placeholder="123 Main St" value={form.propertyAddress} onChange={set('propertyAddress')} className={fieldClass(errors.propertyAddress)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" error={errors.propertyCity}>
                <input type="text" placeholder="Miami" value={form.propertyCity} onChange={set('propertyCity')} className={fieldClass(errors.propertyCity)} />
              </Field>
              <Field label="State">
                <select value={form.propertyState} onChange={set('propertyState')} className={fieldClass()}>
                  <option value="">Select state...</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Zip Code">
                <input type="text" placeholder="33101" value={form.propertyZip} onChange={set('propertyZip')} className={fieldClass()} />
              </Field>
              <Field label="Property Type" error={errors.propertyType}>
                <select value={form.propertyType} onChange={set('propertyType')} className={fieldClass(errors.propertyType)}>
                  <option value="">Select type...</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Estimated Property Value ($)">
              <input type="number" min="0" placeholder="800000" value={form.propertyValue} onChange={set('propertyValue')} className={fieldClass()} />
            </Field>
          </>
        )}

        {/* Step 3: Borrower */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Borrower Information</h2>
            <p className="text-sm text-gray-500">We'll send an invitation email to the borrower to complete their profile.</p>
            <Field label="Borrower Email" error={errors.borrowerEmail}>
              <input type="email" placeholder="borrower@email.com" value={form.borrowerEmail} onChange={set('borrowerEmail')} className={fieldClass(errors.borrowerEmail)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <input type="text" placeholder="Jane" value={form.borrowerFirstName} onChange={set('borrowerFirstName')} className={fieldClass()} />
              </Field>
              <Field label="Last Name">
                <input type="text" placeholder="Doe" value={form.borrowerLastName} onChange={set('borrowerLastName')} className={fieldClass()} />
              </Field>
            </div>
          </>
        )}

        {/* Step 4: Financials */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Financial Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="LTV (%)">
                <input type="number" min="0" max="100" placeholder="70" value={form.ltv} onChange={set('ltv')} className={fieldClass()} />
              </Field>
              <Field label="Term (months)">
                <input type="number" min="1" placeholder="12" value={form.term} onChange={set('term')} className={fieldClass()} />
              </Field>
            </div>
            <Field label="Interest Rate (%)">
              <input type="number" step="0.01" min="0" placeholder="9.5" value={form.interestRate} onChange={set('interestRate')} className={fieldClass()} />
            </Field>
            {(form.program === 'DSCR' || form.program === 'LONG_TERM_RENTAL') && (
              <Field label="Monthly Rental Income ($)">
                <input type="number" min="0" placeholder="4500" value={form.monthlyRent} onChange={set('monthlyRent')} className={fieldClass()} />
              </Field>
            )}
          </>
        )}

        {/* Step 5: Documents */}
        {step === 5 && (
          <div className="text-center py-10">
            <Upload className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Document Upload</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
              You can upload supporting documents now or after submission from the loan detail page.
              Required documents will be listed based on your loan program.
            </p>
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              You can skip this step and upload documents later
            </span>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {step === 6 && (
          <>
            <h2 className="text-lg font-bold text-gray-900">Review & Submit</h2>
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-700 mb-2">Loan Details</div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-gray-500">Program</dt><dd className="font-medium">{form.program.replace(/_/g, ' ')}</dd></div>
                  <div><dt className="text-gray-500">Amount</dt><dd className="font-medium">${Number(form.amount).toLocaleString()}</dd></div>
                  <div><dt className="text-gray-500">Purpose</dt><dd className="font-medium">{form.purpose.replace(/_/g, ' ')}</dd></div>
                  <div><dt className="text-gray-500">LTV</dt><dd className="font-medium">{form.ltv || '—'}%</dd></div>
                </dl>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-700 mb-2">Property</div>
                <p className="text-gray-700">{form.propertyAddress}, {form.propertyCity}, {form.propertyState} {form.propertyZip}</p>
                <p className="text-gray-500 mt-1">{form.propertyType.replace(/_/g, ' ')} • Estimated ${Number(form.propertyValue).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-700 mb-2">Borrower</div>
                <p className="text-gray-700">{form.borrowerFirstName} {form.borrowerLastName}</p>
                <p className="text-gray-500">{form.borrowerEmail}</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-800 text-sm">
                By submitting, you confirm that all information provided is accurate and you authorize CapitalFlow to begin the underwriting process.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => step > 1 ? setStep((s) => s - 1) : navigate('/broker/pipeline')}
          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={handleNext}
          disabled={createLoan.isPending || inviteBorrower.isPending || submitLoan.isPending}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          {(createLoan.isPending || submitLoan.isPending) ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Processing...</>
          ) : step === 6 ? (
            <><CheckCircle className="w-4 h-4" /> Submit Loan</>
          ) : (
            <>Next <ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
