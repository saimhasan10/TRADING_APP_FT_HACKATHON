import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  PieChart,
  Wallet,
  Receipt,
  FileCheck,
  LifeBuoy,
  Bell,
  Bot,
  User,
  Shield,
  Layers,
  Users,
  CheckSquare,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Radio,
  FileText,
  Server,
  Sliders,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  portalMode?: 'user' | 'admin';
  setPortalMode?: (mode: 'user' | 'admin') => void;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChecklist?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalMode: propPortalMode,
  setPortalMode: propSetPortalMode,
  isOpen = false,
  onClose = () => {},
  onOpenChecklist,
}) => {
  const {
    state,
    currentUser,
    activeTab,
    setActiveTab,
    activeAdminTab,
    setActiveAdminTab,
    portalMode: ctxPortalMode,
    setPortalMode: ctxSetPortalMode,
  } = useSimulation();

  const activePortalMode = propPortalMode || (ctxPortalMode?.toLowerCase() as 'user' | 'admin') || 'user';
  const handleSetPortalMode = (mode: 'user' | 'admin') => {
    if (propSetPortalMode) propSetPortalMode(mode);
    if (ctxSetPortalMode) ctxSetPortalMode(mode.toUpperCase() as any);
  };

  const isAdminRole = ['SUPER_ADMIN', 'FINANCIAL_REVIEWER', 'KYC_REVIEWER', 'SUPPORT_AGENT'].includes(currentUser.role);

  // Counters for review queue badges
  const pendingKYC = state.verifications.filter((v) => v.status === 'PENDING').length;
  const pendingDeposits = state.deposits.filter((d) => d.status === 'REVIEW_REQUIRED' || d.status === 'PENDING').length;
  const pendingWithdrawals = state.withdrawals.filter((w) => w.status === 'PENDING').length;
  const openTickets = state.tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_REVIEW').length;
  const totalReviews = pendingKYC + pendingDeposits + pendingWithdrawals + openTickets;
  const unreadNotifs = state.notifications.filter((n) => !n.read).length;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    isSpecial?: boolean;
    count?: number;
    badge?: string;
    badgeColor?: string;
  }

  const userNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'trading', label: 'Trading', icon: LineChart },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { 
      id: 'verification', 
      label: 'Verification', 
      icon: FileCheck, 
      badge: currentUser.verificationStatus === 'VERIFIED' ? undefined : currentUser.verificationStatus,
      badgeColor: currentUser.verificationStatus === 'PENDING' ? 'amber' : 'slate' 
    },
    { id: 'support', label: 'Support', icon: LifeBuoy, count: openTickets > 0 ? openTickets : undefined },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifs > 0 ? unreadNotifs : undefined },
    { id: 'ai', label: 'AI Assistant', icon: Bot, isSpecial: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'overview', label: 'Operations Overview', icon: LayoutDashboard },
    { id: 'reviews', label: 'Review Queue', icon: Layers, count: totalReviews > 0 ? totalReviews : undefined },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'kyc', label: 'KYC Reviews', icon: FileCheck, count: pendingKYC > 0 ? pendingKYC : undefined },
    { id: 'deposits', label: 'Deposit Reviews', icon: ArrowDownLeft, count: pendingDeposits > 0 ? pendingDeposits : undefined },
    { id: 'withdrawals', label: 'Withdrawal Reviews', icon: ArrowUpRight, count: pendingWithdrawals > 0 ? pendingWithdrawals : undefined },
    { id: 'trades', label: 'Trade Records', icon: History },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy, count: openTickets > 0 ? openTickets : undefined },
    { id: 'feed', label: 'Assets & Market Feed', icon: Radio },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'system', label: 'System Status', icon: Server },
    { id: 'scenarios', label: 'Scenario Control Center', icon: Sliders, isSpecial: true },
    { id: 'checklist', label: 'Demo Checklist', icon: CheckCircle2 },
  ];

  const navItems = activePortalMode === 'user' ? userNavItems : adminNavItems;
  const currentActive = activePortalMode === 'user' ? activeTab : activeAdminTab;

  const isItemActive = (itemId: string) => {
    if (currentActive === itemId) return true;
    if (itemId === 'overview' && (currentActive === 'dashboard' || currentActive === 'overview')) return true;
    if (itemId === 'ai' && (currentActive === 'ai' || currentActive === 'ai-assistant')) return true;
    if (itemId === 'feed' && (currentActive === 'feed' || currentActive === 'market-feed')) return true;
    return false;
  };

  const setTab = (id: string) => {
    if (activePortalMode === 'user') {
      setActiveTab(id);
    } else {
      if (id === 'checklist') {
        if (onOpenChecklist) onOpenChecklist();
      }
      setActiveAdminTab(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Header in Drawer */}
          <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-white">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>MacroBex Navigation</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Portal Switch on Mobile */}
          {isAdminRole && (
            <div className="flex lg:hidden items-center p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4">
              <button
                onClick={() => {
                  handleSetPortalMode('user');
                  onClose();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all ${
                  activePortalMode === 'user' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Trader Portal
              </button>
              <button
                onClick={() => {
                  handleSetPortalMode('admin');
                  onClose();
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all ${
                  activePortalMode === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                Admin Ops
              </button>
            </div>
          )}

          {/* Mode label */}
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>{activePortalMode === 'user' ? 'Trader Navigation' : 'Administrative Operations'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${activePortalMode === 'user' ? 'bg-emerald-950 text-emerald-400' : 'bg-purple-950 text-purple-400'}`}>
              {activePortalMode.toUpperCase()}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    onClose?.();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? activePortalMode === 'user'
                        ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40'
                        : 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-950/40'
                      : item.isSpecial
                      ? 'text-purple-300 hover:bg-purple-950/30 hover:text-white'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isSpecial ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.badgeColor === 'amber'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card: Current Session & Security Status */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-[11px] font-medium">Simulation Session</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-slate-200 font-semibold truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Role: {currentUser.role}</div>

            {currentUser.isRestricted && (
              <div className="mt-2 p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-[10px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                ACCOUNT RESTRICTED
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
