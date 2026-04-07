import React, { useState } from 'react'

const sidebarItems = [
  { icon: '📋', label: 'My Queue', href: '/underwriter/queue' },
  { icon: '🔬', label: 'Active Reviews', href: '#', active: true, badge: 3 },
  { icon: '📊', label: 'Reports', href: '/underwriter/reports' },
  { icon: '⚙️', label: 'Settings', href: '/underwriter/settings' },
]

const documents = [
  { id: '1', name: 'Bank Statement — Chase — Dec 2024.pdf', type: 'Bank Statement', aiConf: 0.98, size: '2.4 MB', status: 'ACCEPTED' },
  { id: '2', name: 'Federal Tax Return 2023 — Vasquez.pdf', type: 'Personal Tax Return', aiConf: 0.96, size: '1.1 MB', status: 'ACCEPTED' },
  { id: '3', name: 'Purchase Agreement — 847 Elm St.pdf', type: 'Purchase Agreement', aiConf: 0.94, size: '890 KB', status: 'ACCEPTED' },
  { id: '4', name: 'Appraisal Report — 847 Elm St.pdf', type: 'Appraisal Report', aiConf: 0.99, size: '4.2 MB', status: 'ACCEPTED' },
  { id: '5', name: 'LLC Operating Agreement.pdf', type: 'Entity Document', aiConf: 0.91, size: '560 KB', status: 'PENDING' },
]

const riskScores = [
  { label: 'LTV', score: 72, max: 80, category: 'Property', color: 'amber' },
  { label: 'DSCR', score: 85, max: 100, category: 'Income', color: 'emerald' },
  { label: 'Credit Profile', score: 68, max: 100, category: 'Borrower', color: 'amber' },
  { label: 'Property Quality', score: 78, max: 100, category: 'Property', color: 'sky' },
  { label: 'Market Risk', score: 81, max: 100, category: 'Market', color: 'emerald' },
  { label: 'Liquidity', score: 74, max: 100, category: 'Borrower', color: 'amber' },
]

const conditions = [
  { id: 'c1', type: 'Income Verification', desc: 'Provide 12 months bank statements showing rental deposits', status: 'OPEN', party: 'BORROWER', due: 'Apr 10' },
  { id: 'c2', type: 'Entity Documents', desc: 'Provide full LLC operating agreement executed within 2 years', status: 'OPEN', party: 'BROKER', due: 'Apr 10' },
  { id: 'c3', type: 'Appraisal', desc: 'Desk review appraisal received and reviewed — value supports LTV', status: 'SATISFIED', party: 'TITLE', due: null },
]

const conditionColors = { OPEN: 'bg-amber-100 text-amber-700', SATISFIED: 'bg-emerald-100 text-emerald-700', WAIVED: 'bg-gray-100 text-gray-600' }
const scoreColor = (s) => s >= 80 ? 'bg-emerald-500' : s >= 65 ? 'bg-amber-500' : 'bg-red-500'
const scoreText = (s) => s >= 80 ? 'text-emerald-700' : s >= 65 ? 'text-amber-700' : 'text-red-700'

