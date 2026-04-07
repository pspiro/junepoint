import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import AppShell from './components/layout/AppShell';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import SignUpPage from './pages/public/SignUpPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import MagicLinkPage from './pages/public/MagicLinkPage';

// Broker pages
import BrokerDashboard from './pages/broker/BrokerDashboard';
import PipelinePage from './pages/broker/PipelinePage';
import LoanDetailPage from './pages/broker/LoanDetailPage';
import NewLoanPage from './pages/broker/NewLoanPage';
import BrokerDocumentsPage from './pages/broker/BrokerDocumentsPage';
import BrokerMessagesPage from './pages/broker/BrokerMessagesPage';

// Borrower pages
import BorrowerDashboard from './pages/borrower/BorrowerDashboard';
import PersonalInfoPage from './pages/borrower/PersonalInfoPage';
import BorrowerDocumentsPage from './pages/borrower/BorrowerDocumentsPage';
import ClosingReviewPage from './pages/borrower/ClosingReviewPage';

// Underwriter pages
import UWQueuePage from './pages/underwriter/UWQueuePage';
import UWWorkspacePage from './pages/underwriter/UWWorkspacePage';
import ConditionsPage from './pages/underwriter/ConditionsPage';
import CreditMemoPage from './pages/underwriter/CreditMemoPage';

// Title pages
import TitleDashboard from './pages/title/TitleDashboard';
import ClosingCoordinatorPage from './pages/title/ClosingCoordinatorPage';
import TitleDocumentsPage from './pages/title/TitleDocumentsPage';
import PostClosingPage from './pages/title/PostClosingPage';

// Investor pages
import InvestorDashboard from './pages/investor/InvestorDashboard';
import MarketplacePage from './pages/investor/MarketplacePage';
import DataRoomPage from './pages/investor/DataRoomPage';
import PortfolioPage from './pages/investor/PortfolioPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import LoanAssignmentPage from './pages/admin/LoanAssignmentPage';
import PlatformConfigPage from './pages/admin/PlatformConfigPage';

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/" replace />;
  const roleHome: Record<string, string> = {
    BROKER: '/broker/dashboard',
    BORROWER: '/borrower/dashboard',
    UNDERWRITER: '/underwriter/queue',
    TITLE: '/title/dashboard',
    INVESTOR: '/investor/dashboard',
    ADMIN: '/admin/dashboard',
  };
  return <Navigate to={roleHome[user.role] || '/'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/magic/:token" element={<MagicLinkPage />} />
        <Route path="/app" element={<RoleRedirect />} />

        {/* Authenticated shell */}
        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          {/* Broker */}
          <Route path="/broker/dashboard" element={<RequireAuth roles={['BROKER']}><BrokerDashboard /></RequireAuth>} />
          <Route path="/broker/pipeline" element={<RequireAuth roles={['BROKER']}><PipelinePage /></RequireAuth>} />
          <Route path="/broker/loans/new" element={<RequireAuth roles={['BROKER']}><NewLoanPage /></RequireAuth>} />
          <Route path="/broker/loans/:loanId" element={<RequireAuth roles={['BROKER']}><LoanDetailPage /></RequireAuth>} />
          <Route path="/broker/documents" element={<RequireAuth roles={['BROKER']}><BrokerDocumentsPage /></RequireAuth>} />
          <Route path="/broker/messages" element={<RequireAuth roles={['BROKER']}><BrokerMessagesPage /></RequireAuth>} />

          {/* Borrower */}
          <Route path="/borrower/dashboard" element={<RequireAuth roles={['BORROWER']}><BorrowerDashboard /></RequireAuth>} />
          <Route path="/borrower/profile" element={<RequireAuth roles={['BORROWER']}><PersonalInfoPage /></RequireAuth>} />
          <Route path="/borrower/documents" element={<RequireAuth roles={['BORROWER']}><BorrowerDocumentsPage /></RequireAuth>} />
          <Route path="/borrower/closing" element={<RequireAuth roles={['BORROWER']}><ClosingReviewPage /></RequireAuth>} />

          {/* Underwriter */}
          <Route path="/underwriter/queue" element={<RequireAuth roles={['UNDERWRITER']}><UWQueuePage /></RequireAuth>} />
          <Route path="/underwriter/loans/:loanId" element={<RequireAuth roles={['UNDERWRITER']}><UWWorkspacePage /></RequireAuth>} />
          <Route path="/underwriter/loans/:loanId/conditions" element={<RequireAuth roles={['UNDERWRITER']}><ConditionsPage /></RequireAuth>} />
          <Route path="/underwriter/loans/:loanId/decision" element={<RequireAuth roles={['UNDERWRITER']}><CreditMemoPage /></RequireAuth>} />

          {/* Title */}
          <Route path="/title/dashboard" element={<RequireAuth roles={['TITLE']}><TitleDashboard /></RequireAuth>} />
          <Route path="/title/loans/:loanId" element={<RequireAuth roles={['TITLE']}><ClosingCoordinatorPage /></RequireAuth>} />
          <Route path="/title/documents" element={<RequireAuth roles={['TITLE']}><TitleDocumentsPage /></RequireAuth>} />
          <Route path="/title/loans/:loanId/post-closing" element={<RequireAuth roles={['TITLE']}><PostClosingPage /></RequireAuth>} />

          {/* Investor */}
          <Route path="/investor/dashboard" element={<RequireAuth roles={['INVESTOR']}><InvestorDashboard /></RequireAuth>} />
          <Route path="/investor/marketplace" element={<RequireAuth roles={['INVESTOR']}><MarketplacePage /></RequireAuth>} />
          <Route path="/investor/marketplace/:loanId" element={<RequireAuth roles={['INVESTOR']}><DataRoomPage /></RequireAuth>} />
          <Route path="/investor/portfolio" element={<RequireAuth roles={['INVESTOR']}><PortfolioPage /></RequireAuth>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<RequireAuth roles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth roles={['ADMIN']}><UserManagementPage /></RequireAuth>} />
          <Route path="/admin/loans" element={<RequireAuth roles={['ADMIN']}><LoanAssignmentPage /></RequireAuth>} />
          <Route path="/admin/config" element={<RequireAuth roles={['ADMIN']}><PlatformConfigPage /></RequireAuth>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
