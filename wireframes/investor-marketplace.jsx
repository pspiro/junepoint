import React, { useState } from 'react'

const sidebarItems = [
  { icon: '🏠', label: 'Dashboard', href: '/investor/dashboard' },
  { icon: '🏛️', label: 'Marketplace', active: true, href: '/investor/marketplace' },
  { icon: '💼', label: 'My Portfolio', href: '/investor/portfolio', badge: '12' },
  { icon: '⚙️', label: 'Settings & Criteria', href: '/investor/settings' },
]

const listings = [
  { id: 'CF-2025-00088', program: 'DSCR', amount: 750000, ltv: 68.5, dscr: 1.42, yieldPct: 9.25, state: 'TX', aiMatch: 94, daysOnMarket: 3, aiSummary: 'Strong rental income profile. Austin market with 7.2% YoY appreciation. Minimal deferred maintenance.' },
  { id: 'CF-2025-00082', program: 'Bridge', amount: 1200000, ltv: 71.4, dscr: null, yieldPct: 10.5, state: 'FL', aiMatch: 87, daysOnMarket: 7, aiSummary: 'Acquisition bridge in South Florida. Experienced sponsor with 12-property track record. Clean title.' },
  { id: 'CF-2025-00079', program: 'Fix & Flip', amount: 385000, ltv: 74.2, dscr: null, yieldPct: 11.25, state: 'GA', aiMatch: 71, daysOnMarket: 12, aiSummary: 'Renovation in Atlanta metro. 90-day completion timeline. ARV supported by 3 strong comps.' },
  { id: 'CF-2025-00075', program: 'Long-Term Rental', amount: 925000, ltv: 65.0, dscr: 1.55, yieldPct: 8.75, state: 'NC', aiMatch: 91, daysOnMarket: 5, aiSummary: 'Fully stabilized multifamily duplex. Charlotte submarket shows 5.8% rent growth YoY. Long-term tenants.' },
  { id: 'CF-2025-00071', program: 'DSCR', amount: 580000, ltv: 70.1, dscr: 1.38, yieldPct: 9.0, state: 'TX', aiMatch: 89, daysOnMarket: 8, aiSummary: 'Dallas-Fort Worth suburban rental. New 2022 construction. Below-market rent with upside on renewal.' },
  { id: 'CF-2025-00068', program: 'Commercial', amount: 2100000, ltv: 60.0, dscr: 1.62, yieldPct: 8.25, state: 'AZ', aiMatch: 79, daysOnMarket: 14, aiSummary: 'Mixed-use retail/residential in Scottsdale. 92% occupancy. Anchor tenant lease through 2028.' },
]

const programColors = {
  DSCR: 'bg-emerald-100 text-emerald-700',
  Bridge: 'bg-indigo-100 text-indigo-700',
  'Fix & Flip': 'bg-amber-100 text-amber-700',
  'Long-Term Rental': 'bg-sky-100 text-sky-700',
  Commercial: 'bg-violet-100 text-violet-700',
  Construction: 'bg-rose-100 text-rose-700',
}

const matchColor = (score) => score >= 90 ? 'text-emerald-600 bg-emerald-50' : score >= 75 ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-100'

