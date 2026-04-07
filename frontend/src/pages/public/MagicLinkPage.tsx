import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function MagicLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid magic link — no token found.');
      return;
    }
    (async () => {
      try {
        const { data } = await api.post('/api/auth/magic-link', { token });
        setAuth(data.user, data.accessToken, data.refreshToken);
        setStatus('success');
        setTimeout(() => navigate('/borrower/dashboard'), 2000);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 'This magic link is invalid or has expired. Please request a new one.'
        );
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-6">
          <Building2 className="w-8 h-8 text-white" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your link...</h2>
              <p className="text-gray-500 text-sm">Please wait while we authenticate you securely.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You're signed in!</h2>
              <p className="text-gray-500 text-sm">Redirecting you to your dashboard...</p>
              <div className="mt-4">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-9 h-9 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h2>
              <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
              <a
                href="/login"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Back to Login
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
