import React, { useState } from 'react'

const sidebarItems = [
  { icon: '🏠', label: 'Dashboard', active: true, href: '/broker/dashboard' },
  { icon: '📊', label: 'Pipeline', href: '/broker/pipeline' },
  { icon: '➕', label: 'New Loan', href: '/broker/loans/new' },
  { icon: '📁', label: 'Documents', href: '/broker/documents' },
  { icon: '💬', label: 'Messages', href: '/broker/messages', badge: 2 },
  { icon: '⚙️', label: 'Settings', href: '/broker/settings' },
]

const kpis = [
  { label: 'Active Loans', value: '24', trend: '+3', up: true, color: 'indigo', icon: '📋' },
  { label: 'Submitted This Month', value: '8', trend: '+2', up: true, color: 'emerald', icon: '📤' },
  { label: 'Awaiting Decision', value: '5', trend: '-1', up: false, color: 'amber', icon: '⏳' },
  { label: 'Avg. AI Score', value: '78', unit: '/100', trend: '+4', up: true, color: 'sky', icon: '🤖' },
]

const actionItems = [
  { loanId: 'CF-2025-00142', desc: 'Missing bank statements — 3 documents required before review can proceed', action: 'Upload Docs', urgency: 'high' },
  { loanId: 'CF-2025-00138', desc: 'New condition set by underwriter: Proof of insurance required', action: 'View Condition', urgency: 'medium' },
  { loanId: 'CF-2025-00135', desc: 'Message from UW Sarah M.: "Can you clarify rental income source?"', action: 'Reply', urgency: 'medium' },
  { loanId: 'CF-2025-00130', desc: 'Loan approved — awaiting borrower e-signature on closing disclosure', action: 'View Loan', urgency: 'low' },
]

const recentLoans = [
  { id: 'CF-2025-00142', borrower: 'Robert Vasquez', program: 'Bridge', amount: '$1,200,000', status: 'IN_REVIEW', aiScore: 72, lastUpdated: '2h ago' },
  { id: 'CF-2025-00140', borrower: 'Priya Nair', program: 'DSCR', amount: '$850,000', status: 'CONDITIONALLY_APPROVED', aiScore: 81, lastUpdated: '4h ago' },
  { id: 'CF-2025-00138', borrower: 'James Thornton', program: 'Fix & Flip', amount: '$420,000', status: 'IN_REVIEW', aiScore: 68, lastUpdated: '6h ago' },
  { id: 'CF-2025-00135', borrower: 'Maria Santos', program: 'DSCR', amount: '$650,000', status: 'APPROVED', aiScore: 85, lastUpdated: '1d ago' },
  { id: 'CF-2025-00130', borrower: 'David Kim', program: 'Long-Term Rental', amount: '$975,000', status: 'IN_CLOSING', aiScore: 89, lastUpdated: '2d ago' },
]

const statusConfig = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-sky-100 text-sky-700',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  CONDITIONALLY_APPROVED: 'bg-violet-100 text-violet-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  IN_CLOSING: 'bg-teal-100 text-teal-700',
  CLOSED: 'bg-gray-200 text-gray-700',
  DECLINED: 'bg-red-100 text-red-700',
}

