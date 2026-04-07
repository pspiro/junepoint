import React, { useState } from 'react'

const loanStages = [
  { key: 'SUBMITTED', label: 'Application Submitted', done: true },
  { key: 'IN_REVIEW', label: 'Under Review', done: true },
  { key: 'CONDITIONALLY_APPROVED', label: 'Conditionally Approved', done: false, current: true },
  { key: 'APPROVED', label: 'Approved', done: false },
  { key: 'IN_CLOSING', label: 'In Closing', done: false },
  { key: 'CLOSED', label: 'Loan Closed', done: false },
]

const actionItems = [
  { id: '1', title: 'Upload W-2 for 2023', desc: 'Your underwriter requested your most recent W-2 to verify employment income.', type: 'upload', urgent: true },
  { id: '2', title: 'Provide 30-day late explanation', desc: 'Please provide a written explanation for the 30-day late payment from June 2024.', type: 'form', urgent: true },
  { id: '3', title: 'Verify your phone number', desc: 'A verification code has been sent to (512) 555-0182.', type: 'verify', urgent: false },
]

const documents = [
  { name: 'Bank Statement — Chase — Dec 2024', status: 'ACCEPTED', uploaded: 'Apr 3, 2025' },
  { name: 'Federal Tax Return 2023', status: 'ACCEPTED', uploaded: 'Apr 3, 2025' },
  { name: 'Pay Stub — March 2025', status: 'ACCEPTED', uploaded: 'Apr 4, 2025' },
  { name: 'W-2 2023', status: 'PENDING', uploaded: null },
  { name: 'Written Explanation Letter', status: 'PENDING', uploaded: null },
]

const docStatusConfig = {
  ACCEPTED: { label: 'Received ✓', classes: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'Re-upload needed', classes: 'bg-red-100 text-red-700' },
  PROCESSING: { label: 'Processing...', classes: 'bg-sky-100 text-sky-700' },
  PENDING: { label: 'Needed', classes: 'bg-amber-100 text-amber-700' },
}

export default function BorrowerDashboard() {
  const [dismissedItems, setDismissedItems] = useState([])
  const visibleActions = actionItems.filter(a => !dismissedItems.includes(a.id))
  const completedDocs = documents.filter(d => d.status === 'ACCEPTED').length
  const progress = Math.round((completedDocs / documents.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">CF</span>
            </div>
            <span className="font-black text-gray-900 text-lg">CapitalFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Hi, <strong>Robert</strong></span>
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-700">RV</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Loan Application</h1>
          <p className="text-gray-500 text-sm mt-1">Loan #CF-2025-00142 · 847 Elm Street, Austin TX · Bridge Loan $1,200,000</p>
        </div>

        {/* Progress tracker */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Application Status</h2>
            <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">Conditionally Approved</span>
          </div>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div className="h-0.5 bg-indigo-600 transition-all" style={{width: '40%'}}></div>
            </div>
            <div className="relative flex justify-between">
              {loanStages.map((stage, i) => (
                <div key={i} className="flex flex-col items-center" style={{width: `${100/loanStages.length}%`}}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 mb-2 ${stage.done ? 'bg-indigo-600 text-white' : stage.current ? 'bg-amber-500 text-white ring-4 ring-amber-200' : 'bg-gray-200 text-gray-400'}`}>
                    {stage.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs text-center leading-tight ${stage.current ? 'font-bold text-amber-700' : stage.done ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <strong>Almost there!</strong> Your loan is conditionally approved. Complete the action items below to move forward to closing.
          </div>
        </div>

        {/* Action Items */}
        {visibleActions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-gray-900">Action Items</h2>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{visibleActions.length} needed</span>
            </div>
            <div className="space-y-3">
              {visibleActions.map(item => (
                <div key={item.id} className={`rounded-xl p-4 border ${item.urgent ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${item.urgent ? 'bg-red-100' : 'bg-gray-200'}`}>
                      {item.type === 'upload' ? '📤' : item.type === 'form' ? '📝' : '🔐'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                      <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
                      <div className="flex gap-2 mt-3">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                          {item.type === 'upload' ? 'Upload Now' : item.type === 'form' ? 'Fill Out Form' : 'Verify'}
                        </button>
                        <button onClick={() => setDismissedItems([...dismissedItems, item.id])} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2">Dismiss</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Document Checklist</h2>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full">
                <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{width:`${progress}%`}}></div>
              </div>
              <span className="text-xs font-semibold text-gray-700">{completedDocs}/{documents.length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${doc.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {doc.status === 'ACCEPTED' ? '✓' : '!'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">{doc.name}</div>
                  {doc.uploaded && <div className="text-xs text-gray-400">Uploaded {doc.uploaded}</div>}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${docStatusConfig[doc.status].classes}`}>
                  {docStatusConfig[doc.status].label}
                </span>
                {doc.status === 'PENDING' && (
                  <button className="flex-shrink-0 text-xs text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition-colors">Upload</button>
                )}
              </div>
            ))}
          </div>
          <a href="/borrower/documents" className="mt-4 block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">Manage all documents →</a>
        </div>

        {/* Broker Contact */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-3">Your Broker</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-400 flex items-center justify-center text-white font-black">SC</div>
            <div>
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-sm text-gray-600">Apex Capital Group</div>
              <div className="text-sm text-indigo-600">sarah@apexcapital.com</div>
            </div>
            <div className="ml-auto">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">Send Message</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
