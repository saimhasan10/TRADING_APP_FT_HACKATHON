import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Activity, 
  Bell, 
  Bot, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  Menu,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onToggleSidebar?: () => void;
  portalMode?: 'user' | 'admin';
  setPortalMode?: (mode: 'user' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  portalMode: propPortalMode,
  setPortalMode: propSetPortalMode,
}) => {
  const {
    state,
    currentUser,
    currentAccountMode,
    setAccountMode,
    setCurrentUserById,
    logout,
    setActiveTab,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    portalMode: ctxPortalMode,
    setPortalMode: ctxSetPortalMode,
  } = useSimulation();

  const activePortalMode = propPortalMode || (ctxPortalMode?.toLowerCase() as 'user' | 'admin') || 'user';
  const handleSetPortalMode = (mode: 'user' | 'admin') => {
    if (propSetPortalMode) propSetPortalMode(mode);
    if (ctxSetPortalMode) ctxSetPortalMode(mode.toUpperCase() as any);
  };

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const unreadNotifications = state.notifications.filter((n) => !n.read);

  // Feed status badges
  const feedStyles: Record<string, { variant: 'emerald' | 'amber' | 'red' | 'slate'; label: string; ping: boolean }> = {
    LIVE: { variant: 'emerald', label: 'FEED: LIVE', ping: true },
    DELAYED: { variant: 'amber', label: 'FEED: DELAYED', ping: false },
    STALE: { variant: 'red', label: 'FEED: STALE', ping: false },
    OFFLINE: { variant: 'slate', label: 'FEED: OFFLINE', ping: false },
  };

  const currentFeed = feedStyles[state.systemStatus.feedStatus] || feedStyles.LIVE;

  const isAdminRole = ['SUPER_ADMIN', 'FINANCIAL_REVIEWER', 'KYC_REVIEWER', 'SUPPORT_AGENT'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle + Logo + Portal switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Macro<span className="text-emerald-400">Bex</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SIM
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 -mt-0.5 tracking-wide">
                Virtual Trading & Ops Portal
              </span>
            </div>
          </div>

          {/* Portal Switch (User vs Admin) */}
          {isAdminRole && (
            <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 ml-3">
              <button
                onClick={() => handleSetPortalMode('user')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activePortalMode === 'user'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Trader Portal
              </button>
              <button
                onClick={() => handleSetPortalMode('admin')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activePortalMode === 'admin'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin Ops
              </button>
            </div>
          )}
        </div>

        {/* Center: Account Mode Switcher (Main vs Demo) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setAccountMode('main')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentAccountMode === 'main'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentAccountMode === 'main' ? 'bg-white' : 'bg-emerald-500'}`} />
              <span>Main Account</span>
            </button>
            <button
              onClick={() => setAccountMode('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentAccountMode === 'demo'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentAccountMode === 'demo' ? 'bg-white' : 'bg-cyan-400'}`} />
              <span>Demo Account</span>
            </button>
          </div>

          {/* Market Feed Health Pill */}
          <div className="hidden xl:flex items-center">
            <Badge variant={currentFeed.variant} size="sm">
              <span className="flex items-center gap-1.5">
                {currentFeed.ping && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {!currentFeed.ping && <AlertCircle className="w-3 h-3 text-red-400" />}
                {currentFeed.label}
              </span>
            </Badge>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* AI Assistant Button */}
          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 text-xs font-semibold transition-all shadow-sm group"
          >
            <Bot className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Notifications</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {unreadNotifications.length} unread
                    </span>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 mt-2">
                  {state.notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">No notifications yet.</div>
                  ) : (
                    state.notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.linkTab) setActiveTab(notif.linkTab);
                          setNotifMenuOpen(false);
                        }}
                        className={`py-3 px-1 hover:bg-slate-800/40 rounded-lg cursor-pointer transition-colors ${
                          !notif.read ? 'bg-slate-800/25' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-slate-200">{notif.title}</h5>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Quick Switch */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-none truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-800 mb-2">
                  <div className="text-sm font-bold text-white">{currentUser.name}</div>
                  <div className="text-xs text-slate-400">{currentUser.email}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="purple" size="sm">{currentUser.role}</Badge>
                    <Badge variant={currentUser.verificationStatus === 'VERIFIED' ? 'emerald' : 'amber'} size="sm">
                      {currentUser.verificationStatus}
                    </Badge>
                  </div>
                </div>

                {/* Quick Persona Switcher for Hackathon Testing */}
                <div className="mb-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Quick Role Switch:
                  </div>
                  {state.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserById(u.id);
                        if (['SUPER_ADMIN', 'FINANCIAL_REVIEWER', 'KYC_REVIEWER', 'SUPPORT_AGENT'].includes(u.role)) {
                          handleSetPortalMode('admin');
                        } else {
                          handleSetPortalMode('user');
                        }
                        setProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.role}</div>
                      </div>
                      {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      resetDemoData();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-950/40 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Simulation Seed Data</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
