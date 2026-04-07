import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, FileText, Users, Settings, TrendingUp,
  Briefcase, Building2, ShieldCheck, ClipboardList, Store, LogOut
} from 'lucide-react';
import clsx from 'clsx';

const navByRole: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
  BROKER: [
    { label: 'Dashboard', href: '/broker/dashboard', icon: LayoutDashboard },
    { label: 'Pipeline', href: '/broker/pipeline', icon: TrendingUp },
    { label: 'Documents', href: '/broker/documents', icon: FileText },
    { label: 'Messages', href: '/broker/messages', icon: Briefcase },
  ],
  BORROWER: [
    { label: 'Dashboard', href: '/borrower/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/borrower/profile', icon: Users },
    { label: 'Documents', href: '/borrower/documents', icon: FileText },
    { label: 'Closing', href: '/borrower/closing', icon: ClipboardList },
  ],
  UNDERWRITER: [
    { label: 'Queue', href: '/underwriter/queue', icon: ClipboardList },
  ],
  TITLE: [
    { label: 'Dashboard', href: '/title/dashboard', icon: LayoutDashboard },
    { label: 'Documents', href: '/title/documents', icon: FileText },
  ],
  INVESTOR: [
    { label: 'Dashboard', href: '/investor/dashboard', icon: LayoutDashboard },
    { label: 'Marketplace', href: '/investor/marketplace', icon: Store },
    { label: 'Portfolio', href: '/investor/portfolio', icon: TrendingUp },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Loans', href: '/admin/loans', icon: Building2 },
    { label: 'Config', href: '/admin/config', icon: Settings },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const nav = (user?.role && navByRole[user.role]) || [];

  return (
    <aside className="w-64 bg-indigo-900 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-indigo-800">
        <span className="text-white font-bold text-xl tracking-tight">CapitalFlow</span>
        <span className="ml-2 text-indigo-300 text-xs font-medium">LMS</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              clsx('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <div className="mb-3 px-3">
          <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-indigo-300 text-xs">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-lg text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