export default function UnderwriterWorkspace() {
  const [activeTab, setActiveTab] = useState('ai-report')
  const [selectedDoc, setSelectedDoc] = useState(documents[0])
  const [decision, setDecision] = useState('')
  const [decisionNote, setDecisionNote] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [showDecisionPanel, setShowDecisionPanel] = useState(false)
  const [showAddCondition, setShowAddCondition] = useState(false)
  const [conditionsList, setConditionsList] = useState(conditions)
  const [newCondDesc, setNewCondDesc] = useState('')
  const [newCondType, setNewCondType] = useState('')
  const [newCondParty, setNewCondParty] = useState('BORROWER')

  const aiCompositeScore = 76

  function addCondition() {
    if (!newCondDesc || !newCondType) return
    setConditionsList([...conditionsList, { id: `c${Date.now()}`, type: newCondType, desc: newCondDesc, status: 'OPEN', party: newCondParty, due: null }])
    setNewCondDesc(''); setNewCondType(''); setShowAddCondition(false)
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-indigo-900 flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-xs">CF</span>
            </div>
            <span className="text-white text-base font-black">CapitalFlow</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {sidebarItems.map((item, i) => (
            <a key={i} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${item.active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>}
            </a>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-400 flex items-center justify-center text-xs font-bold text-white">SM</div>
            <div>
              <div className="text-white text-xs font-medium">Sarah Martinez</div>
              <div className="text-indigo-300 text-xs">Underwriter</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 flex-shrink-0 gap-4">
          <div>
            <span className="text-xs text-gray-500">Underwriting</span>
            <span className="text-xs text-gray-400 mx-1">›</span>
            <span className="text-xs font-semibold text-gray-900">CF-2025-00142</span>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">IN_REVIEW</span>
            <span className="text-xs text-gray-500">Bridge Loan • $1,200,000 • 847 Elm Street, Austin TX</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">AI Score:</span>
            <span className={`text-sm font-black ${scoreText(aiCompositeScore)}`}>{aiCompositeScore}/100</span>
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded">Manual Review</span>
            <button onClick={() => setShowDecisionPanel(true)} className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              Issue Decision
            </button>
          </div>
        </header>

        {/* Split pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Document viewer */}
          <div className="w-2/5 flex flex-col border-r border-gray-200 bg-white">
            {/* Doc list */}
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Loan Documents ({documents.length})</h3>
              <div className="space-y-1">
                {documents.map((doc) => (
                  <button key={doc.id} onClick={() => setSelectedDoc(doc)} className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${selectedDoc.id === doc.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
                    <span className="text-base">📄</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.type} · {doc.size}</div>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${doc.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {doc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document preview area */}
            <div className="flex-1 p-4 overflow-auto bg-gray-100">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-full p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{selectedDoc.name}</div>
                    <div className="text-xs text-gray-500">AI Classification: <strong>{selectedDoc.type}</strong> · Confidence: <strong>{Math.round(selectedDoc.aiConf * 100)}%</strong></div>
                  </div>
                </div>
                {/* Mock PDF content */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded w-full mt-4"></div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-2 mt-4">
                    <span className="text-xs font-semibold text-emerald-700">AI Extraction: </span>
                    <span className="text-xs text-emerald-700">Account ending 4821 · Avg. monthly balance $48,200 · 12-month average deposits $14,650/mo</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-20 bg-gray-100 rounded w-full mt-4 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">[ PDF page content ]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Analysis panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white flex px-4">
              {[
                { id: 'ai-report', label: '🤖 AI Report' },
                { id: 'conditions', label: '📋 Conditions', count: conditionsList.filter(c=>c.status==='OPEN').length },
                { id: 'loan-data', label: '📝 Loan Data' },
                { id: 'notes', label: '🗒️ UW Notes' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab.label}
                  {tab.count > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 rounded-full font-bold">{tab.count}</span>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* AI Report Tab */}
              {activeTab === 'ai-report' && (
                <div className="space-y-4">
                  {/* Composite score */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-indigo-900">AI Composite Score</h3>
                      <span className={`text-2xl font-black ${scoreText(aiCompositeScore)}`}>{aiCompositeScore}/100</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full mb-2">
                      <div className={`h-3 rounded-full ${scoreColor(aiCompositeScore)}`} style={{width:`${aiCompositeScore}%`}}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-700 font-semibold bg-amber-100 px-2 py-0.5 rounded">Recommendation: MANUAL REVIEW</span>
                      <span className="text-xs text-gray-500">Analyzed Apr 6, 2025 · 9:14 AM</span>
                    </div>
                  </div>

                  {/* Risk scores breakdown */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-3">Risk Score Breakdown</h3>
                    <div className="space-y-2.5">
                      {riskScores.map((rs, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-24 text-xs text-gray-600 font-medium">{rs.label}</div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full">
                            <div className={`h-2 rounded-full ${scoreColor(rs.score)}`} style={{width:`${rs.score}%`}}></div>
                          </div>
                          <div className={`w-8 text-xs font-bold text-right ${scoreText(rs.score)}`}>{rs.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-3">AI Analysis & Reasoning</h3>
                    <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                      <p><strong>Strengths:</strong> Strong DSCR at 1.42x — rental income comfortably covers debt service. Property in Austin's 78704 zip code shows 7.2% YoY appreciation per market data. Appraisal value of $1,680,000 supports LTV of 71.4%.</p>
                      <p><strong>Concerns:</strong> Borrower's credit profile shows one 30-day late in the past 18 months. Liquid assets of $87,000 provide limited post-close reserves. Entity documents are pending — cannot confirm borrower control structure.</p>
                      <p><strong>Suggested conditions:</strong> (1) Satisfactory entity documentation; (2) 6 months reserves verification; (3) Written explanation of 30-day late.</p>
                    </div>
                  </div>

                  {/* Draft Credit Memo */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">Draft Credit Memo (AI Generated)</h3>
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit in Decision →</button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 leading-relaxed font-mono">
                      LOAN: CF-2025-00142 | PROGRAM: Bridge | AMOUNT: $1,200,000<br/>
                      PROPERTY: 847 Elm St, Austin TX 78704 | LTV: 71.4%<br/>
                      BORROWER: Robert Vasquez / Vasquez Holdings LLC<br/><br/>
                      ANALYSIS SUMMARY: This bridge loan request is supported by strong rental income (DSCR 1.42x) and a quality Austin property with recent appreciation. Primary concerns are limited post-close liquidity and pending entity documentation. Recommend conditional approval subject to satisfactory resolution of open conditions...
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions Tab */}
              {activeTab === 'conditions' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">{conditionsList.length} Conditions</h3>
                    <button onClick={() => setShowAddCondition(!showAddCondition)} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">+ Add Condition</button>
                  </div>

                  {showAddCondition && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-indigo-900">New Condition</h4>
                      <input value={newCondType} onChange={e=>setNewCondType(e.target.value)} placeholder="Condition type (e.g. Income Verification)" className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <textarea value={newCondDesc} onChange={e=>setNewCondDesc(e.target.value)} placeholder="Condition description..." rows={2} className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <div className="flex gap-2">
                        <select value={newCondParty} onChange={e=>setNewCondParty(e.target.value)} className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg text-xs focus:outline-none">
                          <option value="BORROWER">Borrower</option>
                          <option value="BROKER">Broker</option>
                          <option value="TITLE">Title</option>
                        </select>
                        <button onClick={addCondition} className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">Save</button>
                        <button onClick={()=>setShowAddCondition(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>
                      </div>
                    </div>
                  )}

                  {conditionsList.map((cond) => (
                    <div key={cond.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-700">{cond.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[cond.status]}`}>{cond.status}</span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{cond.party}</span>
                          </div>
                          <p className="text-xs text-gray-600">{cond.desc}</p>
                          {cond.due && <p className="text-xs text-amber-600 mt-1">Due: {cond.due}</p>}
                        </div>
                        {cond.status === 'OPEN' && (
                          <button onClick={() => setConditionsList(conditionsList.map(c => c.id===cond.id ? {...c, status:'SATISFIED'} : c))} className="flex-shrink-0 text-xs text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            ✓ Satisfy
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loan Data Tab */}
              {activeTab === 'loan-data' && (
                <div className="space-y-4">
                  {[
                    { title: 'Loan Details', fields: [['Program','Bridge Loan'],['Loan Amount','$1,200,000'],['Purpose','Acquisition'],['LTV','71.4%'],['Term','12 months'],['Rate','9.75%']] },
                    { title: 'Property', fields: [['Address','847 Elm Street, Austin TX 78704'],['Type','Single-Family Investment'],['Value','$1,680,000'],['Occupancy','Investment'],['Flood Zone','Zone X']] },
                    { title: 'Borrower', fields: [['Name','Robert Vasquez'],['Entity','Vasquez Holdings LLC'],['Annual Income','$215,000'],['Liquid Assets','$87,000'],['Monthly Liabilities','$4,200']] },
                  ].map((section, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-3">{section.title}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {section.fields.map(([label, value], j) => (
                          <div key={j} className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="text-xs text-gray-500">{label}</div>
                            <div className="text-sm font-semibold text-gray-900">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    Internal notes are only visible to underwriting staff. Not shared with broker or borrower.
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-2">Apr 5, 2025 · Sarah Martinez</div>
                    <p className="text-sm text-gray-700">Reviewed appraisal — comp selection looks reasonable for the area. Austin 78704 has strong fundamentals. Main concern is the pending LLC docs. Will wait for those before issuing decision.</p>
                  </div>
                  <textarea placeholder="Add internal note..." rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Save Note</button>
                </div>
              )}
            </div>

            {/* Decision panel (always visible at bottom) */}
            {showDecisionPanel && (
              <div className="border-t border-gray-200 bg-white p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Issue Credit Decision</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { value: 'APPROVED', label: 'Approve', color: 'emerald' },
                    { value: 'CONDITIONALLY_APPROVED', label: 'Conditional', color: 'amber' },
                    { value: 'DECLINED', label: 'Decline', color: 'red' },
                    { value: 'SUSPENDED', label: 'Suspend', color: 'gray' },
                  ].map(d => (
                    <button key={d.value} onClick={() => setDecision(d.value)} className={`py-2 px-3 rounded-lg text-xs font-bold border-2 transition-all ${decision===d.value ? `border-${d.color}-500 bg-${d.color}-50 text-${d.color}-700` : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {decision && decision !== 'APPROVED' && (
                  <textarea value={overrideReason} onChange={e=>setOverrideReason(e.target.value)} placeholder="Override reason (required when decision differs from AI recommendation)..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" />
                )}
                <textarea value={decisionNote} onChange={e=>setDecisionNote(e.target.value)} placeholder="Decision notes..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3" />
                <div className="flex gap-2">
                  <button disabled={!decision} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${decision ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    Submit Decision {decision ? `— ${decision.replace('_',' ')}` : ''}
                  </button>
                  <button onClick={() => setShowDecisionPanel(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 border border-gray-200">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
