import React, { useState } from 'react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    { icon: '🤖', title: 'AI Underwriting', desc: 'Claude-powered risk scoring with web research for comps and market data. Get scored recommendations in minutes, not days.' },
    { icon: '🏛️', title: 'Multi-Portal Access', desc: 'Dedicated, role-specific portals for brokers, borrowers, underwriters, title clerks, and investors.' },
    { icon: '📁', title: 'Document Management', desc: 'AI classifies every uploaded document. Email intake routes attachments automatically to the right loan file.' },
    { icon: '📈', title: 'Investor Marketplace', desc: 'Closed loans are automatically listed for investor review. AI-matched to investor criteria. Bid and close in one place.' },
    { icon: '🛡️', title: 'Full Audit Trail', desc: 'Every action, decision, and AI recommendation is logged immutably. Built for fair lending compliance.' },
    { icon: '🔔', title: 'Real-Time Notifications', desc: 'Instant alerts when loan status changes, documents arrive, conditions are set, or messages are received.' },
  ]

  const steps = [
    { num: '01', title: 'Broker Submits', desc: 'Create the loan application, invite the borrower, upload documents. AI checks completeness instantly.' },
    { num: '02', title: 'AI Reviews', desc: 'Claude scores risk, researches the property, and produces a full credit analysis in minutes.' },
    { num: '03', title: 'Underwriter Decides', desc: 'Human underwriter reviews the AI report, sets conditions, and issues the credit decision.' },
    { num: '04', title: 'Investor Buys', desc: 'Closed loans are listed on the marketplace. Investors browse, review data rooms, and bid.' },
  ]

  const programs = [
    { name: 'Bridge Loan', desc: 'Short-term financing for property acquisitions while securing permanent financing.', color: 'indigo' },
    { name: 'DSCR', desc: 'Debt service coverage ratio loans based on rental income, not personal income.', color: 'emerald' },
    { name: 'Fix & Flip', desc: 'Renovation financing for investors acquiring and improving distressed properties.', color: 'amber' },
    { name: 'Long-Term Rental', desc: '30-year fixed or ARM products for stabilized single and multi-family rentals.', color: 'sky' },
    { name: 'Construction', desc: 'Draw-based financing for ground-up construction and major rehabilitation.', color: 'violet' },
    { name: 'Commercial', desc: 'Mixed-use, retail, office, and industrial bridge and term loans.', color: 'rose' },
  ]

  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    sky: 'bg-sky-100 text-sky-700 border-sky-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
  }

  const testimonials = [
    { quote: "CapitalFlow cut my loan processing time in half. The AI analysis catches things I used to spend hours reviewing manually.", name: "Marcus Chen", role: "Senior Mortgage Broker, Apex Capital Group" },
    { quote: "My borrowers love getting updates in real time. The borrower portal makes them feel in control of the process.", name: "Jennifer Walsh", role: "Broker, Walsh Lending Partners" },
    { quote: "The investor marketplace is a game changer. I can evaluate 20 loans in the time it used to take me to review one.", name: "David Okafor", role: "Managing Director, Meridian Credit Fund" },
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">CF</span>
              </div>
              <span className="text-xl font-black text-gray-900">CapitalFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#programs" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Loan Programs</a>
              <a href="#investors" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">For Investors</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/login" className="hidden md:block text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50">Login</a>
              <a href="/signup" className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">Get Started</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-500 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI-Powered Private Lending Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Private Lending,<br />
                <span className="text-emerald-400">Reimagined</span><br />
                with AI
              </h1>
              <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
                Originate faster. Underwrite smarter. Close with confidence. The only platform connecting brokers, underwriters, and investors in one AI-powered workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/signup" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg">
                  Start as a Broker →
                </a>
                <a href="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 transition-all text-lg">
                  I'm an Investor
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              {/* Mock dashboard screenshot */}
              <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 shadow-2xl p-4">
                <div className="bg-white rounded-xl shadow-inner p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <div className="flex-1 bg-gray-100 rounded h-5 ml-2"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['24 Active', '8 This Mo.', '5 Pending', '78 AI Score'].map((stat, i) => (
                      <div key={i} className={`rounded-lg p-2 text-center ${['bg-indigo-50','bg-emerald-50','bg-amber-50','bg-sky-50'][i]}`}>
                        <div className={`text-sm font-bold ${['text-indigo-700','text-emerald-700','text-amber-700','text-sky-700'][i]}`}>{stat}</div>
                      </div>
                    ))}
                  </div>
                  {['CF-2025-00142 • Bridge • $1.2M', 'CF-2025-00139 • DSCR • $650K', 'CF-2025-00136 • Fix & Flip • $380K'].map((loan, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-600">{loan}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${['bg-amber-100 text-amber-700','bg-emerald-100 text-emerald-700','bg-sky-100 text-sky-700'][i]}`}>
                        {['IN_REVIEW','APPROVED','SUBMITTED'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-indigo-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-indigo-800">
            {[
              { value: '2,400+', label: 'Loans Processed' },
              { value: '$1.2B', label: 'Capital Deployed' },
              { value: '4.2 Days', label: 'Avg. Time to Decision' },
            ].map((stat, i) => (
              <div key={i} className="text-center px-8 py-4">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-indigo-300 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need. Nothing you don't.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Built specifically for mortgage brokers, CapitalFlow eliminates the spreadsheets, email chains, and guesswork.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">From application to investor sale — in one platform</h2>
            <p className="text-lg text-gray-600">The entire lending lifecycle, automated and connected.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-300 to-indigo-100 z-0" style={{width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)'}}></div>
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-black text-lg">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Programs */}
      <section id="programs" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Six loan programs. One platform.</h2>
            <p className="text-lg text-gray-600">Originate any private lending product with purpose-built workflows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((p, i) => (
              <div key={i} className={`rounded-xl border p-5 ${colorMap[p.color]}`}>
                <h3 className="font-bold text-base mb-2">{p.name}</h3>
                <p className="text-sm leading-relaxed opacity-80">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="investors" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by brokers and investors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400">★</span>)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to modernize your lending operation?</h2>
          <p className="text-indigo-200 text-lg mb-8">Join hundreds of brokers and investors already on CapitalFlow.</p>
          <a href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg">
            Get Started Free →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
                  <span className="text-white font-black text-xs">CF</span>
                </div>
                <span className="text-white font-bold">CapitalFlow</span>
              </div>
              <p className="text-gray-400 text-sm">The AI-powered private lending platform.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Loan Programs', 'Integrations', 'Pricing'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Fair Lending Policy', 'Security'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2025 CapitalFlow LMS, Inc. All rights reserved.</p>
            <p className="text-gray-600 text-xs">Not a licensed lender. Platform services only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