const colorMap = {
  indigo: { card: 'bg-indigo-50 border-indigo-100', icon: 'bg-indigo-100 text-indigo-600', value: 'text-indigo-700', trend: 'text-indigo-500' },
  emerald: { card: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-700', trend: 'text-emerald-500' },
  amber: { card: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700', trend: 'text-amber-500' },
  sky: { card: 'bg-sky-50 border-sky-100', icon: 'bg-sky-100 text-sky-600', value: 'text-sky-700', trend: 'text-sky-500' },
}

const urgencyConfig = {
  high: 'border-l-4 border-red-400 bg-red-50',
  medium: 'border-l-4 border-amber-400 bg-amber-50',
  low: 'border-l-4 border-emerald-400 bg-emerald-50',
}

export default function BrokerDashboard() {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-sm">CF</span>
            </div>
            <span className="text-white text-lg font-black">CapitalFlow</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sidebarItems.map((item, i) => (
            <a key={i} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${item.active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-sm font-bold text-white">SC</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Sarah Chen</div>
              <div className="text-indigo-300 text-xs">Broker</div>
            </div>
            <button className="text-indigo-300 hover:text-white text-sm" title="Logout">↗️</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">3</span>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                  </div>
                  {['Loan CF-2025-00142 moved to IN_REVIEW', 'New message from UW Sarah M.', 'Condition satisfied on CF-2025-00135'].map((n, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-gray-50 flex gap-3 items-start">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></span>
                      <span className="text-xs text-gray-700">{n}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center text-sm font-bold text-white cursor-pointer">SC</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Welcome banner */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Good morning, Sarah 👋</h2>
            <p className="text-gray-500 text-sm mt-0.5">Sunday, April 6, 2025 · Here's your portfolio snapshot</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, i) => {
              const c = colorMap[kpi.color]
              return (
                <div key={i} className={`rounded-xl border p-4 ${c.card} cursor-pointer hover:shadow-sm transition-shadow`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${c.icon}`}>{kpi.icon}</div>
                    <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kpi.up ? '↑' : '↓'} {kpi.trend}
                    </span>
                  </div>
                  <div className={`text-3xl font-black ${c.value}`}>{kpi.value}<span className="text-sm font-medium">{kpi.unit}</span></div>
                  <div className="text-xs text-gray-600 mt-1">{kpi.label}</div>
                </div>
              )
            })}
          </div>

          {/* Two-column layout: Action items + AI insight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Action Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Needs Your Attention</h3>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">4 items</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {actionItems.map((item, i) => (
                    <div key={i} className={`p-4 ${urgencyConfig[item.urgency]} mx-0 rounded-none first:rounded-t-none last:rounded-b-xl`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-gray-500">{item.loanId}</span>
                          <p className="text-sm text-gray-700 mt-0.5">{item.desc}</p>
                        </div>
                        <button className="flex-shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                          {item.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insight Panel */}
            <div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <h3 className="font-bold text-indigo-900 text-sm">AI Portfolio Insight</h3>
                </div>
                <p className="text-sm text-indigo-800 leading-relaxed">
                  You have <strong>5 loans</strong> awaiting underwriting decisions — 2 have been waiting more than 3 business days. Your average AI risk score improved by <strong>4 points</strong> this month, reaching 78/100. <strong>2 loans</strong> are currently in closing and both are on track for this week's target close dates. Consider following up on CF-2025-00142 regarding the missing bank statements.
                </p>
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <button className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800">Ask AI a question →</button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-4 space-y-2">
                <a href="/broker/loans/new" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors shadow-sm">
                  <span>➕</span> New Loan Application
                </a>
                <a href="/broker/documents" className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-3 rounded-xl text-sm border border-gray-200 transition-colors">
                  <span>📤</span> Upload Document
                </a>
                <a href="/broker/pipeline" className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-3 rounded-xl text-sm border border-gray-200 transition-colors">
                  <span>📊</span> View Full Pipeline
                </a>
              </div>
            </div>
          </div>

          {/* Recent Pipeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Pipeline</h3>
              <a href="/broker/pipeline" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Loan #', 'Borrower', 'Program', 'Amount', 'Status', 'AI Score', 'Last Updated'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLoans.map((loan, i) => (
                    <tr key={i} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3.5 text-sm font-mono font-medium text-indigo-600">{loan.id}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-900">{loan.borrower}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{loan.program}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{loan.amount}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[loan.status]}`}>{loan.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full w-16">
                            <div className={`h-1.5 rounded-full ${loan.aiScore >= 80 ? 'bg-emerald-500' : loan.aiScore >= 65 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${loan.aiScore}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700">{loan.aiScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{loan.lastUpdated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
