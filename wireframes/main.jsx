import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import HomePage from './home.jsx'
import LoginPage from './login.jsx'
import BrokerDashboard from './broker-dashboard.jsx'
import BorrowerDashboard from './borrower-dashboard.jsx'
import UnderwriterWorkspace from './underwriter-workspace.jsx'
import InvestorMarketplace from './investor-marketplace.jsx'
import AdminUsers from './admin-users.jsx'

const pages = [
  { label: 'Home', component: HomePage },
  { label: 'Login', component: LoginPage },
  { label: 'Broker Dashboard', component: BrokerDashboard },
  { label: 'Borrower Dashboard', component: BorrowerDashboard },
  { label: 'Underwriter Workspace', component: UnderwriterWorkspace },
  { label: 'Investor Marketplace', component: InvestorMarketplace },
  { label: 'Admin: Users', component: AdminUsers },
]

function Viewer() {
  const [current, setCurrent] = useState(0)
  const Page = pages[current].component

  return (
    <div>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: '#1e293b', display: 'flex', alignItems: 'center',
        gap: '6px', padding: '8px 12px', flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>
        <span style={{ color: '#94a3b8', fontSize: '12px', marginRight: '6px', fontFamily: 'monospace' }}>
          WIREFRAMES
        </span>
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              padding: '4px 12px', borderRadius: '4px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: 500,
              background: i === current ? '#6366f1' : '#334155',
              color: i === current ? '#fff' : '#cbd5e1',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: '48px' }}>
        <Page />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<Viewer />)
