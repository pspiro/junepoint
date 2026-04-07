import React, { useState } from 'react'

export default function LoginPage() {
  const [step, setStep] = useState('credentials') // 'credentials' | 'mfa' | 'loading'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address'
    if (!password) errs.password = 'Password is required'
    return errs
  }

  function handleLogin(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep('loading')
    setTimeout(() => setStep('mfa'), 1200)
  }

  function handleMFA(e) {
    e.preventDefault()
    if (mfaCode.length !== 6) { setErrors({ mfa: 'Enter the 6-digit code from your authenticator app' }); return }
    setErrors({})
    setStep('loading')
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left branded panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-900 to-indigo-600 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-black">CF</span>
          </div>
          <span className="text-white text-xl font-black">CapitalFlow</span>
        </div>
        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-6">The future of<br />private lending</h2>
          <ul className="space-y-4">
            {[
              { icon: '🤖', text: 'AI-powered underwriting in minutes, not days' },
              { icon: '📁', text: 'Automatic document classification and routing' },
              { icon: '📈', text: 'Connect closed loans to institutional investors' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-indigo-100">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-indigo-300 text-xs">© 2025 CapitalFlow LMS, Inc.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">CF</span>
            </div>
            <span className="text-xl font-black text-gray-900">CapitalFlow</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Loading state */}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Signing you in...</p>
              </div>
            )}

            {/* Credentials step */}
            {step === 'credentials' && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                  <p className="text-gray-500 text-sm mt-1">Sign in to your CapitalFlow account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@brokerage.com"
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 pr-11 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
                  </div>
                  <div className="flex justify-end">
                    <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Forgot password?</a>
                  </div>
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{errors.general}</div>
                  )}
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
                    Sign In
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <div className="relative flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">New to CapitalFlow?</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <a href="/signup" className="w-full block text-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg text-sm transition-colors">
                    Create a Broker Account
                  </a>
                </div>
              </>
            )}

            {/* MFA step */}
            {step === 'mfa' && (
              <>
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
                  <p className="text-gray-500 text-sm mt-1">Enter the 6-digit code from your authenticator app</p>
                </div>
                <form onSubmit={handleMFA} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Authentication Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value.replace(/\D/g,''))}
                      placeholder="000000"
                      className={`w-full px-4 py-3 border rounded-lg text-2xl font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.mfa ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {errors.mfa && <p className="mt-1.5 text-xs text-red-500 text-center">{errors.mfa}</p>}
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
                    Verify Code
                  </button>
                </form>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => setStep('credentials')} className="text-sm text-gray-500 hover:text-gray-700">← Back to login</button>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Resend code</button>
                </div>
              </>
            )}
          </div>

          {/* Security note */}
          <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <span>🔒</span> Secured with 256-bit TLS encryption
          </p>
        </div>
      </div>
    </div>
  )
}
