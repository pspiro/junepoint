import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertCircle, Save } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

const EMPLOYMENT_TYPES = ['EMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'INVESTOR', 'OTHER'];
const CITIZENSHIPS = ['US_CITIZEN', 'PERMANENT_RESIDENT', 'FOREIGN_NATIONAL'];

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssnLast4: string;
  dateOfBirth: string;
  citizenship: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  employmentType: string;
  employer: string;
  annualIncome: string;
  liquidAssets: string;
  totalAssets: string;
}

const PROFILE_FIELDS: (keyof ProfileForm)[] = [
  'firstName', 'lastName', 'phone', 'ssnLast4', 'dateOfBirth', 'citizenship',
  'address', 'city', 'state', 'zip', 'employmentType',
];

export default function PersonalInfoPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['borrower-profile', user?.id],
    queryFn: () => api.get(`/api/users/${user?.id}/profile`).then((r) => r.data),
    enabled: !!user?.id,
  });

  const [form, setForm] = useState<ProfileForm>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    ssnLast4: '',
    dateOfBirth: '',
    citizenship: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    employmentType: '',
    employer: '',
    annualIncome: '',
    liquidAssets: '',
    totalAssets: '',
    ...profile,
  });

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const saveProfile = useMutation({
    mutationFn: () =>
      api.put(`/api/users/${user?.id}/profile`, {
        ...form,
        annualIncome: form.annualIncome ? parseFloat(form.annualIncome) : undefined,
        liquidAssets: form.liquidAssets ? parseFloat(form.liquidAssets) : undefined,
        totalAssets: form.totalAssets ? parseFloat(form.totalAssets) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['borrower-profile', user?.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    },
  });

  const completedFields = PROFILE_FIELDS.filter((f) => !!form[f]).length;
  const completionPct = Math.round((completedFields / PROFILE_FIELDS.length) * 100);

  const fieldClass = clsx(
    'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
        <p className="text-gray-500 text-sm">Complete your profile so your lender can process your application.</p>
      </div>

      {/* Completion indicator */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
          <span className={clsx('text-sm font-bold', completionPct === 100 ? 'text-emerald-600' : 'text-indigo-600')}>
            {completionPct}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', completionPct === 100 ? 'bg-emerald-500' : 'bg-indigo-600')}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        {completionPct === 100 && (
          <div className="flex items-center gap-2 mt-2 text-emerald-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Profile complete!
          </div>
        )}
      </div>

      {(error || saved) && (
        <div className={clsx('flex items-center gap-3 rounded-xl p-4 text-sm', saved ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700')}>
          {saved ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {saved ? 'Profile saved successfully.' : error}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); saveProfile.mutate(); }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5"
      >
        <h2 className="font-semibold text-gray-900">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input type="text" value={form.firstName} onChange={set('firstName')} className={fieldClass} placeholder="Jane" />
          </Field>
          <Field label="Last Name">
            <input type="text" value={form.lastName} onChange={set('lastName')} className={fieldClass} placeholder="Doe" />
          </Field>
        </div>
        <Field label="Email Address">
          <input type="email" value={form.email} readOnly className={clsx(fieldClass, 'bg-gray-50 cursor-not-allowed')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone Number">
            <input type="tel" value={form.phone} onChange={set('phone')} className={fieldClass} placeholder="(555) 000-0000" />
          </Field>
          <Field label="SSN (Last 4)">
            <input type="text" maxLength={4} value={form.ssnLast4} onChange={set('ssnLast4')} className={fieldClass} placeholder="1234" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of Birth">
            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={fieldClass} />
          </Field>
          <Field label="Citizenship Status">
            <select value={form.citizenship} onChange={set('citizenship')} className={fieldClass}>
              <option value="">Select...</option>
              {CITIZENSHIPS.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </Field>
        </div>

        <hr className="border-gray-100" />
        <h2 className="font-semibold text-gray-900">Address</h2>
        <Field label="Street Address">
          <input type="text" value={form.address} onChange={set('address')} className={fieldClass} placeholder="123 Main St" />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="City">
              <input type="text" value={form.city} onChange={set('city')} className={fieldClass} placeholder="Miami" />
            </Field>
          </div>
          <Field label="State">
            <input type="text" maxLength={2} value={form.state} onChange={set('state')} className={fieldClass} placeholder="FL" />
          </Field>
        </div>
        <Field label="Zip Code">
          <input type="text" maxLength={10} value={form.zip} onChange={set('zip')} className={fieldClass} placeholder="33101" />
        </Field>

        <hr className="border-gray-100" />
        <h2 className="font-semibold text-gray-900">Employment & Income</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employment Type">
            <select value={form.employmentType} onChange={set('employmentType')} className={fieldClass}>
              <option value="">Select...</option>
              {EMPLOYMENT_TYPES.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
            </select>
          </Field>
          <Field label="Employer / Business">
            <input type="text" value={form.employer} onChange={set('employer')} className={fieldClass} placeholder="Acme Corp" />
          </Field>
        </div>
        <Field label="Annual Income ($)">
          <input type="number" min="0" value={form.annualIncome} onChange={set('annualIncome')} className={fieldClass} placeholder="120000" />
        </Field>

        <hr className="border-gray-100" />
        <h2 className="font-semibold text-gray-900">Assets</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Liquid Assets ($)">
            <input type="number" min="0" value={form.liquidAssets} onChange={set('liquidAssets')} className={fieldClass} placeholder="80000" />
          </Field>
          <Field label="Total Assets ($)">
            <input type="number" min="0" value={form.totalAssets} onChange={set('totalAssets')} className={fieldClass} placeholder="500000" />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saveProfile.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saveProfile.isPending ? (
            <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Saving...</>
          ) : (
            <><Save className="w-5 h-5" /> Save Profile</>
          )}
        </button>
      </form>
    </div>
  );
}
