import React, { useState } from 'react'

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', href: '/admin/dashboard' },
  { icon: '👥', label: 'User Management', active: true, href: '/admin/users' },
  { icon: '📋', label: 'Loan Assignment', href: '/admin/loans' },
  { icon: '⚙️', label: 'Platform Config', href: '/admin/config' },
]

const initialUsers = [
  { id: '1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@apexcapital.com', role: 'BROKER', company: 'Apex Capital Group', isActive: true, lastLogin: '2h ago', loans: 24 },
  { id: '2', firstName: 'Sarah', lastName: 'Martinez', email: 'sarah.m@capitalflow.io', role: 'UNDERWRITER', company: 'CapitalFlow', isActive: true, lastLogin: '1h ago', loans: 8 },
  { id: '3', firstName: 'David', lastName: 'Okafor', email: 'd.okafor@meridiancredit.com', role: 'INVESTOR', company: 'Meridian Credit Fund', isActive: true, lastLogin: '3d ago', loans: null },
  { id: '4', firstName: 'Michael', lastName: 'Torres', email: 'm.torres@apexcapital.com', role: 'BROKER', company: 'Apex Capital Group', isActive: true, lastLogin: '5h ago', loans: 11 },
  { id: '5', firstName: 'Jennifer', lastName: 'Walsh', email: 'jwalsh@walshlending.com', role: 'BROKER', company: 'Walsh Lending Partners', isActive: false, lastLogin: '14d ago', loans: 3 },
  { id: '6', firstName: 'Marcus', lastName: 'Reyes', email: 'm.reyes@capitalflow.io', role: 'TITLE', company: 'CapitalFlow', isActive: true, lastLogin: '4h ago', loans: null },
  { id: '7', firstName: 'Linda', lastName: 'Park', email: 'l.park@capitalflow.io', role: 'UNDERWRITER', company: 'CapitalFlow', isActive: true, lastLogin: '30m ago', loans: 5 },
  { id: '8', firstName: 'James', lastName: 'Admin', email: 'james@capitalflow.io', role: 'ADMIN', company: 'CapitalFlow', isActive: true, lastLogin: '15m ago', loans: null },
]

const roleColors = {
  BROKER: 'bg-indigo-100 text-indigo-700',
  UNDERWRITER: 'bg-violet-100 text-violet-700',
  TITLE: 'bg-teal-100 text-teal-700',
  INVESTOR: 'bg-emerald-100 text-emerald-700',
  BORROWER: 'bg-sky-100 text-sky-700',
  ADMIN: 'bg-red-100 text-red-700',
}

function UserModal({ mode, user, onSave, onClose }) {
  const [form, setForm] = useState(user || { firstName: '', lastName: '', email: '', role: 'BROKER', company: '', isActive: true })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required'
    if (!form.role) errs.role = 'Required'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{mode === 'add' ? 'Add New User' : 'Edit User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
              <input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
              <input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {['BROKER','UNDERWRITER','TITLE','INVESTOR','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
            <input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company name (optional)" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {mode === 'edit' && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Account active</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
              {mode === 'add' ? 'Create User' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="px-6 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
          </div>
          {mode === 'edit' && (
            <button type="button" className="w-full text-xs text-amber-600 hover:text-amber-800 font-medium py-1">Send Password Reset Email</button>
          )}
        </form>
      </div>
    </div>
  )
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalMode, setModalMode] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email} ${u.company}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = !filterRole || u.role === filterRole
    const matchStatus = !filterStatus || (filterStatus === 'active' ? u.isActive : !u.isActive)
    return matchSearch && matchRole && matchStatus
  })

  function handleSave(form) {
    if (modalMode === 'add') {
      setUsers([...users, { ...form, id: String(Date.now()), lastLogin: 'Never', loans: null }])
    } else {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...form } : u))
    }
    setModalMode(null); setEditingUser(null)
  }

  function toggleActive(id) {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u))
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
        <div className="px-3 py-2">
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-1.5 text-center">
            <span className="text-red-200 text-xs font-bold">ADMIN</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {sidebarItems.map((item, i) => (
            <a key={i} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${item.active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}>
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-indigo-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-400 flex items-center justify-center text-xs font-bold text-white">JA</div>
            <div>
              <div className="text-white text-xs font-medium">James Admin</div>
              <div className="text-indigo-300 text-xs">Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0 justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">User Management</h1>
            <p className="text-xs text-gray-500">{users.filter(u=>u.isActive).length} active users · {users.length} total</p>
          </div>
          <button onClick={() => setModalMode('add')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
            <span>+</span> Add User
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, company..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Roles</option>
              {['BROKER','UNDERWRITER','TITLE','INVESTOR','ADMIN'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Name', 'Email', 'Role', 'Company', 'Status', 'Last Login', 'Active Loans', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{user.company || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{user.lastLogin}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{user.loans !== null ? user.loans : '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditingUser(user); setModalMode('edit') }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">Edit</button>
                        <button onClick={() => toggleActive(user.id)} className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${user.isActive ? 'text-red-500 hover:bg-red-50 hover:text-red-700' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No users match your search</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {modalMode && (
        <UserModal
          mode={modalMode}
          user={modalMode === 'edit' ? editingUser : null}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setEditingUser(null) }}
        />
      )}
    </div>
  )
}
