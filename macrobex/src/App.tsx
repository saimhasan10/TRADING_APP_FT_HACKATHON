import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// User Views
import { UserDashboardView } from './views/user/UserDashboardView';
import { MarketsView } from './views/user/MarketsView';
import { TradingView } from './views/user/TradingView';
import { PortfolioView } from './views/user/PortfolioView';
import { WalletView } from './views/user/WalletView';
import { TransactionsView } from './views/user/TransactionsView';
import { VerificationView } from './views/user/VerificationView';
import { SupportView } from './views/user/SupportView';
import { NotificationsView } from './views/user/NotificationsView';
import { AIAssistantView } from './views/user/AIAssistantView';
import { ProfileView } from './views/user/ProfileView';

// Admin Views
import { AdminOverviewView } from './views/admin/AdminOverviewView';
import { ReviewQueueView } from './views/admin/ReviewQueueView';
import { DepositReviewsView } from './views/admin/DepositReviewsView';
import { WithdrawalReviewsView } from './views/admin/WithdrawalReviewsView';
import { KYCReviewsView } from './views/admin/KYCReviewsView';
import { UsersAdminView } from './views/admin/UsersAdminView';
import { TradeRecordsView } from './views/admin/TradeRecordsView';
import { SupportTicketsAdminView } from './views/admin/SupportTicketsAdminView';
import { MarketFeedAdminView } from './views/admin/MarketFeedAdminView';
import { AuditLogsView } from './views/admin/AuditLogsView';
import { SystemStatusView } from './views/admin/SystemStatusView';
import { ScenarioControlCenterView } from './views/admin/ScenarioControlCenterView';

// Modals
import { IncidentReconstructionModal } from './views/admin/IncidentReconstructionModal';
import { DemoChecklistModal } from './views/admin/DemoChecklistModal';

// Icons
import { AlertCircle, History, CheckSquare, Sliders, ShieldAlert, Sparkles, User, Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    portalMode,
    activeTab,
    activeAdminTab,
    currentUser,
    isSuperAdmin,
    isStaff,
    setPortalMode,
    setCurrentUserById,
  } = useSimulation();

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Normalize portal mode check (case-insensitive)
  const isUserPortal = (portalMode || '').toLowerCase() === 'user';

  // Render active User View
  const renderUserView = () => {
    switch (activeTab) {
      case 'overview':
      case 'dashboard':
        return <UserDashboardView />;
      case 'markets':
        return <MarketsView />;
      case 'trading':
        return <TradingView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'wallet':
        return <WalletView />;
      case 'transactions':
        return <TransactionsView />;
      case 'verification':
        return <VerificationView />;
      case 'support':
        return <SupportView />;
      case 'notifications':
        return <NotificationsView />;
      case 'ai':
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <UserDashboardView />;
    }
  };

  // Render active Admin View with RBAC check
  const renderAdminView = () => {
    if (!isStaff) {
      return (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Portal Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your current persona (<strong className="text-white">{currentUser.name}</strong>) has role{' '}
            <strong className="text-amber-400">{currentUser.role}</strong>. Operations, treasury reviews, and audit logs require staff or Super Admin privileges.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setPortalMode('user')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Return to Trader Portal
            </button>
            <button
              onClick={() => {
                setCurrentUserById('admin-1');
              }}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-950/40"
            >
              Switch to Super Admin
            </button>
          </div>
        </div>
      );
    }

    switch (activeAdminTab) {
      case 'overview':
        return <AdminOverviewView />;
      case 'reviews':
        return <ReviewQueueView />;
      case 'deposits':
        return <DepositReviewsView />;
      case 'withdrawals':
        return <WithdrawalReviewsView />;
      case 'kyc':
        return <KYCReviewsView />;
      case 'users':
        return <UsersAdminView />;
      case 'trades':
        return <TradeRecordsView />;
      case 'support':
        return <SupportTicketsAdminView />;
      case 'feed':
      case 'market-feed':
        return <MarketFeedAdminView />;
      case 'audit':
        return <AuditLogsView />;
      case 'system':
        return <SystemStatusView />;
      case 'scenarios':
        return <ScenarioControlCenterView />;
      case 'checklist':
        return <AdminOverviewView />;
      default:
        return <AdminOverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Main Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenChecklist={() => setShowChecklistModal(true)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isUserPortal ? renderUserView() : renderAdminView()}
        </main>
      </div>

      {/* Floating Evaluation Toolbar */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
        <button
          onClick={() => setShowIncidentModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-800/60 text-xs font-semibold transition-all"
          title="Inspect end-to-end incident timeline"
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Reconstruct Incident</span>
        </button>

        <button
          onClick={() => setShowChecklistModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/60 text-xs font-semibold transition-all"
          title="30-Point Hackathon Checklist"
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">30-Pt Checklist</span>
        </button>

        <button
          onClick={() => {
            setPortalMode('admin');
            if (currentUser.role === 'USER') {
              setCurrentUserById('admin-1');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            (portalMode || '').toLowerCase() === 'admin'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Jump to Scenario Control Center"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scenario Hub</span>
        </button>
      </div>

      {/* Global Modals */}
      <IncidentReconstructionModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />

      <DemoChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
