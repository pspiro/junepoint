import { Link } from 'react-router-dom';
import {
  Brain,
  Users,
  FileText,
  TrendingUp,
  ShieldCheck,
  Bell,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Building2,
  Landmark,
  Hammer,
  Home,
  BarChart3,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Underwriting',
    description: 'Automated risk scoring with composite AI analysis across LTV, DSCR, credit, and property factors. Get recommendations in seconds.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: Users,
    title: 'Multi-Portal Access',
    description: 'Dedicated portals for brokers, borrowers, underwriters, title agents, and investors — each tailored to their workflow.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'AI-powered document classification, OCR extraction, and status tracking. Never lose a document again.',
    color: 'bg-sky-100 text-sky-600',
  },
  {
    icon: TrendingUp,
    title: 'Investor Marketplace',
    description: 'Connect lenders with capital. Browse AI-scored loan opportunities, submit bids, and track your portfolio in real time.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: ShieldCheck,
    title: 'Audit Trail',
    description: 'Immutable event log for every action across the loan lifecycle. Stay compliant with full transparency.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    description: 'Push alerts for status changes, document uploads, messages, and conditions — keeping every stakeholder in the loop.',
    color: 'bg-rose-100 text-rose-600',
  },
];

const steps = [
  { number: '01', title: 'Broker Submits', description: 'Broker completes a guided 6-step loan wizard with property, borrower, and financial details.' },
  { number: '02', title: 'AI Analyzes', description: 'Our AI engine scores the loan across 5 risk dimensions within seconds and surfaces a recommendation.' },
  { number: '03', title: 'Underwriter Reviews', description: 'Underwriter reviews the AI report, conditions, and documents in a purpose-built workspace.' },
  { number: '04', title: 'Loan Closes', description: 'Title coordinates closing, documents are signed, and the loan funds — all tracked in one place.' },
];

const programs = [
  { icon: Building2, name: 'Bridge Loans', description: 'Short-term financing for acquisitions and refinances. Fast closings up to 80% LTV.', color: 'from-indigo-500 to-indigo-700', rate: '9.5–12%' },
  { icon: BarChart3, name: 'DSCR Loans', description: 'Qualify on cash flow, not personal income. Ideal for rental property investors.', color: 'from-emerald-500 to-emerald-700', rate: '7.5–10%' },
  { icon: Hammer, name: 'Fix & Flip', description: 'Up to 90% of purchase + 100% of rehab costs. Fast draws and flexible terms.', color: 'from-amber-500 to-amber-700', rate: '10–13%' },
  { icon: Home, name: 'Long-Term Rental', description: '30-year amortization for stabilized rental portfolios. Scale your holdings.', color: 'from-sky-500 to-sky-700', rate: '7–9.5%' },
  { icon: Landmark, name: 'Construction', description: 'Ground-up construction with milestone-based draws and interest-only payments.', color: 'from-purple-500 to-purple-700', rate: '11–14%' },
  { icon: Globe, name: 'Commercial', description: 'Mixed-use, retail, and office assets. Custom structures for complex deals.', color: 'from-rose-500 to-rose-700', rate: '8.5–12%' },
];

const stats = [
  { value: '$2.4B+', label: 'Capital Deployed' },
  { value: '12,000+', label: 'Loans Funded' },
  { value: '3.2 Days', label: 'Avg. Decision Time' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Sticky Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CapitalFlow</span>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1">LMS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#programs" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Programs</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Login</Link>
              <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(circle at 75% 20%, rgba(16,185,129,0.3) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-800/60 border border-indigo-700 rounded-full px-4 py-1.5 text-sm text-indigo-200 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Now with GPT-4 Powered AI Underwriting
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Private Lending,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-indigo-200 mb-10 leading-relaxed max-w-3xl mx-auto">
              The complete loan management platform for mortgage brokers. From submission to close — AI-powered, compliance-ready, and built for speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all backdrop-blur-sm"
              >
                Sign In <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> No credit card required</div>

              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> SOC 2 compliant</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Everything you need to lend faster</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">One platform for your entire lending operation — from origination to investor exit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">From submission to funding in a streamlined, AI-assisted workflow.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-indigo-100" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="relative text-center">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  {i < steps.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-indigo-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Loan Programs */}
      <section id="programs" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Loan Programs</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Support every deal type with purpose-built program templates and AI scoring models.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={program.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`bg-gradient-to-r ${program.color} p-6 flex items-center gap-4`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <program.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{program.name}</h3>
                    <div className="text-white/80 text-sm font-medium">{program.rate} rate range</div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-500 text-sm leading-relaxed">{program.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to modernize your lending operation?</h2>
          <p className="text-xl text-indigo-200 mb-8">Join hundreds of mortgage brokers already using CapitalFlow.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">CapitalFlow LMS</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm">© 2026 CapitalFlow. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