export default function InvestorMarketplace() {
  const [filters, setFilters] = useState({ program: '', minYield: '', maxLTV: '', state: '', minAmount: '', maxAmount: '' })
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidSubmitted, setBidSubmitted] = useState(false)
  const [sortBy, setSortBy] = useState('aiMatch')

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const filtered = listings
    .filter(l => !filters.program || l.program === filters.program)
    .filter(l => !filters.maxLTV || l.ltv <= parseFloat(filters.maxLTV))
    .filter(l => !filters.minYield || l.yieldPct >= parseFloat(filters.minYield))
    .filter(l => !filters.state || l.state === filters.state)
    .sort((a, b) => sortBy === 'aiMatch' ? b.aiMatch - a.aiMatch : sortBy === 'yield' ? b.yieldPct - a.yieldPct : a.daysOnMarket - b.daysOnMarket)

  function submitBid(e) {
    e.preventDefault()
    if (!bidAmount) return
    setBidSubmitted(true)
    setTimeout(() => { setBidSubmitted(false); setBidAmount(''); setSelectedLoan(null) }, 2000)
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-indigo-900 flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center"><span className="text-white font-black text-xs">CF</span></div>
            <span className="text-white font-black">CapitalFlow</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {sidebarItems.map((item, i) => (
            <a key={i} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${item.active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>}
            </a>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center text-xs font-bold text-white">DO</div>
            <div>
              <div className="text-white text-xs font-medium">David Okafor</div>
              <div className="text-indigo-300 text-xs">Investor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0 justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Loan Marketplace</h1>
            <p className="text-xs text-gray-500">{filtered.length} loans available · Sorted by AI match score</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="aiMatch">AI Match Score</option>
              <option value="yield">Highest Yield</option>
              <option value="daysOnMarket">Newest</option>
            </select>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Filters sidebar */}
          <div className="w-52 bg-white border-r border-gray-200 p-4 overflow-auto flex-shrink-0">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-3">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Program</label>
                <select value={filters.program} onChange={e => handleFilter('program', e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Programs</option>
                  {['Bridge', 'DSCR', 'Fix & Flip', 'Long-Term Rental', 'Construction', 'Commercial'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Min Yield (%)</label>
                <input type="number" step="0.25" value={filters.minYield} onChange={e => handleFilter('minYield', e.target.value)} placeholder="e.g. 8.5" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Max LTV (%)</label>
                <input type="number" step="1" value={filters.maxLTV} onChange={e => handleFilter('maxLTV', e.target.value)} placeholder="e.g. 75" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
                <select value={filters.state} onChange={e => handleFilter('state', e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All States</option>
                  {['TX', 'FL', 'GA', 'NC', 'AZ', 'CA', 'NY'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => setFilters({ program: '', minYield: '', maxLTV: '', state: '', minAmount: '', maxAmount: '' })} className="w-full text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1">Clear filters</button>
            </div>

            {/* Investor criteria reminder */}
            <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <div className="text-xs font-bold text-indigo-900 mb-1">Your Criteria</div>
              <div className="text-xs text-indigo-700 space-y-1">
                <div>Programs: DSCR, Bridge, LTR</div>
                <div>Max LTV: 75%</div>
                <div>Min Yield: 8.5%</div>
                <div>States: TX, FL, NC, AZ</div>
              </div>
              <a href="/investor/settings" className="block mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-800">Edit criteria →</a>
            </div>
          </div>

          {/* Listings grid */}
          <div className="flex-1 overflow-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-3">🔍</span>
                <p className="font-semibold">No loans match your filters</p>
                <p className="text-sm">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((loan) => (
                  <div key={loan.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Match score banner */}
                    <div className={`px-4 py-2 flex items-center justify-between ${loan.aiMatch >= 90 ? 'bg-emerald-50 border-b border-emerald-100' : loan.aiMatch >= 75 ? 'bg-amber-50 border-b border-amber-100' : 'bg-gray-50 border-b border-gray-100'}`}>
                      <span className="text-xs font-semibold text-gray-600">🤖 AI Match</span>
                      <span className={`text-sm font-black ${matchColor(loan.aiMatch).split(' ')[0]}`}>{loan.aiMatch}%</span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono text-xs font-bold text-indigo-600 mb-1">{loan.id}</div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${programColors[loan.program] || 'bg-gray-100 text-gray-700'}`}>{loan.program}</span>
                            <span className="text-xs text-gray-500">📍 {loan.state}</span>
                            <span className="text-xs text-gray-400">{loan.daysOnMarket}d ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Key metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">Amount</div>
                          <div className="text-sm font-bold text-gray-900">${(loan.amount/1000).toFixed(0)}K</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-500">LTV</div>
                          <div className={`text-sm font-bold ${loan.ltv <= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>{loan.ltv}%</div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-emerald-600">Yield</div>
                          <div className="text-sm font-black text-emerald-700">{loan.yieldPct}%</div>
                        </div>
                      </div>
                      {loan.dscr && (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-xs text-gray-500">DSCR:</span>
                          <span className={`text-xs font-bold ${loan.dscr >= 1.4 ? 'text-emerald-600' : 'text-amber-600'}`}>{loan.dscr}x</span>
                        </div>
                      )}

                      {/* AI summary */}
                      <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-2">{loan.aiSummary}</p>

                      <div className="flex gap-2">
                        <button onClick={() => setSelectedLoan(loan)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                          View Data Room
                        </button>
                        <button onClick={() => setSelectedLoan(loan)} className="px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold py-2 rounded-lg transition-colors">
                          Bid
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid/Data Room Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{selectedLoan.id}</h2>
                <p className="text-xs text-gray-500">{selectedLoan.program} · ${(selectedLoan.amount/1000).toFixed(0)}K · {selectedLoan.state}</p>
              </div>
              <button onClick={() => { setSelectedLoan(null); setBidSubmitted(false) }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="px-6 py-4">
              {/* Loan metrics */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[['LTV', `${selectedLoan.ltv}%`], ['Yield', `${selectedLoan.yieldPct}%`], selectedLoan.dscr ? ['DSCR', `${selectedLoan.dscr}x`] : ['Program', selectedLoan.program], ['AI Match', `${selectedLoan.aiMatch}%`]].map(([k,v],i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <div className="text-xs text-gray-500">{k}</div>
                    <div className="text-sm font-black text-gray-900">{v}</div>
                  </div>
                ))}
              </div>
              {/* AI summary */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                <div className="text-xs font-bold text-indigo-900 mb-1">🤖 AI Investment Summary</div>
                <p className="text-xs text-indigo-800 leading-relaxed">{selectedLoan.aiSummary}</p>
              </div>
              {/* Available docs */}
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-700 mb-2">Available Documents</div>
                <div className="space-y-1.5">
                  {['Appraisal Report', 'Title Commitment', 'Final Closing Disclosure', 'Insurance Binder'].map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm">📄</span>
                      <span className="text-xs text-gray-700 flex-1">{doc}</span>
                      <button className="text-xs text-indigo-600 font-medium hover:text-indigo-800">Download</button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bid form */}
              {!bidSubmitted ? (
                <form onSubmit={submitBid}>
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Submit Bid</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                        <input type="number" value={bidAmount} onChange={e=>setBidAmount(e.target.value)} placeholder={selectedLoan.amount.toLocaleString()} className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm">
                        Place Bid
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <div className="font-bold text-emerald-800">Bid Submitted!</div>
                  <div className="text-xs text-emerald-600 mt-1">You'll be notified when a decision is made.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
